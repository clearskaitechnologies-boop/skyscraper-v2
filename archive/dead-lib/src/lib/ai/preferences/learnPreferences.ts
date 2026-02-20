/**
 * Learn from Human Preferences
 *
 * Analyze patterns in human edits to improve AI outputs.
 * This is where the system gets smarter over time.
 */

import prisma from "@/lib/prisma";

import { computeDiff, extractMeaningfulEdits } from "./diffTools";

/**
 * Log a human edit to AI output
 */
export async function logHumanEdit(params: {
  actionId: string;
  originalOutput: any;
  editedOutput: any;
}) {
  const diff = computeDiff(params.originalOutput, params.editedOutput);

  return prisma.humanEdit.create({
    data: {
      actionId: params.actionId,
      originalOutput: params.originalOutput,
      editedOutput: params.editedOutput,
      diff: diff || {},
    },
  });
}

/**
 * Analyze edit patterns across all human corrections
 */
export async function analyzeHumanEdits(filters?: {
  agentId?: string;
  actionType?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const whereClause: any = {};

  if (filters?.startDate || filters?.endDate) {
    whereClause.createdAt = {};
    if (filters.startDate) whereClause.createdAt.gte = filters.startDate;
    if (filters.endDate) whereClause.createdAt.lte = filters.endDate;
  }

  const edits = await prisma.humanEdit.findMany({
    where: whereClause,
    include: {
      action: {
        include: {
          agent: true,
        },
      },
    },
  });

  // Analyze patterns
  const patterns: Record<string, number> = {};

  for (const edit of edits) {
    const meaningfulEdits = extractMeaningfulEdits(edit.diff);

    for (const change of meaningfulEdits) {
      patterns[change] = (patterns[change] || 0) + 1;
    }
  }

  // Return top patterns sorted by frequency
  const topPatterns = Object.entries(patterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([pattern, count]) => ({ pattern, count }));

  return {
    totalEdits: edits.length,
    topPatterns,
  };
}

/**
 * Get common edit types by carrier
 */
export async function getEditPatternsByCarrier() {
  // This would aggregate edits grouped by carrier
  // Requires JOIN with claims -> outcomes
  // Placeholder for now
  return {};
}

/**
 * Generate training data from edits for fine-tuning
 */
export async function generateTrainingData(limit = 1000) {
  const edits = await prisma.humanEdit.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      action: true,
    },
  });

  // Format as training examples
  return edits.map((edit) => ({
    input: edit.action.inputData,
    originalOutput: edit.originalOutput,
    improvedOutput: edit.editedOutput,
    actionType: edit.action.actionType,
  }));
}
