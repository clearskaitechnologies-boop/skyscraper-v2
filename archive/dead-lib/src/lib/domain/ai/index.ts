/**
 * AI Domain Services
 *
 * Pure business logic for AI operations - scope generation, analysis, etc.
 */

import prisma from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================

export interface GenerateScopeInput {
  claimId: string;
  orgId: string;
  userId: string;
  photos?: string[];
  existingScope?: Record<string, unknown>;
}

export interface AnalyzeDamageInput {
  claimId: string;
  orgId: string;
  userId: string;
  photoUrls: string[];
}

export interface GenerateDisputeInput {
  claimId: string;
  orgId: string;
  userId: string;
  insurerOffer: number;
  ourEstimate: number;
  reasoning: string;
}

export interface SummarizeClaimInput {
  claimId: string;
  orgId: string;
  format?: "brief" | "detailed" | "executive";
}

export interface ExtractMeasurementsInput {
  claimId: string;
  orgId: string;
  documentUrl: string;
}

export interface GenerateTimelineInput {
  claimId: string;
  orgId: string;
  userId: string;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Generate AI scope for a claim
 */
export async function generateScope(input: GenerateScopeInput) {
  const { claimId, orgId, userId, photos, existingScope } = input;

  // Get claim with photos
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    include: {
      photos: { take: 20 },
      property: true,
    },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  // Create AI task record
  const task = await prisma.aiTask.create({
    data: {
      claimId,
      orgId,
      taskType: "scope_generation",
      status: "processing",
      createdBy: userId,
    },
  });

  // In production, this would queue an async job
  // For now, return the task ID
  return { success: true, taskId: task.id, status: "processing" };
}

/**
 * Analyze damage from photos
 */
export async function analyzeDamage(input: AnalyzeDamageInput) {
  const { claimId, orgId, userId, photoUrls } = input;

  const task = await prisma.aiTask.create({
    data: {
      claimId,
      orgId,
      taskType: "damage_analysis",
      status: "processing",
      createdBy: userId,
      inputData: { photoUrls },
    },
  });

  return { success: true, taskId: task.id, status: "processing" };
}

/**
 * Generate dispute letter
 */
export async function generateDispute(input: GenerateDisputeInput) {
  const { claimId, orgId, userId, insurerOffer, ourEstimate, reasoning } = input;

  const task = await prisma.aiTask.create({
    data: {
      claimId,
      orgId,
      taskType: "dispute_generation",
      status: "processing",
      createdBy: userId,
      inputData: { insurerOffer, ourEstimate, reasoning },
    },
  });

  return { success: true, taskId: task.id, status: "processing" };
}

/**
 * Summarize claim
 */
export async function summarizeClaim(input: SummarizeClaimInput) {
  const { claimId, orgId, format } = input;

  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    include: {
      property: true,
      contact: true,
      events: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  // Return placeholder - actual AI call would happen here
  return {
    success: true,
    summary: {
      claimId,
      format: format || "detailed",
      generated: false,
      message: "Summary generation queued",
    },
  };
}

/**
 * Extract measurements from document
 */
export async function extractMeasurements(input: ExtractMeasurementsInput) {
  const { claimId, orgId, documentUrl } = input;

  const task = await prisma.aiTask.create({
    data: {
      claimId,
      orgId,
      taskType: "measurement_extraction",
      status: "processing",
      inputData: { documentUrl },
    },
  });

  return { success: true, taskId: task.id, status: "processing" };
}

/**
 * Generate claim timeline
 */
export async function generateTimeline(input: GenerateTimelineInput) {
  const { claimId, orgId, userId } = input;

  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    include: {
      events: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  const task = await prisma.aiTask.create({
    data: {
      claimId,
      orgId,
      taskType: "timeline_generation",
      status: "processing",
      createdBy: userId,
    },
  });

  return { success: true, taskId: task.id, status: "processing" };
}

/**
 * Get AI task status
 */
export async function getTaskStatus(taskId: string) {
  const task = await prisma.aiTask.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      status: true,
      taskType: true,
      result: true,
      error: true,
      createdAt: true,
      completedAt: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return { success: true, task };
}

/**
 * Cancel AI task
 */
export async function cancelTask(taskId: string, userId: string) {
  const task = await prisma.aiTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.status === "completed" || task.status === "cancelled") {
    throw new Error("Task cannot be cancelled");
  }

  await prisma.aiTask.update({
    where: { id: taskId },
    data: {
      status: "cancelled",
      cancelledBy: userId,
      cancelledAt: new Date(),
    },
  });

  return { success: true, message: "Task cancelled" };
}
