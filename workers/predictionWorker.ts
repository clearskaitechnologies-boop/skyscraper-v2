/**
 * PREDICTION WORKER v1.0
 * 
 * Automatically triggers claim prediction re-generation when:
 * - New photos uploaded
 * - Video generated
 * - Storm data created/updated
 * - Denial response uploaded
 * - Dominus AI analysis completes
 * - Carrier letter uploaded
 * 
 * This ensures predictions stay fresh as new evidence arrives.
 */

import { prisma } from "@/lib/prisma";
import { predictClaimLifecycle } from "@/lib/claims/predictor";

interface TriggerEvent {
  claimId: string;
  orgId: string;
  trigger: "photo" | "video" | "storm" | "denial" | "dominus" | "carrier_letter" | "status_change";
  metadata?: Record<string, any>;
}

/**
 * Main worker function - processes prediction triggers
 */
export async function processPredictionTrigger(event: TriggerEvent) {
  console.log(`[PredictionWorker] Processing trigger: ${event.trigger} for claim ${event.claimId}`);

  try {
    // Get the claim with all necessary relationships
    const claim = await prisma.claims.findUnique({
      where: { id: event.claimId },
      include: {
        leads: true,
        DOMINUSAnalysis: true,
        StormImpact: true,
        DenialResponse: true,
        VideoMockup: true,
      },
    });

    if (!claim) {
      console.error(`[PredictionWorker] Claim ${event.claimId} not found`);
      return { success: false, error: "Claim not found" };
    }

    // Check if we should throttle predictions (don't run more than once per hour)
    const existingPrediction = await prisma.claimPrediction.findUnique({
      where: { claimId: event.claimId },
    });

    if (existingPrediction) {
      const hoursSinceLastUpdate = (Date.now() - existingPrediction.updatedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastUpdate < 1 && event.trigger !== "dominus") {
        console.log(`[PredictionWorker] Throttling: Last prediction was ${hoursSinceLastUpdate.toFixed(1)}h ago`);
        return { success: true, throttled: true };
      }
    }

    // Gather all data sources
    const dominusAnalysis = claim.DOMINUSAnalysis;
    const stormImpact = claim.StormImpact;
    const denialResponse = claim.DenialResponse;
    const videoMockup = claim.VideoMockup;

    // Get timeline events
    const timelineEvents = await prisma.leadPipelineEvent.findMany({
      where: { 
        lead: {
          claims: {
            some: { id: event.claimId }
          }
        }
      },
      orderBy: { createdAt: "asc" },
    });

    // Get media counts
    const photoCount = await prisma.brandingUpload.count({
      where: {
        claimId: event.claimId,
        status: "complete",
        storageUrl: { not: null },
      },
    });

    // Build prediction input
    const predictionInput = {
      claimId: event.claimId,
      storm: stormImpact
        ? {
            hailSize: stormImpact.hailSize || 0,
            windSpeed: stormImpact.windSpeed || 0,
            distanceFromPath: stormImpact.distanceFromPath || 999,
            impactSeverity: stormImpact.impactSeverity || "unknown",
            stormDate: stormImpact.stormDate || new Date(),
          }
        : undefined,
      dominus: dominusAnalysis
        ? {
            hasVisibleDamage: dominusAnalysis.flags?.includes("visible_damage") || false,
            flagCount: Array.isArray(dominusAnalysis.flags) ? dominusAnalysis.flags.length : 0,
            dominusScore: dominusAnalysis.score || 0,
            findings: dominusAnalysis.findings || [],
          }
        : undefined,
      media: {
        photoCount,
        videoCount: videoMockup ? 1 : 0,
      },
      denial: denialResponse
        ? {
            hasDenialLetter: true,
            denialReason: denialResponse.denialReason || "unknown",
            denialDate: denialResponse.uploadedAt || new Date(),
          }
        : undefined,
      timeline: {
        claimAge: Math.floor((Date.now() - claim.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        eventCount: timelineEvents.length,
        lastEventDate: timelineEvents[timelineEvents.length - 1]?.createdAt || claim.createdAt,
      },
      carrier: {
        name: claim.lead?.carrierName || "Unknown",
      },
    };

    // Run prediction engine
    console.log(`[PredictionWorker] Running prediction engine...`);
    const prediction = await predictClaimLifecycle(predictionInput);

    // Save/update prediction
    await prisma.claimPrediction.upsert({
      where: { claimId: event.claimId },
      create: {
        claimId: event.claimId,
        stage: claim.status || "under_review",
        probabilityFull: prediction.probabilities.full,
        probabilityPartial: prediction.probabilities.partial,
        probabilityDeny: prediction.probabilities.deny,
        confidenceScore: prediction.confidenceScore,
        recommendedSteps: prediction.recommendedSteps,
        riskFlags: prediction.riskFlags,
        nextMove: prediction.nextMove,
        aiSummary: prediction.aiSummary,
        carrierBehavior: prediction.carrierBehavior,
        successPath: prediction.successPath,
      },
      update: {
        stage: claim.status || "under_review",
        probabilityFull: prediction.probabilities.full,
        probabilityPartial: prediction.probabilities.partial,
        probabilityDeny: prediction.probabilities.deny,
        confidenceScore: prediction.confidenceScore,
        recommendedSteps: prediction.recommendedSteps,
        riskFlags: prediction.riskFlags,
        nextMove: prediction.nextMove,
        aiSummary: prediction.aiSummary,
        carrierBehavior: prediction.carrierBehavior,
        successPath: prediction.successPath,
        updatedAt: new Date(),
      },
    });

    // If high denial risk, create task
    if (prediction.probabilities.deny > 50) {
      const existingTask = await prisma.task.findFirst({
        where: {
          title: { contains: "High Denial Risk" },
          claimId: event.claimId,
          status: { not: "complete" },
        },
      });

      if (!existingTask) {
        await prisma.task.create({
          data: {
            title: "⚠️ High Denial Risk - Immediate Action Required",
            description: `AI prediction shows ${prediction.probabilities.deny.toFixed(0)}% denial probability. Review recommended actions immediately.`,
            priority: "high",
            status: "todo",
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
            claimId: event.claimId,
            orgId: event.orgId,
            createdBy: "SYSTEM",
          },
        });
        console.log(`[PredictionWorker] Created high-risk task for claim ${event.claimId}`);
      }
    }

    console.log(`[PredictionWorker] ✅ Prediction updated for claim ${event.claimId}`);
    return { success: true, prediction };
  } catch (error) {
    console.error(`[PredictionWorker] Error processing trigger:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Batch process multiple triggers (for cron jobs or bulk operations)
 */
export async function processPredictionBatch(events: TriggerEvent[]) {
  console.log(`[PredictionWorker] Processing batch of ${events.length} triggers`);
  
  const results = await Promise.allSettled(
    events.map(event => processPredictionTrigger(event))
  );

  const successful = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;

  console.log(`[PredictionWorker] Batch complete: ${successful} successful, ${failed} failed`);
  
  return { successful, failed, total: events.length };
}

/**
 * Helper functions to trigger from various parts of the app
 */

export async function triggerPredictionOnPhotoUpload(claimId: string, orgId: string) {
  return processPredictionTrigger({ claimId, orgId, trigger: "photo" });
}

export async function triggerPredictionOnVideoGenerated(claimId: string, orgId: string) {
  return processPredictionTrigger({ claimId, orgId, trigger: "video" });
}

export async function triggerPredictionOnStormData(claimId: string, orgId: string) {
  return processPredictionTrigger({ claimId, orgId, trigger: "storm" });
}

export async function triggerPredictionOnDenialUpload(claimId: string, orgId: string) {
  return processPredictionTrigger({ claimId, orgId, trigger: "denial" });
}

export async function triggerPredictionOnDominusComplete(claimId: string, orgId: string) {
  return processPredictionTrigger({ claimId, orgId, trigger: "dominus" });
}

export async function triggerPredictionOnCarrierLetter(claimId: string, orgId: string) {
  return processPredictionTrigger({ claimId, orgId, trigger: "carrier_letter" });
}

export async function triggerPredictionOnStatusChange(claimId: string, orgId: string) {
  return processPredictionTrigger({ claimId, orgId, trigger: "status_change" });
}
