import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { callOpenAI } from "@/lib/ai/client";
import { requirePermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { htmlToPdfBuffer } from "@/lib/reports/pdf-utils";
import { saveAiPdfToStorage } from "@/lib/reports/saveAiPdfToStorage";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/ratelimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const rebuttalSchema = z.object({
  supplementId: z.string().uuid(),
  carrierResponse: z.string().optional(),
  savePdf: z.boolean().optional().default(true),
});

/**
 * POST /api/claims/[id]/ai/rebuttal - Generate supplement rebuttal letter
 */
export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit & permission
    const identifier = getClientIdentifier(req as any, userId || undefined);
    const rl = await checkRateLimit(identifier, "api");
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    await requirePermission("use_ai_features" as any);

    const body = await req.json();
    const validated = rebuttalSchema.parse(body);

    const claimId = params.claimId;

    // Get claim
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
      include: {
        properties: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get supplement
    const supplement = await prisma.claim_supplements.findFirst({
      where: {
        id: validated.supplementId,
        claim_id: claimId,
      },
    });

    if (!supplement) {
      return NextResponse.json({ error: "Supplement not found" }, { status: 404 });
    }

    const prompt = `Generate a professional insurance supplement rebuttal letter for:

Claim #${claim.claimNumber}
Property: ${claim.properties?.street || "N/A"}
Damage Type: ${claim.damageType}
Supplement Amount: $${(supplement.total_cents / 100).toFixed(2)}
${validated.carrierResponse ? `\nCarrier Response: ${validated.carrierResponse}` : ""}

Write a persuasive, professional rebuttal that:
1. Acknowledges the carrier's position (if provided)
2. Clearly justifies the supplement with factual reasoning
3. References industry standards and best practices
4. Maintains a respectful, professional tone
5. Ends with a clear call to action

Format as a formal business letter.`;

    const result = await callOpenAI<string>({
      tag: "supplement_rebuttal",
      system:
        "You are an expert insurance claims advocate. Write compelling, professional rebuttal letters that are factual and persuasive.",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      maxTokens: 1000,
      context: { claimId, supplementId: validated.supplementId },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: `AI rebuttal failed: ${result.error || "Unknown error"}` },
        { status: 502 }
      );
    }

    const rebuttal = result.raw || "";

    // Generate PDF and save to storage (non-blocking)
    let pdfSaved = false;
    let pdfUrl: string | null = null;

    if (validated.savePdf !== false) {
      try {
        const rebuttalHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Georgia, 'Times New Roman', serif; padding: 60px; line-height: 1.8; max-width: 800px; margin: 0 auto; }
              h1 { color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; font-size: 20px; }
              .header { text-align: right; margin-bottom: 30px; color: #666; }
              .meta { background: #f8fafc; padding: 16px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #3b82f6; }
              .content { white-space: pre-wrap; margin-top: 30px; }
              .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="header">
              <p>${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            
            <h1>Supplement Rebuttal Letter</h1>
            
            <div class="meta">
              <p><strong>Claim #:</strong> ${claim.claimNumber || "N/A"}</p>
              <p><strong>Property:</strong> ${claim.properties?.street || "N/A"}</p>
              <p><strong>Supplement ID:</strong> ${validated.supplementId}</p>
              <p><strong>Amount:</strong> $${(supplement.total_cents / 100).toFixed(2)}</p>
            </div>
            
            <div class="content">${rebuttal}</div>
            
            <div class="footer">
              <p>Generated by SkaiScrape AI • ${new Date().toISOString()}</p>
            </div>
          </body>
          </html>
        `;

        const pdfBuffer = await htmlToPdfBuffer(rebuttalHTML);

        const result = await saveAiPdfToStorage({
          orgId,
          claimId,
          userId,
          type: "REBUTTAL",
          label: `Rebuttal Letter - Supplement ${validated.supplementId}`,
          pdfBuffer,
          visibleToClient: false,
        });

        pdfSaved = true;
        pdfUrl = result.publicUrl;
        console.log(`[Rebuttal API] PDF saved for claim ${claimId}: ${pdfUrl}`);
      } catch (pdfError) {
        console.error("[Rebuttal API] PDF generation failed (non-critical):", pdfError);
        // Continue - PDF failure should not break the rebuttal generation
      }
    }

    // Log activity
    await prisma.claim_activities.create({
      data: {
        id: crypto.randomUUID(),
        claim_id: claimId,
        user_id: userId,
        type: "NOTE",
        message: "AI rebuttal letter generated",
        metadata: {
          supplementId: validated.supplementId,
          rebuttalLength: rebuttal.length,
          pdfSaved,
          pdfUrl,
        },
      },
    });

    return NextResponse.json(
      { rebuttal, supplementId: validated.supplementId, pdfSaved, pdfUrl },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error(`[POST /api/claims/${params.claimId}/ai/rebuttal] Error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to generate rebuttal" },
      { status: 500 }
    );
  }
}
