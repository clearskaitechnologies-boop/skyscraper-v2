/**
 * Usage Analytics Tracking
 *
 * Tracks user and org usage for billing and analytics
 * Records API calls, storage usage, feature usage
 */

import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface UsageMetrics {
  orgId: string;
  period: string; // YYYY-MM
  apiCalls: number;
  storageBytes: number;
  activeUsers: number;
  claimsCreated: number;
  leadsCreated: number;
  documentsUploaded: number;
  messagesExchanged: number;
  reportsGenerated: number;
}

/**
 * Track API call
 */
export async function trackAPICall(
  orgId: string,
  endpoint: string,
  userId?: string
): Promise<void> {
  try {
    const period = getCurrentPeriod();

    await prisma.usageMetrics
      .upsert({
        where: {
          orgId_period: { orgId, period },
        },
        create: {
          orgId,
          period,
          apiCalls: 1,
          storageBytes: 0,
          activeUsers: 0,
          claimsCreated: 0,
          leadsCreated: 0,
          documentsUploaded: 0,
          messagesExchanged: 0,
          reportsGenerated: 0,
        },
        update: {
          apiCalls: {
            increment: 1,
          },
        },
      })
      .catch(() => {
        // Graceful fallback if table doesn't exist
      });

    // Track endpoint-specific metrics
    await trackEndpointUsage(orgId, endpoint);
  } catch (error) {
    // Don't fail requests if tracking fails
    logger.error("Failed to track API call:", error);
  }
}

/**
 * Track storage usage
 */
export async function trackStorageUsage(orgId: string, bytes: number): Promise<void> {
  try {
    const period = getCurrentPeriod();

    await prisma.usageMetrics
      .upsert({
        where: {
          orgId_period: { orgId, period },
        },
        create: {
          orgId,
          period,
          apiCalls: 0,
          storageBytes: bytes,
          activeUsers: 0,
          claimsCreated: 0,
          leadsCreated: 0,
          documentsUploaded: 0,
          messagesExchanged: 0,
          reportsGenerated: 0,
        },
        update: {
          storageBytes: {
            increment: bytes,
          },
          documentsUploaded: {
            increment: 1,
          },
        },
      })
      .catch(() => {});
  } catch (error) {
    logger.error("Failed to track storage usage:", error);
  }
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  orgId: string,
  feature: "claim" | "lead" | "message" | "report"
): Promise<void> {
  try {
    const period = getCurrentPeriod();

    const updateFields: Record<string, any> = {};

    switch (feature) {
      case "claim":
        updateFields.claimsCreated = { increment: 1 };
        break;
      case "lead":
        updateFields.leadsCreated = { increment: 1 };
        break;
      case "message":
        updateFields.messagesExchanged = { increment: 1 };
        break;
      case "report":
        updateFields.reportsGenerated = { increment: 1 };
        break;
    }

    await prisma.usageMetrics
      .upsert({
        where: {
          orgId_period: { orgId, period },
        },
        create: {
          orgId,
          period,
          apiCalls: 0,
          storageBytes: 0,
          activeUsers: 0,
          claimsCreated: feature === "claim" ? 1 : 0,
          leadsCreated: feature === "lead" ? 1 : 0,
          documentsUploaded: 0,
          messagesExchanged: feature === "message" ? 1 : 0,
          reportsGenerated: feature === "report" ? 1 : 0,
        },
        update: updateFields,
      })
      .catch(() => {});
  } catch (error) {
    logger.error("Failed to track feature usage:", error);
  }
}

/**
 * Track active user
 */
export async function trackActiveUser(orgId: string, userId: string): Promise<void> {
  try {
    const period = getCurrentPeriod();

    // Track in separate table for deduplication
    await prisma.activeUsers
      .upsert({
        where: {
          orgId_userId_period: { orgId, userId, period },
        },
        create: {
          orgId,
          userId,
          period,
          lastActive: new Date(),
        },
        update: {
          lastActive: new Date(),
        },
      })
      .catch(() => {});

    // Update count
    const activeCount = await prisma.activeUsers
      .count({
        where: { orgId, period },
      })
      .catch(() => 0);

    await prisma.usageMetrics
      .upsert({
        where: {
          orgId_period: { orgId, period },
        },
        create: {
          orgId,
          period,
          apiCalls: 0,
          storageBytes: 0,
          activeUsers: activeCount,
          claimsCreated: 0,
          leadsCreated: 0,
          documentsUploaded: 0,
          messagesExchanged: 0,
          reportsGenerated: 0,
        },
        update: {
          activeUsers: activeCount,
        },
      })
      .catch(() => {});
  } catch (error) {
    logger.error("Failed to track active user:", error);
  }
}

/**
 * Get usage metrics for org
 */
export async function getUsageMetrics(
  orgId: string,
  period?: string
): Promise<UsageMetrics | null> {
  try {
    const targetPeriod = period || getCurrentPeriod();

    const metrics = await prisma.usageMetrics.findUnique({
      where: {
        orgId_period: { orgId, period: targetPeriod },
      },
    });

    return metrics as UsageMetrics | null;
  } catch {
    return null;
  }
}

/**
 * Get usage history for org
 */
export async function getUsageHistory(orgId: string, months: number = 12): Promise<UsageMetrics[]> {
  try {
    const periods = getRecentPeriods(months);

    const metrics = await prisma.usageMetrics.findMany({
      where: {
        orgId,
        period: {
          in: periods,
        },
      },
      orderBy: {
        period: "desc",
      },
    });

    return metrics as UsageMetrics[];
  } catch {
    return [];
  }
}

/**
 * Track endpoint-specific usage
 */
async function trackEndpointUsage(orgId: string, endpoint: string): Promise<void> {
  try {
    const period = getCurrentPeriod();

    await prisma.endpointUsage
      .upsert({
        where: {
          orgId_endpoint_period: { orgId, endpoint, period },
        },
        create: {
          orgId,
          endpoint,
          period,
          count: 1,
        },
        update: {
          count: {
            increment: 1,
          },
        },
      })
      .catch(() => {});
  } catch {
    // Ignore
  }
}

/**
 * Get current period (YYYY-MM)
 */
function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Get recent periods
 */
function getRecentPeriods(months: number): string[] {
  const periods: string[] = [];
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    periods.push(`${year}-${month}`);
  }

  return periods;
}
