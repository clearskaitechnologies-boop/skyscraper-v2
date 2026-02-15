import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { callOpenAI } from "@/lib/ai/client";
import { requirePermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/ratelimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST /api/claims/[id]/ai/summary - Generate AI claim overview
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

    // Get claim with all relations
    const claimId = params.claimId;
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
      select: {
        claimNumber: true,
        title: true,
        damageType: true,
        dateOfLoss: true,
        carrier: true,
        lifecycle_stage: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Build context for AI
    const context = {
      claimNumber: claim.claimNumber,
      title: claim.title,
      damageType: claim.damageType,
      dateOfLoss: claim.dateOfLoss,
      carrier: claim.carrier,
      lifecycleStage: claim.lifecycle_stage,
    };

    const prompt = `Generate a concise executive summary for this insurance claim:

Claim #${context.claimNumber}
Title: ${context.title}
Damage Type: ${context.damageType}
Date of Loss: ${new Date(context.dateOfLoss).toLocaleDateString()}
Carrier: ${context.carrier || "Unknown"}
Current Stage: ${context.lifecycleStage}

Financial Summary:

Provide:
1. Brief overview (2-3 sentences)
2. Key milestones
3. Current status
4. Next recommended action`;

    const result = await callOpenAI<string>({
      tag: "claim_summary",
      system: "You are an expert insurance claims adjuster. Provide clear, professional summaries.",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 500,
      context: { claimId },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: `AI summary failed: ${result.error || "Unknown error"}` },
        { status: 502 }
      );
    }

    const summary = result.raw || "";

    // Log activity
    await prisma.claim_activities.create({
      data: {
        id: crypto.randomUUID(),
        claim_id: claimId,
        user_id: userId,
        type: "NOTE",
        message: "AI summary generated",
        metadata: { summary },
      },
    });

    return NextResponse.json({ summary }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    console.error(`[POST /api/claims/${params.claimId}/ai/summary] Error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to generate summary" },
      { status: 500 }
    );
  }
}
