import { logger } from "@/lib/logger";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getOpenAI } from "@/lib/ai/client";
import {
  requireActiveSubscription,
  SubscriptionRequiredError,
} from "@/lib/billing/requireActiveSubscription";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = (user.publicMetadata?.orgId as string) || user.id;

    // ── Billing guard ──
    try {
      await requireActiveSubscription(orgId);
    } catch (error) {
      if (error instanceof SubscriptionRequiredError) {
        return NextResponse.json(
          { error: "subscription_required", message: "Active subscription required" },
          { status: 402 }
        );
      }
      throw error;
    }

    // ── Rate limit ──
    const rl = await checkRateLimit(user.id, "UPLOAD");
    if (!rl.success) {
      return NextResponse.json(
        {
          error: "rate_limit_exceeded",
          message: "Too many requests. Please try again later.",
          retryAfter: rl.reset,
        },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) },
        }
      );
    }

    const formData = await request.formData();
    const beforeImage = formData.get("beforeImage") as File;
    const projectType = formData.get("projectType") as string;
    const projectDescription = (formData.get("projectDescription") as string) || "";

    if (!beforeImage || !projectType) {
      return NextResponse.json({ error: "Missing beforeImage or projectType" }, { status: 400 });
    }

    // Build the AI prompt from project type and description
    const aiPrompt = buildAIPrompt(projectType, projectDescription);

    // Convert uploaded image to base64 data URL
    const bytes = await beforeImage.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = beforeImage.type;
    const beforeImageDataUrl = `data:${mimeType};base64,${base64}`;

    logger.info(
      `[Mockup Generate] User: ${user.id}, Project: ${projectType}, Size: ${beforeImage.size} bytes`
    );
    logger.debug(`[Mockup Generate] AI Prompt: ${aiPrompt}`);

    // Try OpenAI DALL-E 3 with image editing if available
    try {
      const openai = getOpenAI();

      // DALL-E 3 doesn't support image editing directly, so we'll use GPT-4o-mini to describe the transformation
      // and generate a detailed prompt, then generate a new image
      const descriptionResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You create detailed image generation prompts for COMPLETED property renovation visualizations. CRITICAL RULES: 1) NEVER describe any damage, wear, deterioration, debris, tarps, missing materials, or current disrepair. 2) ONLY describe what the FINISHED, BRAND-NEW, PRISTINE result looks like after professional installation. 3) Describe clean lines, fresh materials, perfect installation, and beautiful curb appeal. 4) The output should make someone want to hire a contractor.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Look at this property photo for reference on the building's architecture, perspective, and surroundings ONLY. Now create a detailed prompt describing what this property would look like AFTER a completed, professional renovation: ${aiPrompt}. IMPORTANT: Do NOT mention any damage or current condition. Describe ONLY the beautiful finished result with brand-new materials, perfect installation, and pristine condition.`,
              },
              {
                type: "image_url",
                image_url: { url: beforeImageDataUrl },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      const enhancedPrompt = descriptionResponse.choices[0]?.message?.content || aiPrompt;

      // Generate the "after" image with DALL-E 3
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `A stunning, hyper-realistic professional architectural photograph of a beautifully renovated property. Brand new, pristine, freshly installed materials with no damage, no wear, no debris whatsoever: ${enhancedPrompt}. Ultra high quality, photorealistic, natural lighting, sharp details, magazine-worthy real estate photography. The property looks perfect and move-in ready.`,
        n: 1,
        size: "1024x1024",
        quality: "hd",
      });

      const afterImageUrl = imageResponse.data![0]?.url;

      if (afterImageUrl) {
        logger.debug(`[Mockup Generate] SUCCESS via OpenAI DALL-E 3`);
        return NextResponse.json({
          success: true,
          afterImageUrl,
          projectType,
          projectDescription,
          aiPrompt: enhancedPrompt,
          method: "OpenAI DALL-E 3",
        });
      }
    } catch (error) {
      logger.error("[Mockup Generate] OpenAI error:", error);
      // Fall through to fallback method
    }

    // Fallback: Return before image with overlay message
    logger.debug(`[Mockup Generate] Using fallback (no AI service configured)`);
    return NextResponse.json({
      success: true,
      afterImageUrl: beforeImageDataUrl,
      projectType,
      projectDescription,
      aiPrompt,
      method: "Fallback (Demo Mode)",
      message: "Configure OPENAI_API_KEY or REPLICATE_API_TOKEN for real AI generation",
    });
  } catch (error) {
    logger.error("[Mockup Generate] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate mockup",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Build a detailed AI prompt for image generation
 * Combines project type with user description for best results
 */
function buildAIPrompt(projectType: string, description: string): string {
  const basePrompt = `Professional ${projectType.toLowerCase()} project completion visualization. `;

  const typeContext: Record<string, string> = {
    Roofing:
      "Show the completed roof with brand-new, pristine architectural shingles in perfect condition. Clean ridge caps, straight lines, no damage, no wear — a freshly installed roof that looks magazine-ready. ",
    "Kitchen Remodel":
      "Show the finished kitchen with brand-new installed cabinets, countertops, modern appliances, and pendant lighting. Everything looks pristine and freshly installed. ",
    "Bathroom Remodel":
      "Show the completed bathroom with new fixtures, pristine tile work, modern vanity, and fresh finishes. Spotlessly clean and newly installed. ",
    "Exterior Paint":
      "Show the house with a fresh, perfect paint job — clean edges, uniform color, professional finish with no imperfections. ",
    Flooring:
      "Show the room with brand-new flooring freshly installed, including perfect transitions and clean baseboards. ",
    "Solar Installation":
      "Show the roof with new solar panels cleanly and professionally installed, perfectly aligned and integrated. ",
    HVAC: "Show the completed HVAC installation with brand-new modern equipment, clean ductwork, and professional finish. ",
    "General Contractor":
      "Show the completed renovation with all new finishes, pristine materials, and professional craftsmanship throughout. ",
    Landscaping:
      "Show the finished landscape with healthy plants, clean hardscape, and beautiful design elements. Lush and freshly installed. ",
  };

  const context = typeContext[projectType] || "";
  const userDescription = description ? `Specific requirements: ${description}. ` : "";

  return `${basePrompt}${context}${userDescription}High quality, professional photograph, realistic, well-lit, before-after comparison ready.`;
}
