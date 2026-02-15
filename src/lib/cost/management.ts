/**
 * TASK 180: COST MANAGEMENT
 *
 * Cloud cost tracking and budget management.
 */

import prisma from "@/lib/prisma";

export interface CostEntry {
  id: string;
  service: string;
  resource: string;
  amount: number;
  currency: string;
  period: Date;
  tags: Record<string, string>;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  spent: number;
  alertThresholds: number[];
  notificationChannels: string[];
}

/**
 * Record cost
 */
export async function recordCost(data: {
  service: string;
  resource: string;
  amount: number;
  currency?: string;
  tags?: Record<string, string>;
}): Promise<void> {
  await prisma.costEntry.create({
    data: {
      ...data,
      currency: data.currency || "USD",
      tags: (data.tags || {}) as any,
      period: new Date(),
    } as any,
  });
}

/**
 * Create budget
 */
export async function createBudget(data: {
  name: string;
  amount: number;
  period: Budget["period"];
  alertThresholds?: number[];
  notificationChannels?: string[];
}): Promise<string> {
  const budget = await prisma.budget.create({
    data: {
      ...data,
      spent: 0,
      alertThresholds: (data.alertThresholds || [50, 80, 100]) as any,
      notificationChannels: (data.notificationChannels || []) as any,
    } as any,
  });

  return budget.id;
}

/**
 * Check budget status
 */
export async function checkBudgetStatus(budgetId: string): Promise<{
  budget: Budget;
  utilization: number;
  status: "OK" | "WARNING" | "EXCEEDED";
  daysRemaining: number;
}> {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
  });

  if (!budget) {
    throw new Error("Budget not found");
  }

  // Calculate spent for current period
  const periodStart = getPeriodStart(budget.period as Budget["period"]);
  const costs = await prisma.costEntry.findMany({
    where: { period: { gte: periodStart } },
  });

  const spent = costs.reduce((sum, c) => sum + c.amount, 0);
  const utilization = (spent / budget.amount) * 100;

  let status: "OK" | "WARNING" | "EXCEEDED" = "OK";
  if (utilization >= 100) status = "EXCEEDED";
  else if (utilization >= 80) status = "WARNING";

  // Update budget
  await prisma.budget.update({
    where: { id: budgetId },
    data: { spent } as any,
  });

  const daysRemaining = getDaysRemaining(budget.period as Budget["period"]);

  return {
    budget: { ...budget, spent } as any,
    utilization,
    status,
    daysRemaining,
  };
}

/**
 * Get period start
 */
function getPeriodStart(period: Budget["period"]): Date {
  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case "DAILY":
      start.setHours(0, 0, 0, 0);
      break;
    case "WEEKLY":
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case "MONTHLY":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case "YEARLY":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return start;
}

/**
 * Get days remaining
 */
function getDaysRemaining(period: Budget["period"]): number {
  const now = new Date();
  let end = new Date(now);

  switch (period) {
    case "DAILY":
      end.setDate(now.getDate() + 1);
      end.setHours(0, 0, 0, 0);
      break;
    case "WEEKLY":
      end.setDate(now.getDate() + (7 - now.getDay()));
      end.setHours(0, 0, 0, 0);
      break;
    case "MONTHLY":
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case "YEARLY":
      end = new Date(now.getFullYear() + 1, 0, 1);
      break;
  }

  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get cost breakdown
 */
export async function getCostBreakdown(timeWindow: number = 30): Promise<{
  total: number;
  byService: { service: string; amount: number }[];
  byResource: { resource: string; amount: number }[];
  trend: { date: Date; amount: number }[];
}> {
  const since = new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000);

  const costs = await prisma.costEntry.findMany({
    where: { period: { gte: since } },
  });

  const total = costs.reduce((sum, c) => sum + c.amount, 0);

  // By service
  const serviceMap = new Map<string, number>();
  for (const cost of costs) {
    const current = serviceMap.get(cost.service) || 0;
    serviceMap.set(cost.service, current + cost.amount);
  }

  const byService = Array.from(serviceMap.entries())
    .map(([service, amount]) => ({ service, amount }))
    .sort((a, b) => b.amount - a.amount);

  // By resource
  const resourceMap = new Map<string, number>();
  for (const cost of costs) {
    const current = resourceMap.get(cost.resource) || 0;
    resourceMap.set(cost.resource, current + cost.amount);
  }

  const byResource = Array.from(resourceMap.entries())
    .map(([resource, amount]) => ({ resource, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Trend
  const dayMap = new Map<string, number>();
  for (const cost of costs) {
    const day = cost.period.toISOString().split("T")[0];
    const current = dayMap.get(day) || 0;
    dayMap.set(day, current + cost.amount);
  }

  const trend = Array.from(dayMap.entries())
    .map(([date, amount]) => ({ date: new Date(date), amount }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return { total, byService, byResource, trend };
}

/**
 * Forecast costs
 */
export async function forecastCosts(
  daysAhead: number = 30
): Promise<{ date: Date; projected: number }[]> {
  const historicalDays = 30;
  const since = new Date(Date.now() - historicalDays * 24 * 60 * 60 * 1000);

  const costs = await prisma.costEntry.findMany({
    where: { period: { gte: since } },
  });

  const dailyCosts = costs.reduce((sum, c) => sum + c.amount, 0) / historicalDays;

  const forecast: { date: Date; projected: number }[] = [];

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    // Simple linear projection with 10% growth
    const projected = dailyCosts * (1 + i / 100);
    forecast.push({ date, projected });
  }

  return forecast;
}

/**
 * Get cost anomalies
 */
export async function detectCostAnomalies(): Promise<
  {
    service: string;
    date: Date;
    amount: number;
    deviation: number;
  }[]
> {
  const days = 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const costs = await prisma.costEntry.findMany({
    where: { period: { gte: since } },
  });

  // Calculate average and std dev by service
  const serviceStats = new Map<string, { avg: number; stdDev: number }>();

  const serviceGroups = new Map<string, number[]>();
  for (const cost of costs) {
    if (!serviceGroups.has(cost.service)) {
      serviceGroups.set(cost.service, []);
    }
    serviceGroups.get(cost.service)!.push(cost.amount);
  }

  for (const [service, amounts] of serviceGroups) {
    const avg = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const variance = amounts.reduce((sum, a) => sum + Math.pow(a - avg, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    serviceStats.set(service, { avg, stdDev });
  }

  // Find anomalies (> 2 std devs)
  const anomalies: { service: string; date: Date; amount: number; deviation: number }[] = [];

  for (const cost of costs) {
    const stats = serviceStats.get(cost.service);
    if (!stats) continue;

    const deviation = (cost.amount - stats.avg) / stats.stdDev;
    if (Math.abs(deviation) > 2) {
      anomalies.push({
        service: cost.service,
        date: cost.period,
        amount: cost.amount,
        deviation,
      });
    }
  }

  return anomalies.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
}
