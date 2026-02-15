/**
 * Phase 6: Inline Mission Processor
 * Alternative to separate BullMQ worker for development environments
 * Processes missions directly in Next.js server runtime
 */

// Direct import for event publishing
import { prismaModel } from "@/lib/db/prismaModel";

import { missionRegistry } from "./missionRegistry";

const Activity = prismaModel<any>(
  "activity_logs",
  "activityLogs",
  "activityLog",
  "claim_activities",
  "claimActivities",
  "ClaimActivity",
  "claimActivity"
);

async function publishEvent(event: any) {
  // Write to audit_logs directly to avoid circular dependencies
  if (!Activity) return;

  await Activity.create({
    data: {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      org_id: event.orgId || "system",
      job_id: event.jobId || null,
      user_id: "SYSTEM",
      user_name: "SkaiAgent",
      action: event.type,
      mission_id: event.missionId || null,
      actor: event.actor,
      event_type: event.type,
      metadata: event.metadata || {},
      payload: event.metadata || {},
    },
  });
}

export interface InlineProcessorOptions {
  enabled: boolean; // Set via env: INLINE_AGENT_PROCESSOR=true
  logLevel?: "debug" | "info" | "warn" | "error";
}

const DEFAULT_OPTIONS: InlineProcessorOptions = {
  enabled: process.env.INLINE_AGENT_PROCESSOR === "true",
  logLevel: "info",
};

/**
 * Process a mission inline (synchronously within the API route)
 * Use for dev/testing when you don't want to run separate worker
 */
export async function processInline(
  missionId: string,
  jobId: string,
  orgId: string,
  options: Partial<InlineProcessorOptions> = {}
): Promise<{ success: boolean; error?: string; result?: any }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!opts.enabled) {
    return {
      success: false,
      error: "Inline processor disabled. Use BullMQ worker or set INLINE_AGENT_PROCESSOR=true",
    };
  }

  const mission = missionRegistry.find((m) => m.id === missionId);
  if (!mission) {
    return { success: false, error: `Mission ${missionId} not found in registry` };
  }

  try {
    // Log mission start
    if (opts.logLevel === "debug" || opts.logLevel === "info") {
      console.log(`[Inline] Starting mission: ${missionId} for job ${jobId}`);
    }

    // Publish start event
    await publishEvent({
      type: "MISSION.START",
      actor: "AI",
      message: `Mission ${missionId} started (inline)`,
      orgId,
      jobId,
      missionId,
      metadata: { inline: true },
    });

    // Check preconditions
    const preconditionsMet = await mission.preconditions(jobId);
    if (!preconditionsMet) {
      const msg = `Preconditions not met for ${missionId}`;
      await publishEvent({
        type: "MISSION.FAIL",
        actor: "AI",
        message: msg,
        orgId,
        jobId,
        missionId,
        metadata: { inline: true, reason: "preconditions_not_met" },
      });
      return { success: false, error: msg };
    }

    // Execute mission
    const result = await mission.execute(jobId);

    // Check if requires approval
    if (mission.requiresApproval) {
      await publishEvent({
        type: "AI.WAITING_APPROVAL",
        actor: "AI",
        message: `Mission ${missionId} awaiting approval`,
        orgId,
        jobId,
        missionId,
        metadata: { inline: true, result },
      });

      if (opts.logLevel === "debug" || opts.logLevel === "info") {
        console.log(`[Inline] Mission ${missionId} requires approval - paused`);
      }

      return {
        success: true,
        result: { ...result, status: "awaiting_approval" },
      };
    }

    // Publish success
    await publishEvent({
      type: "MISSION.SUCCESS",
      actor: "AI",
      message: `Mission ${missionId} completed (inline)`,
      orgId,
      jobId,
      missionId,
      metadata: { inline: true, result },
    });

    // Handle chaining
    if (result.next) {
      if (opts.logLevel === "debug" || opts.logLevel === "info") {
        console.log(`[Inline] Chaining to mission: ${result.next}`);
      }

      // Recursively process next mission
      const chainResult = await processInline(result.next, jobId, orgId, options);
      return {
        success: true,
        result: { ...result, chainedResult: chainResult },
      };
    }

    if (opts.logLevel === "debug" || opts.logLevel === "info") {
      console.log(`[Inline] Mission ${missionId} completed successfully`);
    }

    return { success: true, result };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    await publishEvent({
      type: "MISSION.FAIL",
      actor: "AI",
      message: `Mission ${missionId} failed: ${errorMsg}`,
      orgId,
      jobId,
      missionId,
      metadata: { inline: true, error: errorMsg },
    });

    if (opts.logLevel === "error" || opts.logLevel === "warn" || opts.logLevel === "info") {
      console.error(`[Inline] Mission ${missionId} failed:`, error);
    }

    return { success: false, error: errorMsg };
  }
}

/**
 * Helper to check if inline processing is enabled
 */
export function isInlineEnabled(): boolean {
  return process.env.INLINE_AGENT_PROCESSOR === "true";
}

/**
 * Middleware to auto-select processor (inline vs queue)
 * Use in API routes:
 *
 * ```ts
 * import { processMission } from "@/lib/agent/inlineProcessor";
 *
 * export async function POST(req: Request) {
 *   const { missionId, jobId, orgId } = await req.json();
 *   const result = await processMission(missionId, jobId, orgId);
 *   return NextResponse.json(result);
 * }
 * ```
 */
export async function processMission(
  missionId: string,
  jobId: string,
  orgId: string
): Promise<{ success: boolean; queued?: boolean; error?: string; result?: any }> {
  if (isInlineEnabled()) {
    // Use inline processor
    return await processInline(missionId, jobId, orgId);
  } else {
    // Use BullMQ queue
    const { getAgentQueue } = await import("./queues");
    const { queue } = getAgentQueue();
    await queue.add(missionId, { missionId, jobId, orgId });
    return { success: true, queued: true };
  }
}
