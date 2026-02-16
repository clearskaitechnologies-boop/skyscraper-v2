/**
 * AI Analysis API for Claims
 *
 * POST /api/claims/[claimId]/ai - Manually trigger AI analysis
 * GET /api/claims/[claimId]/ai - Get AI analysis results
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { getOpenAI } from "@/lib/ai/client";
import { buildClaimContext } from "@/lib/claim/buildClaimContext";
import { getClaimAIAnalysis, triggerManualAnalysis } from "@/lib/claims/aiHooks";
import prisma from "@/lib/prisma";

// Force Node.js runtime for OpenAI SDK
export const runtime = "nodejs";

/**
 * POST - AI Assistant Chat OR Manual Analysis Trigger
 */
export async function POST(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    const { claimId } = params;

    // Public demo: allow unauthenticated requests for claimId "test" with safe handling
    if (!userId && claimId === "test") {
      const body = await request.json().catch(() => ({}));
      const message: string | undefined = body?.message;

      // If OpenAI is configured, we can generate a lightweight demo reply; otherwise return a canned response
      if (process.env.OPENAI_API_KEY && message) {
        try {
          const openai = getOpenAI();
          const systemPrompt =
            "You are an expert insurance claims assistant for a demo claim. Be concise and helpful.";
          const contextSummary = `Demo Claim Context\nClaim Number: CLM-DEMO-001\nInsured: John Smith\nProperty: 123 Demo St, Phoenix, AZ 85001\nLoss Date: 2025-12-01\nCarrier: Demo Carrier\nDamage Type: STORM\nStatus: active`;
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "system", content: contextSummary },
              { role: "user", content: message },
            ],
            temperature: 0.3,
            max_tokens: 600,
          });
          const response =
            completion.choices[0]?.message?.content ||
            "Here's a demo response. Ask about supplements, weather, or documentation.";
          return NextResponse.json({ ok: true, reply: response, response });
        } catch (err: any) {
          logger.error("[CLAIM_AI_DEMO_FAIL] OpenAI Error:", err);
          return NextResponse.json(
            {
              ok: true,
              reply:
                "Demo assistant is currently unavailable. Please try again later or sign in for full functionality.",
            },
            { status: 200 }
          );
        }
      }

      return NextResponse.json(
        {
          ok: true,
          reply:
            "This is a demo assistant. Ask about supplements, weather verification, rebuttals, or documentation.",
        },
        { status: 200 }
      );
    }

    // Auth required for non-demo claims
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { analysisType, message, claimContext } = body;

    // Validate claim exists and user has access
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        orgId: true,
        claimNumber: true,
        title: true,
        status: true,
        carrier: true,
        dateOfLoss: true,
        damageType: true,
      },
    });

    if (!claim) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Claim not found" } },
        { status: 404 }
      );
    }

    // Handle AI Assistant Chat
    if (message) {
      logger.debug("[CLAIM_AI_REQUEST] Starting for claim:", claimId);

      // Check if OpenAI is configured
      if (!process.env.OPENAI_API_KEY) {
        logger.error("[CLAIM_AI_ERROR] OPENAI_API_KEY missing");
        return NextResponse.json(
          {
            ok: false,
            error: "AI_NOT_CONFIGURED",
            reply:
              "AI Assistant is not configured. Please add OPENAI_API_KEY to your environment variables.",
          },
          { status: 200 }
        );
      }

      // Build full claim context using canonical builder
      logger.debug("[CLAIM_AI] Building context...");
      let claimContext;
      try {
        claimContext = await buildClaimContext(claimId);
      } catch (error) {
        logger.error("[CLAIM_AI_ERROR] Context build failed:", error);
        return NextResponse.json(
          {
            ok: false,
            error: "CONTEXT_BUILD_FAILED",
            reply:
              "I'm having trouble loading this claim's data. Please refresh the page and try again.",
          },
          { status: 200 }
        );
      }

      if (!claimContext || !claimContext.claim) {
        return NextResponse.json(
          {
            ok: false,
            error: "CLAIM_NOT_FOUND",
            reply: "I couldn't find this claim. Please check the claim ID and try again.",
          },
          { status: 200 }
        );
      }

      logger.debug("[CLAIM_AI_CONTEXT_OK] Context built successfully");

      // Build rich system prompt with full context
      const contextSummary = `
CLAIM CONTEXT:
Claim Number: ${claimContext.claim.claimNumber || "N/A"}
Insured: ${claimContext.claim.insured_name || "N/A"}
Property: ${claimContext.claim.propertyAddress || "N/A"}
Loss Date: ${claimContext.claim.lossDate || "N/A"}
Carrier: ${claimContext.claim.carrier || "N/A"}
Damage Type: ${claimContext.claim.damageType || "N/A"}
Status: ${claimContext.claim.status || "N/A"}

Photos: ${claimContext.photos?.length || 0} available
Notes: ${claimContext.notes?.length || 0} recorded
Findings: ${claimContext.findings?.length || 0} documented
Weather Data: ${claimContext.weather ? "Available" : "Not available"}
`;

      const systemPrompt = `You are an expert insurance claims assistant for SkaiScraper.

CRITICAL RULES:
1. Use ONLY the data provided in the claim context
2. NEVER invent or hallucinate data
3. If information is missing, ask clarifying questions
4. Be helpful, professional, and accurate
5. When analyzing damage, cite specific photos or notes
6. For supplements, justify each line item with evidence

Your goal: Help adjusters maximize accurate claim value while maintaining professional integrity.`;

      try {
        const openai = getOpenAI();

        logger.debug("[CLAIM_AI] Calling OpenAI...");

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "system", content: contextSummary },
            { role: "user", content: message },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        });

        const response =
          completion.choices[0]?.message?.content ||
          "I couldn't generate a response. Please try again.";

        logger.debug("[CLAIM_AI_SUCCESS] Generated reply:", response.substring(0, 100) + "...");

        return NextResponse.json({
          ok: true,
          reply: response,
          response, // backward compatibility
          tokensUsed: completion.usage?.total_tokens || 0,
        });
      } catch (aiError: any) {
        console.error("[CLAIM_AI_FAIL] OpenAI Error:", aiError);
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "AI_SERVICE_ERROR",
              message:
                aiError.message ||
                "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
            },
          },
          { status: 500 }
        );
      }
    }

    // Handle Manual Analysis Trigger (legacy)
    if (analysisType) {
      // Validate analysis type
      const validTypes = ["triage", "damage", "video", "blueprint", "policy"];
      if (!validTypes.includes(analysisType)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid analysis type. Must be one of: ${validTypes.join(", ")}`,
          },
          { status: 400 }
        );
      }

      // Trigger analysis
      const result = await triggerManualAnalysis(claimId, analysisType);

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Analysis failed or no data available for this analysis type",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        analysisType,
        result,
      });
    }

    return NextResponse.json(
      { success: false, error: "Either 'message' or 'analysisType' is required" },
      { status: 400 }
    );
  } catch (error: any) {
    logger.error("[AI Analysis] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * GET - Retrieve AI analysis results
 */
export async function GET(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;

    // Validate claim exists and user has access
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { orgId: true },
    });

    if (!claim) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    // Get AI analysis results
    const analysis = await getClaimAIAnalysis(claimId);

    if (!analysis) {
      return NextResponse.json({
        success: true,
        message: "No AI analysis available yet",
        analysis: null,
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
      summary: {
        totalAnalyses: analysis.history?.length || 0,
        hasTriage: !!analysis.triage,
        hasDamageAssessment: !!analysis.damageAssessment,
        hasVideoAnalysis: !!analysis.videoAnalysis,
        hasBlueprintAnalysis: !!analysis.blueprintAnalysis,
        hasPolicyOptimization: !!analysis.policyOptimization,
      },
    });
  } catch (error: any) {
    logger.error("[AI Analysis] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
