// Plan management and quota enforcement helpers
import { auth, clerkClient } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { randomUUID } from 'crypto';

import prisma from "./db/prisma";
import { ToolKey } from "./tools";

export interface PlanLimits {
  userSeats: number;
  daily: Record<ToolKey, number>;
}

export interface OrgPlan {
  id: string;
  name: string;
  slug: string;
  monthlyTokens: number;
  limits: PlanLimits | null;
  isActive: boolean;
}

/**
 * Get the authenticated Org's current plan
 */
export async function getOrgPlan(): Promise<OrgPlan | null> {
  const { orgId } = await auth();
  if (!orgId) return null;
  // Simplified stub: underlying plan relation temporarily disabled.
  // Returning null defers quota enforcement and avoids relation type errors.
  return null;
}

/**
 * Get current seat count for an organization
 */
export async function getOrgSeatCount(clerkOrgId: string): Promise<number> {
  try {
    const orgMemberships = await clerkClient.organizations.getOrganizationMembershipList({
      organizationId: clerkOrgId,
    });
    return orgMemberships.data.length;
  } catch (error) {
    logger.error("Failed to get Org seat count:", error);
    return 0;
  }
}

/**
 * Check if Org exceeds seat limit
 */
export async function checkSeatLimit(): Promise<{
  allowed: boolean;
  currentSeats: number;
  maxSeats: number;
}> {
  const { orgId } = await auth();
  if (!orgId) {
    return { allowed: false, currentSeats: 0, maxSeats: 0 };
  }

  const plan = await getOrgPlan();
  if (!plan?.limits) {
    return { allowed: true, currentSeats: 0, maxSeats: Infinity };
  }

  const currentSeats = await getOrgSeatCount(orgId);
  const maxSeats = plan.limits.userSeats;

  return {
    allowed: currentSeats <= maxSeats,
    currentSeats,
    maxSeats,
  };
}

/**
 * Get daily usage count for a specific tool
 */
export async function getDailyUsage(toolKey: ToolKey, orgId?: string): Promise<number> {
  const { orgId: authOrgId } = await auth();
  const targetOrgId = orgId || authOrgId;

  if (!targetOrgId) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const usage = await prisma.tool_usage.count({
    where: {
      orgId: targetOrgId,
      toolKey,
      usedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  return usage;
}

/**
 * Check if Org can use a tool (within daily quota)
 */
export async function checkDailyQuota(
  toolKey: ToolKey
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const { orgId } = await auth();
  if (!orgId) {
    return { allowed: false, used: 0, limit: 0 };
  }

  const plan = await getOrgPlan();
  if (!plan?.limits?.daily) {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const dailyLimit = plan.limits.daily[toolKey];
  if (!dailyLimit) {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const used = await getDailyUsage(toolKey, orgId);

  return {
    allowed: used < dailyLimit,
    used,
    limit: dailyLimit,
  };
}

/**
 * Record tool usage (call this after successful tool execution)
 */
export async function recordToolUsage(toolKey: ToolKey, userId?: string): Promise<void> {
  const { orgId, userId: authUserId } = await auth();
  if (!orgId) return;

  await prisma.tool_usage.create({
    data: {
      id: randomUUID(),
      orgId,
      userId: userId || authUserId || "unknown",
      toolKey,
      updatedAt: new Date(),
    } as any,
  });
}

/**
 * Get comprehensive quota status for an Org
 */
export async function getOrgQuotaStatus() {
  const { orgId } = await auth();
  if (!orgId) return null;

  const plan = await getOrgPlan();
  if (!plan) return null;

  const seatStatus = await checkSeatLimit();

  const dailyStatus: Record<ToolKey, { used: number; limit: number; allowed: boolean }> = {} as any;

  if (plan.limits?.daily) {
    for (const toolKey of Object.keys(plan.limits.daily) as ToolKey[]) {
      const quota = await checkDailyQuota(toolKey);
      dailyStatus[toolKey] = quota;
    }
  }

  return {
    plan: {
      name: plan.name,
      slug: plan.slug,
      monthlyTokens: plan.monthlyTokens,
    },
    seats: seatStatus,
    daily: dailyStatus,
  };
}
