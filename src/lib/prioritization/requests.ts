/**
 * TASK 186: REQUEST PRIORITIZATION
 *
 * Dynamic request prioritization and scheduling.
 */

import prisma from "@/lib/prisma";

export interface PriorityRule {
  id: string;
  name: string;
  condition: PriorityCondition;
  priority: number;
  enabled: boolean;
}

export interface PriorityCondition {
  userTier?: "FREE" | "PRO" | "ENTERPRISE";
  endpoint?: string;
  method?: string;
  timeOfDay?: { start: number; end: number };
  customHeaders?: Record<string, string>;
}

/**
 * Create priority rule
 */
export async function createPriorityRule(data: {
  name: string;
  condition: PriorityCondition;
  priority: number;
}): Promise<string> {
  const rule = await prisma.priorityRule.create({
    data: {
      ...data,
      condition: data.condition as any,
      enabled: true,
    } as any,
  });

  return rule.id;
}

/**
 * Calculate request priority
 */
export async function calculateRequestPriority(request: {
  userId: string;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
}): Promise<number> {
  const rules = await prisma.priorityRule.findMany({
    where: { enabled: true },
    orderBy: { priority: "desc" },
  });

  let maxPriority = 0;

  for (const rule of rules) {
    const condition = rule.condition as PriorityCondition;

    if (matchesCondition(request, condition)) {
      maxPriority = Math.max(maxPriority, rule.priority);
    }
  }

  return maxPriority;
}

/**
 * Check if request matches condition
 */
function matchesCondition(
  request: {
    userId: string;
    endpoint: string;
    method: string;
    headers: Record<string, string>;
  },
  condition: PriorityCondition
): boolean {
  if (condition.endpoint && !request.endpoint.includes(condition.endpoint)) {
    return false;
  }

  if (condition.method && request.method !== condition.method) {
    return false;
  }

  if (condition.timeOfDay) {
    const hour = new Date().getHours();
    if (hour < condition.timeOfDay.start || hour > condition.timeOfDay.end) {
      return false;
    }
  }

  if (condition.customHeaders) {
    for (const [key, value] of Object.entries(condition.customHeaders)) {
      if (request.headers[key] !== value) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Reorder queue by priority
 */
export async function reorderQueueByPriority(endpoint: string): Promise<void> {
  const requests = await prisma.queuedRequest.findMany({
    where: {
      endpoint,
      status: "QUEUED",
    },
  });

  for (const request of requests) {
    const priority = await calculateRequestPriority({
      userId: request.userId,
      endpoint: request.endpoint,
      method: "GET",
      headers: {},
    });

    await prisma.queuedRequest.update({
      where: { id: request.id },
      data: { priority: priority as any } as any,
    });
  }
}

/**
 * Get priority distribution
 */
export async function getPriorityDistribution(): Promise<{
  low: number;
  medium: number;
  high: number;
  critical: number;
}> {
  const requests = await prisma.queuedRequest.findMany({
    where: { status: "QUEUED" },
    select: { priority: true },
  });

  return {
    low: requests.filter((r) => r.priority === "LOW").length,
    medium: requests.filter((r) => r.priority === "MEDIUM").length,
    high: requests.filter((r) => r.priority === "HIGH").length,
    critical: requests.filter((r) => r.priority === "CRITICAL").length,
  };
}
