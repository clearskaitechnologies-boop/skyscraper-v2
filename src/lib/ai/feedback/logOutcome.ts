/**
 * AI Outcome Logging
 *
 * Track outcomes of AI actions to learn what works.
 * Approved? Denied? Partial approval? This data trains the system.
 */

import prisma from "@/lib/prisma";

export interface LogAIOutcomeParams {
  actionId: string;
  resultType: string; // approved, partial, denied, delayed, disputed
  metadata?: any;
}

/**
 * Log outcome of an AI action
 */
export async function logAIOutcome(params: LogAIOutcomeParams) {
  return prisma.aIOutcome.create({
    data: {
      actionId: params.actionId,
      resultType: params.resultType,
      metadata: params.metadata ?? {},
    },
  });
}

/**
 * Get outcome for an action
 */
export async function getActionOutcome(actionId: string) {
  return prisma.aIOutcome.findUnique({
    where: { actionId },
  });
}

/**
 * Calculate success rate for an agent or action type
 */
export async function calculateSuccessRate(filters: {
  agentId?: string;
  actionType?: string;
  carrier?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<{
  total: number;
  approved: number;
  partial: number;
  denied: number;
  successRate: number;
}> {
  const whereClause: any = {};

  if (filters.agentId) {
    whereClause.agent = { id: filters.agentId };
  }

  if (filters.actionType) {
    whereClause.actionType = filters.actionType;
  }

  if (filters.startDate || filters.endDate) {
    whereClause.createdAt = {};
    if (filters.startDate) whereClause.createdAt.gte = filters.startDate;
    if (filters.endDate) whereClause.createdAt.lte = filters.endDate;
  }

  const actions = await prisma.aIAction.findMany({
    where: whereClause,
    include: {
      outcome: true,
    },
  });

  const total = actions.length;
  const approved = actions.filter((a) => a.outcome?.resultType === "approved").length;
  const partial = actions.filter((a) => a.outcome?.resultType === "partial").length;
  const denied = actions.filter((a) => a.outcome?.resultType === "denied").length;

  const successRate = total > 0 ? (approved + partial * 0.5) / total : 0;

  return {
    total,
    approved,
    partial,
    denied,
    successRate,
  };
}

/**
 * Get outcome distribution by carrier (which carriers approve most often?)
 */
export async function getOutcomesByCarrier(): Promise<
  Record<string, { approved: number; denied: number; successRate: number }>
> {
  // This would require JOIN with claims table
  // Placeholder implementation
  return {};
}
