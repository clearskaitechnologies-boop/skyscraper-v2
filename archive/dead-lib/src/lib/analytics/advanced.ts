/**
 * TASK 101: ADVANCED ANALYTICS
 *
 * Deep analytics with custom metrics, funnels, cohorts, and predictive insights.
 */

import { prismaModel } from "@/lib/db/prismaModel";

export type MetricType =
  | "COUNT"
  | "SUM"
  | "AVERAGE"
  | "MIN"
  | "MAX"
  | "PERCENTAGE"
  | "RATIO"
  | "GROWTH_RATE";

export type TimeGranularity = "hour" | "day" | "week" | "month" | "quarter" | "year";

export interface CustomMetric {
  id: string;
  name: string;
  description?: string;
  type: MetricType;
  formula: string;
  filters?: Record<string, any>;
  groupBy?: string[];
}

export interface AnalyticsQuery {
  metrics: string[];
  dimensions?: string[];
  filters?: Record<string, any>;
  dateRange?: { start: Date; end: Date };
  granularity?: TimeGranularity;
  limit?: number;
}

/**
 * Execute analytics query
 */
export async function executeAnalyticsQuery(
  organizationId: string,
  query: AnalyticsQuery
): Promise<any[]> {
  const results: any[] = [];

  // Get claims metrics
  if (query.metrics.includes("claims_total")) {
    const count = await prismaModel.claims
      .count({
        where: {
          orgId: organizationId,
          ...buildFilters(query.filters),
        },
      })
      .catch(() => 0);
    results.push({ metric: "claims_total", value: count });
  }

  if (query.metrics.includes("claims_value")) {
    const aggregate = await prismaModel.claims
      .aggregate({ where: { orgId: organizationId }, _sum: { estimatedValue: true } })
      .catch(() => ({ _sum: { estimatedValue: 0 } }) as any);
    results.push({
      metric: "claims_value",
      value: aggregate._sum.estimatedValue || 0,
    });
  }

  if (query.metrics.includes("avg_claim_value")) {
    const aggregate = await prismaModel.claims
      .aggregate({ where: { orgId: organizationId }, _avg: { estimatedValue: true } })
      .catch(() => ({ _avg: { estimatedValue: 0 } }) as any);
    results.push({
      metric: "avg_claim_value",
      value: aggregate._avg.estimatedValue || 0,
    });
  }

  // Get job metrics
  if (query.metrics.includes("jobs_total")) {
    const count = await prismaModel.jobs.count({ where: { orgId: organizationId } }).catch(() => 0);
    results.push({ metric: "jobs_total", value: count });
  }

  if (query.metrics.includes("revenue_total")) {
    const aggregate = await prismaModel.jobs
      .aggregate({ where: { orgId: organizationId }, _sum: { totalPrice: true } })
      .catch(() => ({ _sum: { totalPrice: 0 } }) as any);
    results.push({
      metric: "revenue_total",
      value: aggregate._sum.totalPrice || 0,
    });
  }

  return results;
}

/**
 * Get time series data
 */
export async function getTimeSeries(
  organizationId: string,
  metric: string,
  options: {
    dateRange: { start: Date; end: Date };
    granularity: TimeGranularity;
    filters?: Record<string, any>;
  }
): Promise<{ date: string; value: number }[]> {
  const { start, end, granularity } = options.dateRange;

  const claims = await prismaModel.claims
    .findMany({
      where: { orgId: organizationId, createdAt: { gte: start, lte: end } },
      select: { createdAt: true, estimatedValue: true },
    })
    .catch(() => []);

  const groupedData: Record<string, number> = {};

  claims.forEach((claim) => {
    const key = formatDateByGranularity(claim.createdAt, granularity);
    groupedData[key] = (groupedData[key] || 0) + (claim.estimatedValue || 0);
  });

  return Object.entries(groupedData)
    .map(([date, value]) => ({
      date,
      value,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate conversion funnel
 */
export async function calculateFunnel(
  organizationId: string,
  stages: string[]
): Promise<{ stage: string; count: number; percentage: number }[]> {
  const results: { stage: string; count: number; percentage: number }[] = [];

  // Stage 1: Total claims
  const totalClaims = await prismaModel.claims
    .count({ where: { orgId: organizationId } })
    .catch(() => 0);
  results.push({ stage: stages[0], count: totalClaims, percentage: 100 });

  // Stage 2: Claims with jobs
  // Without relations, approximate by counting jobs for org
  const claimsWithJobs = await prismaModel.jobs
    .count({ where: { orgId: organizationId } })
    .catch(() => 0);
  results.push({
    stage: stages[1],
    count: claimsWithJobs,
    percentage: (claimsWithJobs / totalClaims) * 100,
  });

  // Stage 3: Jobs completed
  const completedJobs = await prismaModel.jobs
    .count({ where: { orgId: organizationId, status: "COMPLETED" as any } })
    .catch(() => 0);
  results.push({
    stage: stages[2],
    count: completedJobs,
    percentage: (completedJobs / totalClaims) * 100,
  });

  return results;
}

/**
 * Cohort analysis
 */
export async function analyzeCohorts(
  organizationId: string,
  options: {
    cohortBy: "month" | "week";
    metric: string;
    periods: number;
  }
): Promise<any[]> {
  // Get all claims grouped by cohort
  const claims = await prismaModel.claims
    .findMany({
      where: { orgId: organizationId },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    })
    .catch(() => []);

  const cohorts: Record<string, string[]> = {};

  claims.forEach((claim) => {
    const cohortKey =
      options.cohortBy === "month"
        ? `${claim.createdAt.getFullYear()}-${claim.createdAt.getMonth() + 1}`
        : `${claim.createdAt.getFullYear()}-W${getWeekNumber(claim.createdAt)}`;

    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = [];
    }
    cohorts[cohortKey].push(claim.id);
  });

  return Object.entries(cohorts).map(([cohort, claimIds]) => ({
    cohort,
    size: claimIds.length,
    retention: [], // TODO: Calculate retention rates
  }));
}

/**
 * Predictive analytics
 */
export async function predictTrend(
  organizationId: string,
  metric: string,
  periods: number = 3
): Promise<{ period: string; predicted: number; confidence: number }[]> {
  // Get historical data
  const lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  const timeSeries = await getTimeSeries(organizationId, metric, {
    dateRange: { start: lastYear, end: new Date() },
    granularity: "month",
  });

  // Simple linear regression for prediction
  const predictions: { period: string; predicted: number; confidence: number }[] = [];

  const values = timeSeries.map((d) => d.value);
  const trend = calculateLinearTrend(values);

  for (let i = 1; i <= periods; i++) {
    const nextValue = values[values.length - 1] + trend * i;
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + i);

    predictions.push({
      period: formatDateByGranularity(nextDate, "month"),
      predicted: Math.max(0, nextValue),
      confidence: 0.7 - i * 0.1, // Confidence decreases over time
    });
  }

  return predictions;
}

/**
 * Get KPI dashboard
 */
export async function getKPIDashboard(organizationId: string): Promise<{
  revenue: { current: number; previous: number; change: number };
  claims: { current: number; previous: number; change: number };
  conversion: { current: number; previous: number; change: number };
  avgValue: { current: number; previous: number; change: number };
}> {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Revenue
  const currentRevenue = await prismaModel.jobs.aggregate({
    where: {
      orgId: organizationId,
      createdAt: { gte: currentMonth },
    },
    _sum: { totalPrice: true },
  });

  const previousRevenue = await prismaModel.jobs.aggregate({
    where: {
      orgId: organizationId,
      createdAt: { gte: previousMonth, lt: currentMonth },
    },
    _sum: { totalPrice: true },
  });

  const revenue = {
    current: currentRevenue._sum.totalPrice || 0,
    previous: previousRevenue._sum.totalPrice || 0,
    change: 0,
  };
  revenue.change = calculatePercentageChange(revenue.previous, revenue.current);

  // Claims
  const currentClaims = await prismaModel.claims
    .count({
      where: {
        orgId: organizationId,
        createdAt: { gte: currentMonth },
      },
    })
    .catch(() => 0);

  const previousClaims = await prismaModel.claims
    .count({
      where: {
        orgId: organizationId,
        createdAt: { gte: previousMonth, lt: currentMonth },
      },
    })
    .catch(() => 0);

  const claims = {
    current: currentClaims,
    previous: previousClaims,
    change: calculatePercentageChange(previousClaims, currentClaims),
  };

  // Conversion rate (claims to jobs)
  const currentJobs = await prismaModel.jobs
    .count({
      where: {
        orgId: organizationId,
        createdAt: { gte: currentMonth },
      },
    })
    .catch(() => 0);

  const previousJobs = await prismaModel.jobs
    .count({
      where: {
        orgId: organizationId,
        createdAt: { gte: previousMonth, lt: currentMonth },
      },
    })
    .catch(() => 0);

  const conversion = {
    current: currentClaims > 0 ? (currentJobs / currentClaims) * 100 : 0,
    previous: previousClaims > 0 ? (previousJobs / previousClaims) * 100 : 0,
    change: 0,
  };
  conversion.change = conversion.current - conversion.previous;

  // Average claim value
  const currentAvg = await prismaModel.claims.aggregate({
    where: {
      orgId: organizationId,
      createdAt: { gte: currentMonth },
    },
    _avg: { estimatedValue: true },
  });

  const previousAvg = await prismaModel.claims.aggregate({
    where: {
      orgId: organizationId,
      createdAt: { gte: previousMonth, lt: currentMonth },
    },
    _avg: { estimatedValue: true },
  });

  const avgValue = {
    current: currentAvg._avg.estimatedValue || 0,
    previous: previousAvg._avg.estimatedValue || 0,
    change: 0,
  };
  avgValue.change = calculatePercentageChange(avgValue.previous, avgValue.current);

  return { revenue, claims, conversion, avgValue };
}

/**
 * Helper functions
 */

function buildFilters(filters?: Record<string, any>): any {
  if (!filters) return {};

  const whereClause: any = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      whereClause[key] = { in: value };
    } else {
      whereClause[key] = value;
    }
  });

  return whereClause;
}

function formatDateByGranularity(date: Date, granularity: TimeGranularity): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (granularity) {
    case "hour":
      return `${year}-${month}-${day} ${date.getHours()}:00`;
    case "day":
      return `${year}-${month}-${day}`;
    case "week":
      return `${year}-W${getWeekNumber(date)}`;
    case "month":
      return `${year}-${month}`;
    case "quarter":
      return `${year}-Q${Math.floor(date.getMonth() / 3) + 1}`;
    case "year":
      return `${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function calculateLinearTrend(values: number[]): number {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denominator = 0;

  values.forEach((y, x) => {
    numerator += (x - xMean) * (y - yMean);
    denominator += Math.pow(x - xMean, 2);
  });

  return numerator / denominator;
}

function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Export analytics data
 */
export async function exportAnalytics(
  organizationId: string,
  query: AnalyticsQuery,
  format: "json" | "csv" = "json"
): Promise<string> {
  const data = await executeAnalyticsQuery(organizationId, query);

  if (format === "json") {
    return JSON.stringify(data, null, 2);
  }

  // CSV format
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => row[h]).join(","));

  return [headers.join(","), ...rows].join("\n");
}
