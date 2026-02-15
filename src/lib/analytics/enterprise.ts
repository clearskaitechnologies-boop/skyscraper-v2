/**
 * TASK 129: ENTERPRISE ANALYTICS DASHBOARD
 *
 * Real-time tenant analytics with KPIs and insights.
 */

import prisma from "@/lib/prisma";

export interface DashboardMetrics {
  overview: OverviewMetrics;
  usage: UsageMetrics;
  performance: PerformanceMetrics;
  revenue: RevenueMetrics;
  users: UserMetrics;
  trends: TrendData[];
}

export interface OverviewMetrics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalRevenue: number;
  growthRate: number;
}

export interface UsageMetrics {
  apiCalls: number;
  storageUsed: number;
  bandwidth: number;
  activeProjects: number;
  documentsProcessed: number;
}

export interface PerformanceMetrics {
  uptime: number;
  avgResponseTime: number;
  errorRate: number;
  requestsPerSecond: number;
}

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  churnRate: number;
  averageRevenuePerUser: number;
}

export interface UserMetrics {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  newUsers: number;
  retentionRate: number;
}

export interface TrendData {
  date: Date;
  value: number;
  metric: string;
}

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(tenantId?: string): Promise<DashboardMetrics> {
  const [overview, usage, performance, revenue, users, trends] = await Promise.all([
    getOverviewMetrics(tenantId),
    getUsageMetrics(tenantId),
    getPerformanceMetrics(tenantId),
    getRevenueMetrics(tenantId),
    getUserMetrics(tenantId),
    getTrends(tenantId),
  ]);

  return {
    overview,
    usage,
    performance,
    revenue,
    users,
    trends,
  };
}

/**
 * Get overview metrics
 */
async function getOverviewMetrics(tenantId?: string): Promise<OverviewMetrics> {
  const where = tenantId ? { tenantId } : {};

  const [totalTenants, activeTenants, totalUsers] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: "ACTIVE" } }),
    prisma.users.count({ where }),
  ]);

  // Calculate growth rate (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newTenantsLast30Days = await prisma.tenant.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

  const growthRate =
    (newTenantsLast30Days / Math.max(totalTenants - newTenantsLast30Days, 1)) * 100;

  return {
    totalTenants,
    activeTenants,
    totalUsers,
    totalRevenue: 0, // TODO: Calculate from subscription data
    growthRate: Math.round(growthRate * 100) / 100,
  };
}

/**
 * Get usage metrics
 */
async function getUsageMetrics(tenantId?: string): Promise<UsageMetrics> {
  const where = tenantId ? { tenantId } : {};

  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);

  const [apiCalls, documents, projects] = await Promise.all([
    prisma.apiLog.count({
      where: {
        ...where,
        timestamp: { gte: last24Hours },
      },
    }),
    prisma.document.count({ where }),
    prisma.job.count({ where }),
  ]);

  // Calculate storage
  const storageResult = await prisma.document.aggregate({
    where,
    _sum: { fileSize: true },
  });

  const storageUsed = (storageResult._sum.fileSize || 0) / (1024 * 1024 * 1024); // GB

  return {
    apiCalls,
    storageUsed: Math.round(storageUsed * 100) / 100,
    bandwidth: 0, // TODO: Track bandwidth usage
    activeProjects: projects,
    documentsProcessed: documents,
  };
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics(tenantId?: string): Promise<PerformanceMetrics> {
  const where = tenantId ? { tenantId } : {};
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);

  const apiLogs = await prisma.apiLog.findMany({
    where: {
      ...where,
      timestamp: { gte: last24Hours },
    },
  });

  const totalRequests = apiLogs.length;
  const errorCount = apiLogs.filter((log) => log.statusCode >= 400).length;
  const totalResponseTime = apiLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0);

  const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
  const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
  const requestsPerSecond = totalRequests / (24 * 60 * 60);

  return {
    uptime: 99.9, // TODO: Calculate actual uptime
    avgResponseTime: Math.round(avgResponseTime),
    errorRate: Math.round(errorRate * 100) / 100,
    requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
  };
}

/**
 * Get revenue metrics
 */
async function getRevenueMetrics(tenantId?: string): Promise<RevenueMetrics> {
  // TODO: Implement actual revenue calculation from subscriptions
  return {
    mrr: 0,
    arr: 0,
    churnRate: 0,
    averageRevenuePerUser: 0,
  };
}

/**
 * Get user metrics
 */
async function getUserMetrics(tenantId?: string): Promise<UserMetrics> {
  const where = tenantId ? { tenantId } : {};

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dailyActive, monthlyActive, newUsers] = await Promise.all([
    prisma.users.count({
      where: {
        ...where,
        lastActiveAt: { gte: oneDayAgo },
      },
    }),
    prisma.users.count({
      where: {
        ...where,
        lastActiveAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.users.count({
      where: {
        ...where,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
  ]);

  const totalUsers = await prisma.users.count({ where });
  const retentionRate = totalUsers > 0 ? (monthlyActive / totalUsers) * 100 : 0;

  return {
    dailyActiveUsers: dailyActive,
    monthlyActiveUsers: monthlyActive,
    newUsers,
    retentionRate: Math.round(retentionRate * 100) / 100,
  };
}

/**
 * Get trends
 */
async function getTrends(tenantId?: string): Promise<TrendData[]> {
  const trends: TrendData[] = [];
  const where = tenantId ? { tenantId } : {};

  // Last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Users
    const users = await prisma.users.count({
      where: {
        ...where,
        createdAt: {
          gte: date,
          lt: nextDay,
        },
      },
    });

    trends.push({
      date,
      value: users,
      metric: "users",
    });

    // API calls
    const apiCalls = await prisma.apiLog.count({
      where: {
        ...where,
        timestamp: {
          gte: date,
          lt: nextDay,
        },
      },
    });

    trends.push({
      date,
      value: apiCalls,
      metric: "apiCalls",
    });
  }

  return trends;
}

/**
 * Get real-time metrics
 */
export async function getRealTimeMetrics(tenantId?: string): Promise<{
  activeUsers: number;
  requestsPerMinute: number;
  currentErrorRate: number;
}> {
  const where = tenantId ? { tenantId } : {};

  const oneMinuteAgo = new Date();
  oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

  const [activeUsers, recentRequests] = await Promise.all([
    prisma.users.count({
      where: {
        ...where,
        lastActiveAt: { gte: fiveMinutesAgo },
      },
    }),
    prisma.apiLog.findMany({
      where: {
        ...where,
        timestamp: { gte: oneMinuteAgo },
      },
    }),
  ]);

  const errorCount = recentRequests.filter((r) => r.statusCode >= 400).length;
  const currentErrorRate =
    recentRequests.length > 0 ? (errorCount / recentRequests.length) * 100 : 0;

  return {
    activeUsers,
    requestsPerMinute: recentRequests.length,
    currentErrorRate: Math.round(currentErrorRate * 100) / 100,
  };
}

/**
 * Get tenant comparison
 */
export async function getTenantComparison(): Promise<
  {
    tenantId: string;
    metrics: {
      users: number;
      apiCalls: number;
      storage: number;
      revenue: number;
    };
  }[]
> {
  const tenants = await prisma.tenant.findMany({
    where: { status: "ACTIVE" },
  });

  const comparisons = await Promise.all(
    tenants.map(async (tenant) => {
      const usage = await getUsageMetrics(tenant.id);
      const overview = await getOverviewMetrics(tenant.id);

      return {
        tenantId: tenant.id,
        metrics: {
          users: overview.totalUsers,
          apiCalls: usage.apiCalls,
          storage: usage.storageUsed,
          revenue: 0, // TODO: Calculate revenue
        },
      };
    })
  );

  return comparisons;
}

/**
 * Get top performers
 */
export async function getTopPerformers(
  metric: "users" | "revenue" | "usage",
  limit: number = 10
): Promise<
  {
    tenantId: string;
    value: number;
  }[]
> {
  const comparisons = await getTenantComparison();

  const sorted = comparisons
    .map((c) => ({
      tenantId: c.tenantId,
      value:
        metric === "users"
          ? c.metrics.users
          : metric === "revenue"
            ? c.metrics.revenue
            : c.metrics.apiCalls,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  return sorted;
}

/**
 * Get alerts
 */
export async function getAlerts(tenantId?: string): Promise<
  {
    type: "WARNING" | "ERROR" | "CRITICAL";
    message: string;
    timestamp: Date;
  }[]
> {
  const alerts: any[] = [];

  // Check for high error rate
  const performance = await getPerformanceMetrics(tenantId);
  if (performance.errorRate > 5) {
    alerts.push({
      type: "ERROR",
      message: `High error rate: ${performance.errorRate}%`,
      timestamp: new Date(),
    });
  }

  // Check for low uptime
  if (performance.uptime < 99) {
    alerts.push({
      type: "CRITICAL",
      message: `Low uptime: ${performance.uptime}%`,
      timestamp: new Date(),
    });
  }

  return alerts;
}
