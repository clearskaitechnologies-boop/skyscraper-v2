/**
 * PHASE 48: CLAIM RECONSTRUCTION WORKER v1.0
 * 
 * Automatically triggers claim reconstruction when:
 * - Photos uploaded
 * - Dominus AI completes
 * - Storm data created
 * - Carrier letter uploaded
 * - Video generated
 * - Status changes
 * - Tasks completed
 * 
 * This keeps the reconstruction always fresh.
 */

import { prisma } from "@/lib/prisma";
import { reconstructClaimTimeline } from "@/lib/claims/reconstructor";
import { eventBus, ClaimEvents } from "@/lib/events/eventBus";

interface ReconstructionTrigger {
  claimId: string;
  orgId: string;
  trigger: string;
  metadata?: Record<string, any>;
}

/**
 * Main worker function - processes reconstruction triggers
 */
export async function processReconstructionTrigger(event: ReconstructionTrigger) {
  console.log(`[ReconstructionWorker] Processing trigger: ${event.trigger} for claim ${event.claimId}`);

  try {
    // Check if we should throttle (don't run more than once per 5 minutes)
    const existing = await prisma.claimEventReconstruction.findUnique({
      where: { claimId: event.claimId },
    });

    if (existing) {
      const minutesSinceLastRebuild = (Date.now() - existing.lastRebuilt.getTime()) / (1000 * 60);
      if (minutesSinceLastRebuild < 5 && event.trigger !== ClaimEvents.DOMINUS_ANALYSIS_COMPLETED) {
        console.log(`[ReconstructionWorker] Throttling: Last rebuild was ${minutesSinceLastRebuild.toFixed(1)}m ago`);
        return { success: true, throttled: true };
      }
    }

    // Run reconstruction
    console.log(`[ReconstructionWorker] Running reconstruction engine...`);
    const reconstruction = await reconstructClaimTimeline(event.claimId);

    // Save reconstruction
    await prisma.claimEventReconstruction.upsert({
      where: { claimId: event.claimId },
      create: {
        claimId: event.claimId,
        orgId: event.orgId,
        realTimeline: reconstruction.realTimeline,
        idealTimeline: reconstruction.idealTimeline,
        missingEvents: reconstruction.missingEvents,
        discrepancies: reconstruction.discrepancies,
        aiSummary: reconstruction.aiSummary,
        scoreQuality: reconstruction.scoreQuality,
        updatedFrom: event.trigger,
        lastRebuilt: new Date(),
      },
      update: {
        realTimeline: reconstruction.realTimeline,
        idealTimeline: reconstruction.idealTimeline,
        missingEvents: reconstruction.missingEvents,
        discrepancies: reconstruction.discrepancies,
        aiSummary: reconstruction.aiSummary,
        scoreQuality: reconstruction.scoreQuality,
        updatedFrom: event.trigger,
        lastRebuilt: new Date(),
        updatedAt: new Date(),
      },
    });

    // If quality is low, create task
    if (reconstruction.scoreQuality < 60) {
      const existingTask = await prisma.task.findFirst({
        where: {
          title: { contains: "Low Quality Timeline" },
          claimId: event.claimId,
          status: { not: "complete" },
        },
      });

      if (!existingTask) {
        await prisma.task.create({
          data: {
            title: "⚠️ Low Quality Timeline - Documentation Needed",
            description: `AI reconstruction shows quality score of ${reconstruction.scoreQuality}/100. ${reconstruction.missingEvents.length} critical events missing. Review and add documentation.`,
            priority: "high",
            status: "todo",
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
            claimId: event.claimId,
            orgId: event.orgId,
            createdBy: "RECONSTRUCTION_AI",
          },
        });
        console.log(`[ReconstructionWorker] Created low-quality task for claim ${event.claimId}`);
      }
    }

    // Emit reconstruction completed event
    eventBus.emit(ClaimEvents.RECONSTRUCTION_COMPLETED, {
      claimId: event.claimId,
      orgId: event.orgId,
      quality: reconstruction.scoreQuality,
      timestamp: new Date(),
    });

    console.log(`[ReconstructionWorker] ✅ Reconstruction updated for claim ${event.claimId}`);
    return { success: true, reconstruction };
  } catch (error) {
    console.error(`[ReconstructionWorker] Error processing trigger:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Batch process multiple triggers
 */
export async function processReconstructionBatch(events: ReconstructionTrigger[]) {
  console.log(`[ReconstructionWorker] Processing batch of ${events.length} triggers`);

  const results = await Promise.allSettled(events.map((event) => processReconstructionTrigger(event)));

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(`[ReconstructionWorker] Batch complete: ${successful} successful, ${failed} failed`);

  return { successful, failed, total: events.length };
}

/**
 * Helper functions to trigger from various parts of the app
 */

export async function triggerReconstructionOnPhotoUpload(claimId: string, orgId: string) {
  return processReconstructionTrigger({
    claimId,
    orgId,
    trigger: ClaimEvents.PHOTO_UPLOADED,
  });
}

export async function triggerReconstructionOnVideoGenerated(claimId: string, orgId: string) {
  return processReconstructionTrigger({
    claimId,
    orgId,
    trigger: ClaimEvents.VIDEO_GENERATED,
  });
}

export async function triggerReconstructionOnStormData(claimId: string, orgId: string) {
  return processReconstructionTrigger({
    claimId,
    orgId,
    trigger: ClaimEvents.STORM_DATA_CREATED,
  });
}

export async function triggerReconstructionOnDominusComplete(claimId: string, orgId: string) {
  return processReconstructionTrigger({
    claimId,
    orgId,
    trigger: ClaimEvents.DOMINUS_ANALYSIS_COMPLETED,
  });
}

export async function triggerReconstructionOnCarrierLetter(claimId: string, orgId: string) {
  return processReconstructionTrigger({
    claimId,
    orgId,
    trigger: ClaimEvents.CARRIER_LETTER_UPLOADED,
  });
}

export async function triggerReconstructionOnStatusChange(claimId: string, orgId: string) {
  return processReconstructionTrigger({
    claimId,
    orgId,
    trigger: ClaimEvents.STATUS_CHANGED,
  });
}

/**
 * Initialize event listeners for automatic triggering
 */
export function initializeReconstructionListeners() {
  console.log("[ReconstructionWorker] Initializing event listeners...");

  // Listen to photo uploads
  eventBus.subscribe(ClaimEvents.PHOTO_UPLOADED, async (payload) => {
    if (payload.claimId && payload.orgId) {
      await triggerReconstructionOnPhotoUpload(payload.claimId, payload.orgId);
    }
  });

  // Listen to video generation
  eventBus.subscribe(ClaimEvents.VIDEO_GENERATED, async (payload) => {
    if (payload.claimId && payload.orgId) {
      await triggerReconstructionOnVideoGenerated(payload.claimId, payload.orgId);
    }
  });

  // Listen to storm data
  eventBus.subscribe(ClaimEvents.STORM_DATA_CREATED, async (payload) => {
    if (payload.claimId && payload.orgId) {
      await triggerReconstructionOnStormData(payload.claimId, payload.orgId);
    }
  });

  // Listen to dominus completion
  eventBus.subscribe(ClaimEvents.DOMINUS_ANALYSIS_COMPLETED, async (payload) => {
    if (payload.claimId && payload.orgId) {
      await triggerReconstructionOnDominusComplete(payload.claimId, payload.orgId);
    }
  });

  // Listen to carrier letters
  eventBus.subscribe(ClaimEvents.CARRIER_LETTER_UPLOADED, async (payload) => {
    if (payload.claimId && payload.orgId) {
      await triggerReconstructionOnCarrierLetter(payload.claimId, payload.orgId);
    }
  });

  // Listen to status changes
  eventBus.subscribe(ClaimEvents.STATUS_CHANGED, async (payload) => {
    if (payload.claimId && payload.orgId) {
      await triggerReconstructionOnStatusChange(payload.claimId, payload.orgId);
    }
  });

  console.log("[ReconstructionWorker] ✅ Listeners initialized");
}
