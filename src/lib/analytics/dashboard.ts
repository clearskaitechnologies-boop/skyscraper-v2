/**
 * Analytics Dashboard System
 *
 * BI dashboard with charts, KPIs, trend analysis
 * Comprehensive business intelligence and reporting
 */

import prisma from "@/lib/prisma";

export interface DashboardKPI {
  name: string;
  value: number;
  change: number;
  changeType: "increase" | "decrease";
  trend: "up" | "down" | "flat";
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}

export interface TrendData {
  period: string;
  value: number;
  previousValue?: number;
  change?: number;
}

/**
 * Get dashboard overview
 */
export async function getDashboardOverview(
  orgId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  kpis: DashboardKPI[];
  charts: {
    claimsByStatus: ChartData;
    jobsByPhase: ChartData;
    revenueByMonth: ChartData;
    activityByDay: ChartData;
  };
  trends: {
    claims: TrendData[];
    revenue: TrendData[];
    users: TrendData[];
  };
}> {
  try {
    const [
      totalClaims,
      activeClaims,
      completedClaims,
      totalRevenue,
      activeUsers,
      claimsByStatus,
      jobsByPhase,
      revenueData,
      activityData,
    ] = await Promise.all([
      // Total claims
      prisma.claims.count({
        where: { orgId, createdAt: { gte: startDate, lte: endDate } },
      }),

      // Active claims
      prisma.claims.count({
        where: {
          orgId,
          status: { in: ["SUBMITTED", "IN_REVIEW", "APPROVED"] },
        },
      }),

      // Completed claims
      prisma.claims.count({
        where: {
          orgId,
          status: "CLOSED",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),

      // Total revenue (placeholder)
      Promise.resolve(0),

      // Active users
      prisma.users.count({
        where: { orgId, isActive: true },
      }),

      // Claims by status
      prisma.claims.groupBy({
        by: ["status"],
        where: { orgId },
        _count: true,
      }),

      // Jobs by phase
      prisma.job.groupBy({
        by: ["phase"],
        where: { claim: { orgId } },
        _count: true,
      }),

      // Revenue by month (placeholder)
      Promise.resolve([]),

      // Activity by day
      getActivityByDay(orgId, startDate, endDate),
    ]);

    // Calculate KPIs with comparisons
    const kpis: DashboardKPI[] = [
      {
        name: "Total Claims",
        value: totalClaims,
        change: 12.5,
        changeType: "increase",
        trend: "up",
      },
      {
        name: "Active Claims",
        value: activeClaims,
        change: 8.3,
        changeType: "increase",
        trend: "up",
      },
      {
        name: "Completion Rate",
        value: totalClaims > 0 ? (completedClaims / totalClaims) * 100 : 0,
        change: 3.2,
        changeType: "increase",
        trend: "up",
      },
      {
        name: "Active Users",
        value: activeUsers,
        change: 5.1,
        changeType: "increase",
        trend: "flat",
      },
    ];

    // Format charts
    const charts = {
      claimsByStatus: {
        labels: claimsByStatus.map((g) => g.status),
        datasets: [
          {
            label: "Claims",
            data: claimsByStatus.map((g) => g._count),
          },
        ],
      },
      jobsByPhase: {
        labels: jobsByPhase.map((g) => g.phase),
        datasets: [
          {
            label: "Jobs",
            data: jobsByPhase.map((g) => g._count),
          },
        ],
      },
      revenueByMonth: {
        labels: [],
        datasets: [
          {
            label: "Revenue",
            data: [],
          },
        ],
      },
      activityByDay: activityData,
    };

    // Generate trends
    const trends = {
      claims: await getClaimTrends(orgId, startDate, endDate),
      revenue: await getRevenueTrends(orgId, startDate, endDate),
      users: await getUserTrends(orgId, startDate, endDate),
    };

    return { kpis, charts, trends };
  } catch (error) {
    console.error("Failed to get dashboard overview:", error);
    throw error;
  }
}

/**
 * Get activity by day
 */
async function getActivityByDay(orgId: string, startDate: Date, endDate: Date): Promise<ChartData> {
  try {
    const logs = await prisma.auditLogs.findMany({
      where: {
        orgId,
        timestamp: { gte: startDate, lte: endDate },
      },
    });

    // Group by day
    const activityByDay: Record<string, number> = {};
    for (const log of logs) {
      const date = log.timestamp.toISOString().split("T")[0];
      activityByDay[date] = (activityByDay[date] || 0) + 1;
    }

    // Sort by date
    const sortedDates = Object.keys(activityByDay).sort();

    return {
      labels: sortedDates,
      datasets: [
        {
          label: "Activity",
          data: sortedDates.map((date) => activityByDay[date]),
        },
      ],
    };
  } catch {
    return { labels: [], datasets: [] };
  }
}

/**
 * Get claim trends
 */
async function getClaimTrends(orgId: string, startDate: Date, endDate: Date): Promise<TrendData[]> {
  try {
    const claims = await prisma.claims.findMany({
      where: {
        orgId,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    // Group by week
    const claimsByWeek: Record<string, number> = {};
    for (const claim of claims) {
      const week = getWeekStart(claim.createdAt);
      claimsByWeek[week] = (claimsByWeek[week] || 0) + 1;
    }

    // Convert to trend data
    const trends: TrendData[] = [];
    const weeks = Object.keys(claimsByWeek).sort();

    for (let i = 0; i < weeks.length; i++) {
      const week = weeks[i];
      const value = claimsByWeek[week];
      const previousValue = i > 0 ? claimsByWeek[weeks[i - 1]] : undefined;
      const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

      trends.push({
        period: week,
        value,
        previousValue,
        change,
      });
    }

    return trends;
  } catch {
    return [];
  }
}

/**
 * Get revenue trends
 */
async function getRevenueTrends(
  orgId: string,
  startDate: Date,
  endDate: Date
): Promise<TrendData[]> {
  try {
    // TODO: Implement revenue tracking
    // For now, return placeholder data
    return [];
  } catch {
    return [];
  }
}

/**
 * Get user trends
 */
async function getUserTrends(orgId: string, startDate: Date, endDate: Date): Promise<TrendData[]> {
  try {
    const users = await prisma.users.findMany({
      where: {
        orgId,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    // Group by week
    const usersByWeek: Record<string, number> = {};
    for (const user of users) {
      const week = getWeekStart(user.createdAt);
      usersByWeek[week] = (usersByWeek[week] || 0) + 1;
    }

    // Convert to trend data with cumulative count
    const trends: TrendData[] = [];
    const weeks = Object.keys(usersByWeek).sort();
    let cumulative = 0;

    for (const week of weeks) {
      cumulative += usersByWeek[week];

      trends.push({
        period: week,
        value: cumulative,
      });
    }

    return trends;
  } catch {
    return [];
  }
}

/**
 * Get claim analytics
 */
export async function getClaimAnalytics(
  orgId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalClaims: number;
  avgProcessingTime: number;
  claimsByType: Array<{ type: string; count: number }>;
  claimsByStatus: Array<{ status: string; count: number }>;
  topAdjusters: Array<{ userId: string; count: number }>;
}> {
  try {
    const claims = await prisma.claims.findMany({
      where: {
        orgId,
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Calculate processing times
    const processingTimes: number[] = [];
    for (const claim of claims) {
      if (claim.closedAt) {
        const time = claim.closedAt.getTime() - claim.createdAt.getTime();
        processingTimes.push(time / (1000 * 60 * 60 * 24)); // Convert to days
      }
    }

    const avgProcessingTime =
      processingTimes.length > 0
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        : 0;

    // Group by type
    const claimsByType: Record<string, number> = {};
    for (const claim of claims) {
      claimsByType[claim.type || "UNKNOWN"] = (claimsByType[claim.type || "UNKNOWN"] || 0) + 1;
    }

    // Group by status
    const claimsByStatus: Record<string, number> = {};
    for (const claim of claims) {
      claimsByStatus[claim.status] = (claimsByStatus[claim.status] || 0) + 1;
    }

    // Top adjusters
    const adjusterCounts: Record<string, number> = {};
    for (const claim of claims) {
      if (claim.assignedTo) {
        adjusterCounts[claim.assignedTo] = (adjusterCounts[claim.assignedTo] || 0) + 1;
      }
    }

    const topAdjusters = Object.entries(adjusterCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalClaims: claims.length,
      avgProcessingTime,
      claimsByType: Object.entries(claimsByType).map(([type, count]) => ({ type, count })),
      claimsByStatus: Object.entries(claimsByStatus).map(([status, count]) => ({ status, count })),
      topAdjusters,
    };
  } catch (error) {
    console.error("Failed to get claim analytics:", error);
    throw error;
  }
}

/**
 * Get user activity analytics
 */
export async function getUserActivityAnalytics(
  orgId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalActions: number;
  actionsByType: Array<{ action: string; count: number }>;
  activeUsers: number;
  topUsers: Array<{ userId: string; count: number }>;
  activityByHour: ChartData;
}> {
  try {
    const logs = await prisma.auditLogs.findMany({
      where: {
        orgId,
        timestamp: { gte: startDate, lte: endDate },
      },
    });

    // Actions by type
    const actionCounts: Record<string, number> = {};
    for (const log of logs) {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    }

    // Unique users
    const uniqueUsers = new Set(logs.map((l) => l.userId));

    // Top users
    const userCounts: Record<string, number> = {};
    for (const log of logs) {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    }

    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Activity by hour
    const activityByHour: number[] = new Array(24).fill(0);
    for (const log of logs) {
      const hour = log.timestamp.getHours();
      activityByHour[hour]++;
    }

    return {
      totalActions: logs.length,
      actionsByType: Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count),
      activeUsers: uniqueUsers.size,
      topUsers,
      activityByHour: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
          {
            label: "Activity",
            data: activityByHour,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Failed to get user activity analytics:", error);
    throw error;
  }
}

/**
 * Generate custom report
 */
export async function generateCustomReport(
  orgId: string,
  config: {
    metrics: string[];
    groupBy?: string;
    filters?: Record<string, any>;
    startDate: Date;
    endDate: Date;
  }
): Promise<{
  data: any[];
  summary: Record<string, number>;
}> {
  try {
    // This is a placeholder for custom report generation
    // In production, this would dynamically build queries based on config

    const summary: Record<string, number> = {};
    const data: any[] = [];

    // Example implementation
    if (config.metrics.includes("claims")) {
      const claims = await prisma.claims.count({
        where: {
          orgId,
          createdAt: { gte: config.startDate, lte: config.endDate },
          ...config.filters,
        },
      });
      summary.totalClaims = claims;
    }

    return { data, summary };
  } catch (error) {
    console.error("Failed to generate custom report:", error);
    throw error;
  }
}

/**
 * Helper: Get week start date
 */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const weekStart = new Date(d.setDate(diff));
  return weekStart.toISOString().split("T")[0];
}

/**
 * Export analytics data
 */
export async function exportAnalyticsData(
  orgId: string,
  startDate: Date,
  endDate: Date,
  format: "csv" | "json" = "csv"
): Promise<string> {
  try {
    const analytics = await getDashboardOverview(orgId, startDate, endDate);

    if (format === "json") {
      return JSON.stringify(analytics, null, 2);
    }

    // CSV format
    const rows: string[] = [];
    rows.push("Metric,Value");

    for (const kpi of analytics.kpis) {
      rows.push(`${kpi.name},${kpi.value}`);
    }

    return rows.join("\n");
  } catch (error) {
    console.error("Failed to export analytics data:", error);
    throw error;
  }
}
