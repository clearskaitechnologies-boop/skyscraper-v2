/**
 * TASK 149: TENANT ANALYTICS
 *
 * Advanced tenant-level analytics and insights.
 */

import prisma from "@/lib/prisma";

export interface TenantAnalytics {
  tenantId: string;
  period: "DAY" | "WEEK" | "MONTH" | "YEAR";
  metrics: {
    activeUsers: number;
    newUsers: number;
    claimsProcessed: number;
    averageProcessingTime: number;
    documentUploads: number;
    apiUsage: number;
    storageUsed: number;
  };
  trends: {
    userGrowth: number;
    claimGrowth: number;
    engagementScore: number;
  };
}

export async function getTenantAnalytics(
  tenantId: string,
  period: "DAY" | "WEEK" | "MONTH" | "YEAR" = "MONTH"
): Promise<TenantAnalytics> {
  const startDate = getStartDate(period);

  const [activeUsers, newUsers, claims, documents, apiCalls, storage] = await Promise.all([
    prisma.users.count({
      where: {
        organizationMemberships: { some: { organization: { tenantId } } },
        lastActiveAt: { gte: startDate },
      },
    }),
    prisma.users.count({
      where: {
        organizationMemberships: { some: { organization: { tenantId } } },
        createdAt: { gte: startDate },
      },
    }),
    prisma.claims.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
    }),
    prisma.document.count({
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
    }),
    prisma.apiLog.count({
      where: {
        tenantId,
        timestamp: { gte: startDate },
      },
    }),
    prisma.document.aggregate({
      where: { tenantId },
      _sum: { fileSize: true },
    }),
  ]);

  // Calculate average processing time
  const avgProcessingTime =
    claims.length > 0
      ? claims.reduce((sum, c) => {
          const duration = c.updatedAt.getTime() - c.createdAt.getTime();
          return sum + duration;
        }, 0) / claims.length
      : 0;

  // Calculate growth trends
  const previousPeriodStart = getStartDate(period, 2);
  const previousUsers = await prisma.users.count({
    where: {
      organizationMemberships: { some: { organization: { tenantId } } },
      createdAt: {
        gte: previousPeriodStart,
        lt: startDate,
      },
    },
  });

  const userGrowth = previousUsers > 0 ? ((newUsers - previousUsers) / previousUsers) * 100 : 100;

  const previousClaims = await prisma.claims.count({
    where: {
      tenantId,
      createdAt: {
        gte: previousPeriodStart,
        lt: startDate,
      },
    },
  });

  const claimGrowth =
    previousClaims > 0 ? ((claims.length - previousClaims) / previousClaims) * 100 : 100;

  // Engagement score (0-100)
  const totalUsers = await prisma.users.count({
    where: {
      organizationMemberships: { some: { organization: { tenantId } } },
    },
  });
  const engagementScore = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

  return {
    tenantId,
    period,
    metrics: {
      activeUsers,
      newUsers,
      claimsProcessed: claims.length,
      averageProcessingTime: avgProcessingTime / (1000 * 60 * 60), // hours
      documentUploads: documents,
      apiUsage: apiCalls,
      storageUsed: (storage._sum.fileSize || 0) / (1024 * 1024 * 1024), // GB
    },
    trends: {
      userGrowth: Math.round(userGrowth * 100) / 100,
      claimGrowth: Math.round(claimGrowth * 100) / 100,
      engagementScore: Math.round(engagementScore * 100) / 100,
    },
  };
}

function getStartDate(period: string, multiplier: number = 1): Date {
  const now = new Date();
  switch (period) {
    case "DAY":
      now.setDate(now.getDate() - 1 * multiplier);
      break;
    case "WEEK":
      now.setDate(now.getDate() - 7 * multiplier);
      break;
    case "MONTH":
      now.setMonth(now.getMonth() - 1 * multiplier);
      break;
    case "YEAR":
      now.setFullYear(now.getFullYear() - 1 * multiplier);
      break;
  }
  return now;
}

export async function getTenantInsights(tenantId: string): Promise<{
  topUsers: { userId: string; activity: number }[];
  popularFeatures: { feature: string; usage: number }[];
  peakHours: { hour: number; activity: number }[];
}> {
  // Top users by activity
  const activities = await prisma.activity.groupBy({
    by: ["userId"],
    where: { tenantId },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const topUsers = activities.map((a) => ({
    userId: a.userId,
    activity: a._count.id,
  }));

  // Popular features — will be wired to real feature usage tracking
  const popularFeatures: { feature: string; usage: number }[] = [];

  // Peak hours — will be computed from real activity timestamps
  const peakHours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    activity: 0,
  }));

  return {
    topUsers,
    popularFeatures,
    peakHours,
  };
}
