import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { createAiConfig, withAiBilling, type AiBillingContext } from "@/lib/ai/withAiBilling";
import { generateRecommendations } from "@/lib/ml/recommendations/engine";
import { upsertRecommendations } from "@/lib/ml/recommendations/persist";

/**
 * POST /api/ai/recommendations/refresh
 * Regenerate recommendations for user/claim/org
 * Body: { claimId?: string }
 */
async function POST_INNER(req: NextRequest, ctx: AiBillingContext) {
  try {
    const { userId, orgId: ctxOrgId } = ctx;

    // Use org context (may be null) - default to userId if no org
    const orgId = ctxOrgId || userId;

    // Get claimId from request body
    const body = await req.json().catch(() => ({}));
    const claimId = body.claimId || null;

    logger.info("[POST /api/ai/recommendations/refresh] Regenerating...", {
      userId,
      orgId,
      claimId,
    });

    // Generate fresh recommendations
    const bundle = await generateRecommendations({
      orgId,
      userId,
      claimId,
    });

    // Persist recommendations
    await upsertRecommendations(orgId, bundle);

    // Use the generated bundle for response
    const recommendations = bundle;

    // Transform to expected format
    const contacts = recommendations
      .filter((r) => r.kind === "PROFESSIONAL_MATCH")
      .map((r) => ({
        id: r.id,
        name: r.payload?.name || r.title,
        company: r.payload?.company || "",
        role: r.payload?.role || "",
        specialty: r.payload?.specialties?.[0] || r.payload?.role || "",
        matchScore: r.score || 0,
        reason: r.summary || "",
        location: r.payload?.location || "",
        avatar: r.payload?.avatar,
      }));

    const actions = recommendations
      .filter((r) => r.kind === "NEXT_ACTION")
      .map((r) => ({
        id: r.id,
        title: r.title,
        reason: r.summary || "",
        priority: r.score && r.score > 90 ? "high" : r.score && r.score > 75 ? "medium" : "low",
        claimId: r.claimId,
        actionRoute: r.payload?.actionRoute,
      }));

    return NextResponse.json({
      ok: true,
      contacts,
      actions,
      refreshedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("[POST /api/ai/recommendations/refresh] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to refresh recommendations" },
      { status: 500 }
    );
  }
}

export const POST = withAiBilling(
  createAiConfig("recommendations_refresh", { costPerRequest: 15 }),
  POST_INNER
);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
