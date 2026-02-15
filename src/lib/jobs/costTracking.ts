/**
 * Job Cost & Revenue Tracking
 *
 * Financial tracking for each job: costs, revenue, profit margins
 * Material costs, labor costs, overhead, profit analysis
 */

import { logActivity } from "@/lib/activity/activityFeed";
import prisma from "@/lib/prisma";

export interface JobFinancials {
  jobId: string;

  // Revenue
  estimatedRevenue: number;
  actualRevenue: number;
  invoicedAmount: number;
  paidAmount: number;

  // Costs
  materialCosts: number;
  laborCosts: number;
  overheadCosts: number;
  totalCosts: number;

  // Profit
  grossProfit: number;
  netProfit: number;
  profitMargin: number;

  // Status
  budgetStatus: "ON_BUDGET" | "OVER_BUDGET" | "UNDER_BUDGET";
  lastUpdated: Date;
}

export interface CostEntry {
  id: string;
  jobId: string;
  orgId: string;
  type: "MATERIAL" | "LABOR" | "OVERHEAD" | "OTHER";
  category: string;
  description: string;
  amount: number;
  date: Date;
  vendor?: string;
  invoiceNumber?: string;
  createdBy: string;
}

/**
 * Add cost entry
 */
export async function addCost(
  orgId: string,
  jobId: string,
  data: {
    type: "MATERIAL" | "LABOR" | "OVERHEAD" | "OTHER";
    category: string;
    description: string;
    amount: number;
    date?: Date;
    vendor?: string;
    invoiceNumber?: string;
  },
  userId: string
): Promise<CostEntry> {
  const cost = await prisma.jobCosts
    .create({
      data: {
        jobId,
        orgId,
        type: data.type,
        category: data.category,
        description: data.description,
        amount: data.amount,
        date: data.date || new Date(),
        vendor: data.vendor,
        invoiceNumber: data.invoiceNumber,
        createdBy: userId,
      },
    })
    .catch(() => {
      throw new Error("Failed to add cost");
    });

  // Update job totals
  await updateJobFinancials(jobId, orgId);

  // Log activity
  await logActivity(orgId, {
    type: "UPDATED",
    userId,
    resourceType: "JOB",
    resourceId: jobId,
    action: "Cost Added",
    description: `Added ${data.type} cost: $${data.amount}`,
  });

  return cost as CostEntry;
}

/**
 * Record revenue/payment
 */
export async function recordRevenue(
  orgId: string,
  jobId: string,
  data: {
    type: "INVOICE" | "PAYMENT";
    amount: number;
    date?: Date;
    description?: string;
    paymentMethod?: string;
    referenceNumber?: string;
  },
  userId: string
): Promise<void> {
  await prisma.jobRevenue
    .create({
      data: {
        jobId,
        orgId,
        type: data.type,
        amount: data.amount,
        date: data.date || new Date(),
        description: data.description,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        createdBy: userId,
      },
    })
    .catch(() => {
      throw new Error("Failed to record revenue");
    });

  // Update job totals
  await updateJobFinancials(jobId, orgId);

  // Log activity
  await logActivity(orgId, {
    type: "PAYMENT_RECEIVED",
    userId,
    resourceType: "JOB",
    resourceId: jobId,
    action: data.type === "INVOICE" ? "Invoice Created" : "Payment Received",
    description: `$${data.amount}`,
  });
}

/**
 * Get job financials
 */
export async function getJobFinancials(jobId: string, orgId: string): Promise<JobFinancials> {
  try {
    const [job, costs, revenue] = await Promise.all([
      prisma.jobs.findFirst({
        where: { id: jobId, orgId },
      }),
      prisma.jobCosts
        .findMany({
          where: { jobId, orgId },
        })
        .catch(() => []),
      prisma.jobRevenue
        .findMany({
          where: { jobId, orgId },
        })
        .catch(() => []),
    ]);

    if (!job) {
      throw new Error("Job not found");
    }

    // Calculate costs by type
    const materialCosts = costs
      .filter((c) => c.type === "MATERIAL")
      .reduce((sum, c) => sum + c.amount, 0);

    const laborCosts = costs
      .filter((c) => c.type === "LABOR")
      .reduce((sum, c) => sum + c.amount, 0);

    const overheadCosts = costs
      .filter((c) => c.type === "OVERHEAD")
      .reduce((sum, c) => sum + c.amount, 0);

    const otherCosts = costs
      .filter((c) => c.type === "OTHER")
      .reduce((sum, c) => sum + c.amount, 0);

    const totalCosts = materialCosts + laborCosts + overheadCosts + otherCosts;

    // Calculate revenue
    const invoicedAmount = revenue
      .filter((r) => r.type === "INVOICE")
      .reduce((sum, r) => sum + r.amount, 0);

    const paidAmount = revenue
      .filter((r) => r.type === "PAYMENT")
      .reduce((sum, r) => sum + r.amount, 0);

    const actualRevenue = paidAmount;
    const estimatedRevenue = job.estimatedValue || 0;

    // Calculate profit
    const grossProfit = actualRevenue - totalCosts;
    const netProfit = grossProfit; // Can add more deductions later
    const profitMargin = actualRevenue > 0 ? (netProfit / actualRevenue) * 100 : 0;

    // Budget status
    let budgetStatus: "ON_BUDGET" | "OVER_BUDGET" | "UNDER_BUDGET" = "ON_BUDGET";

    if (totalCosts > estimatedRevenue * 0.9) {
      budgetStatus = "OVER_BUDGET";
    } else if (totalCosts < estimatedRevenue * 0.7) {
      budgetStatus = "UNDER_BUDGET";
    }

    return {
      jobId,
      estimatedRevenue,
      actualRevenue,
      invoicedAmount,
      paidAmount,
      materialCosts,
      laborCosts,
      overheadCosts,
      totalCosts,
      grossProfit,
      netProfit,
      profitMargin,
      budgetStatus,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Failed to get job financials:", error);
    throw error;
  }
}

/**
 * Update job financial summary
 */
async function updateJobFinancials(jobId: string, orgId: string): Promise<void> {
  try {
    const financials = await getJobFinancials(jobId, orgId);

    // Update job record
    await prisma.jobs
      .update({
        where: { id: jobId },
        data: {
          actualCost: financials.totalCosts,
          revenue: financials.actualRevenue,
          profit: financials.netProfit,
        },
      })
      .catch(() => {});
  } catch (error) {
    console.error("Failed to update job financials:", error);
  }
}

/**
 * Get cost breakdown
 */
export async function getCostBreakdown(jobId: string, orgId: string): Promise<CostEntry[]> {
  try {
    return (await prisma.jobCosts.findMany({
      where: { jobId, orgId },
      orderBy: { date: "desc" },
    })) as CostEntry[];
  } catch {
    return [];
  }
}

/**
 * Get revenue history
 */
export async function getRevenueHistory(jobId: string, orgId: string): Promise<any[]> {
  try {
    return await prisma.jobRevenue.findMany({
      where: { jobId, orgId },
      orderBy: { date: "desc" },
    });
  } catch {
    return [];
  }
}

/**
 * Get profit analysis for org
 */
export async function getOrgProfitAnalysis(
  orgId: string,
  period?: { start: Date; end: Date }
): Promise<{
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  averageMargin: number;
  jobCount: number;
}> {
  try {
    const jobs = await prisma.jobs.findMany({
      where: {
        orgId,
        ...(period && {
          createdAt: {
            gte: period.start,
            lte: period.end,
          },
        }),
      },
    });

    let totalRevenue = 0;
    let totalCosts = 0;
    let totalProfit = 0;

    for (const job of jobs) {
      totalRevenue += job.revenue || 0;
      totalCosts += job.actualCost || 0;
      totalProfit += job.profit || 0;
    }

    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      averageMargin,
      jobCount: jobs.length,
    };
  } catch {
    return {
      totalRevenue: 0,
      totalCosts: 0,
      totalProfit: 0,
      averageMargin: 0,
      jobCount: 0,
    };
  }
}
