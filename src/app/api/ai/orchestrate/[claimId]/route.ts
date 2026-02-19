/**
 * AI Orchestration API Endpoint
 *
 * GET /api/ai/orchestrate/[claimId]
 *
 * Returns comprehensive AI intelligence for a claim:
 * - Next recommended actions
 * - Approval likelihood and risk scores
 * - Explanation for recommendations
 * - Similar claims analysis
 * - Negotiation suggestions (if carrier set)
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";

import { orchestrateClaim } from "@/lib/ai/orchestrator/orchestrateClaim";
import prisma from "@/lib/prisma";

async function GET_INNER(
  request: NextRequest,
  ctx: {
    userId: string;
    orgId: string | null;
    feature: string;
    planType: string;
    betaMode: boolean;
  }
) {
  try {
    const { userId, orgId } = ctx;
    const claimId = request.nextUrl.pathname.split("/").pop() || "";

    if (!orgId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 });
    }

    // Verify claim exists and belongs to org
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        orgId: orgId,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get request type from query params
    const searchParams = request.nextUrl.searchParams;
    const requestType = searchParams.get("type") as
      | "next_actions"
      | "full_intelligence"
      | "negotiate"
      | null;

    // Run orchestrator
    const result = await orchestrateClaim({
      claimId,
      orgId,
      requestType: requestType || "full_intelligence",
    });

    // Transform to match UI expectations
    const brainState = await prisma.claimBrainState.findFirst({
      where: { claimId },
      orderBy: { createdAt: "desc" },
    });

    const response = {
      state: brainState?.currentState || claim.status || null,
      nextActions: result.nextActions.map((action) => ({
        id: action.id || action.actionType,
        label: action.label,
        description: action.description,
        priority: action.priority,
      })),
      explanation: result.explanation.reasoning,
      intelligence: result.intelligence,
      similarClaims: result.similarClaims,
      negotiationSuggestions: result.negotiationSuggestions,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("AI orchestration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to orchestrate AI intelligence" },
      { status: 500 }
    );
  }
}

export const GET = withAiBilling(
  createAiConfig("ai_orchestrate", { costPerRequest: 30, planRequired: "pro" }),
  GET_INNER
);
