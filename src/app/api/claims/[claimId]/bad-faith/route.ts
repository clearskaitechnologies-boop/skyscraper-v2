/**
 * MASTER PROMPT #42 - BAD FAITH DETECTION API
 * GET /api/claims/[claimId]/bad-faith
 *
 * Returns comprehensive bad faith analysis for a claim
 */

import { auth } from "@clerk/nextjs/server";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { detectBadFaith, getBadFaithAnalysis } from "@/lib/claims/badFaithDetector";
import { requirePermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/ratelimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Get bad faith analysis for claim
 */
export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;

    // Rate limiting (general API bucket)
    const identifier = getClientIdentifier(req, userId);
    const rl = await checkRateLimit(identifier, "api");
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Permission enforcement for AI analysis
    await requirePermission("use_ai_features");

    // Verify claim ownership
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
      select: { id: true, claimNumber: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get or generate bad faith analysis
    const analysis = await getBadFaithAnalysis(claimId);

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error(`[GET /api/claims/${params.claimId}/bad-faith] Error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze bad faith" },
      { status: 500 }
    );
  }
}

/**
 * Force refresh bad faith analysis
 */
export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;

    // Rate limiting (general API bucket)
    const identifier = getClientIdentifier(req, userId);
    const rl = await checkRateLimit(identifier, "api");
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Permission enforcement
    await requirePermission("use_ai_features");

    // Verify claim ownership
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
      select: { id: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Import and run fresh analysis
    const analysis = await detectBadFaith(claimId);
    // Store/cached by detector helper (ensure compatibility with current schema)
    await prisma.claim_bad_faith_analysis
      ?.upsert({
        where: { claim_id: claimId },
        update: { analysis: analysis as unknown as Prisma.InputJsonValue },
        create: {
          claim_id: claimId,
          analysis: analysis as unknown as Prisma.InputJsonValue,
          // Prisma schema uses 'severity' field; map overallSeverity to an ordinal
          severity: ["none", "low", "medium", "high", "critical"].indexOf(analysis.overallSeverity),
        } as unknown as Prisma.claim_bad_faith_analysisUncheckedCreateInput,
      })
      .catch((err) => console.error("[BAD FAITH API] Failed to upsert analysis:", err));

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error(`[POST /api/claims/${params.claimId}/bad-faith] Error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to refresh bad faith analysis" },
      { status: 500 }
    );
  }
}
