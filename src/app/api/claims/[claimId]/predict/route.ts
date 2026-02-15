/**
 * POST /api/claims/[claimId]/predict
 * Generate AI prediction for claim lifecycle
 *
 * This is Phase 47 - the industry game changer.
 */

import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { predictClaimLifecycle, type PredictionInput } from "@/lib/claims/predictor";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { claimId: string } }) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { claimId } = params;

  try {
    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        orgId,
      },
      include: {
        leads: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Gather data for prediction
    const dominusAnalysis = await prisma.claim_analysis.findFirst({
      where: { claim_id: claimId },
    });

    const stormImpactData = await prisma.stormImpact.findFirst({
      where: { claimId },
      orderBy: { createdAt: "desc" },
    });

    const denialResponseData = await prisma.denialResponse.findFirst({
      where: { claimId },
      orderBy: { createdAt: "desc" },
    });

    const videoReport = await prisma.videoReport.findFirst({
      where: { claimId },
      orderBy: { createdAt: "desc" },
    });

    const leadId = claim.leads?.id;
    const events = leadId
      ? await prisma.leadPipelineEvent.findMany({
          where: { leadId },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : [];

    const photoCount = 0; // TODO: Count photos from related model if needed
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Build prediction input
    const predictionInput: PredictionInput = {
      claimId,
      leadId: leadId || undefined,
      orgId,
      stage: claim.status || undefined,
      dominusAnalysis: dominusAnalysis
        ? {
            damageType: (dominusAnalysis.damages as Record<string, unknown> | null)?.type as
              | string
              | undefined,
            urgency: (dominusAnalysis.risk_flags as Record<string, unknown> | null)?.urgency as
              | string
              | undefined,
            materials: dominusAnalysis.materials
              ? (dominusAnalysis.materials as unknown[])
              : undefined,
            flags: dominusAnalysis.risk_flags ? ["comprehensive_damage"] : ["minimal_damage"],
          }
        : undefined,
      stormImpact: stormImpactData
        ? {
            hailSize: stormImpactData.hailSize || undefined,
            windSpeed: stormImpactData.windSpeed || undefined,
            distance: stormImpactData.stormDistance || undefined,
            severityScore: stormImpactData.severityScore || undefined,
          }
        : undefined,
      photoCount,
      hasVideo: !!videoReport,
      hasDenialLetter: !!denialResponseData,
      daysSinceCreation,
      timelineEvents: events.map((e) => e.eventType),
    };

    console.log("[PREDICTION] Running analysis for claim:", claimId);

    // Run prediction
    const prediction = await predictClaimLifecycle(predictionInput);

    // Save to database
    const saved = await prisma.claimPrediction.upsert({
      where: { claimId },
      create: {
        id: crypto.randomUUID(),
        claimId,
        leadId: leadId || null,
        orgId,
        stage: claim.status || "New",
        updatedAt: new Date(),
        probabilityFull: prediction.probabilityFull,
        probabilityPart: prediction.probabilityPart,
        probabilityDeny: prediction.probabilityDeny,
        confidenceScore: prediction.confidenceScore,
        recommendedSteps: prediction.recommendedSteps as unknown as Prisma.InputJsonValue,
        riskFlags: prediction.riskFlags as unknown as Prisma.InputJsonValue,
        nextMove: prediction.nextMove,
        aiSummary: prediction.aiSummary,
        carrierBehavior: prediction.carrierBehavior as unknown as Prisma.InputJsonValue,
        successPath: prediction.successPath as unknown as Prisma.InputJsonValue,
        inputSources: {
          hasDominus: !!dominusAnalysis,
          hasStorm: !!stormImpactData,
          hasDenial: !!denialResponseData,
          hasVideo: !!videoReport,
          photoCount,
        } satisfies Record<string, unknown> as Prisma.InputJsonValue,
        updatedFrom: "API Request",
      },
      update: {
        stage: claim.status || "New",
        updatedAt: new Date(),
        probabilityFull: prediction.probabilityFull,
        probabilityPart: prediction.probabilityPart,
        probabilityDeny: prediction.probabilityDeny,
        confidenceScore: prediction.confidenceScore,
        recommendedSteps: prediction.recommendedSteps as unknown as Prisma.InputJsonValue,
        riskFlags: prediction.riskFlags as unknown as Prisma.InputJsonValue,
        nextMove: prediction.nextMove,
        aiSummary: prediction.aiSummary,
        carrierBehavior: prediction.carrierBehavior as unknown as Prisma.InputJsonValue,
        successPath: prediction.successPath as unknown as Prisma.InputJsonValue,
        inputSources: {
          hasDominus: !!dominusAnalysis,
          hasStorm: !!stormImpactData,
          hasDenial: !!denialResponseData,
          hasVideo: !!videoReport,
          photoCount,
        } satisfies Record<string, unknown> as Prisma.InputJsonValue,
        updatedFrom: "API Request",
      },
    });

    console.log("[PREDICTION] ✅ Saved prediction:", saved.id);

    // Trigger automation if high denial risk
    if (prediction.probabilityDeny > 50) {
      // Auto-create task
      await prisma.tasks.create({
        data: {
          id: crypto.randomUUID(),
          orgId,
          leadId: leadId || null,
          title: "⚠️ HIGH DENIAL RISK - Prepare Appeal",
          description: `AI prediction detected ${prediction.probabilityDeny}% denial probability. Begin preparing denial rebuttal documentation immediately.`,
          status: "TODO",
          dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      predictionId: saved.id,
      prediction: {
        ...prediction,
        claimId,
      },
      tokensUsed: 20,
    });
  } catch (err: unknown) {
    console.error("[PREDICTION API ERROR]:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Prediction failed", message }, { status: 500 });
  }
}

/**
 * GET /api/claims/[claimId]/predict
 * Retrieve existing prediction
 */
export async function GET(request: NextRequest, { params }: { params: { claimId: string } }) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { claimId } = params;

  try {
    const prediction = await prisma.claimPrediction.findUnique({
      where: { claimId },
    });

    if (!prediction) {
      return NextResponse.json({ error: "No prediction found for this claim" }, { status: 404 });
    }

    return NextResponse.json({ prediction });
  } catch (err: unknown) {
    console.error("[PREDICTION GET ERROR]:", err);
    return NextResponse.json({ error: "Failed to fetch prediction" }, { status: 500 });
  }
}
