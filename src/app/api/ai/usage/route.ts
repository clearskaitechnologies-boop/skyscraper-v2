export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// API: GET AI USAGE SUMMARY
// ============================================================================
// GET /api/ai/usage
// Returns: { mockup: { used, limit }, dol: { used, limit }, weather: { used, limit } }

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";
import { getUsageSummary } from "@/modules/ai/core/tokens";

async function GET_INNER(req: NextRequest, ctx: { userId: string; orgId: string }) {
  try {
    const { userId, orgId } = ctx;

    const summary = await getUsageSummary(userId, orgId || userId);

    return NextResponse.json(summary);
  } catch (error: any) {
    logger.error("[AI Usage API]", error);
    return NextResponse.json({ error: error.message || "Failed to get usage" }, { status: 500 });
  }
}

export const GET = withAiBilling(
  createAiConfig("ai_usage", { costPerRequest: 0 }),
  GET_INNER as any
);
