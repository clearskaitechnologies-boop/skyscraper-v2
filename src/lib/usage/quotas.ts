/**
 * Quota management system
 * Single source of truth for usage limits, tracking, and enforcement
 */

import prisma from "@/lib/prisma";

import { type PlanId,PLANS } from "../billing/plans";

export interface QuotaUsage {
  aiMockups: { used: number; limit: number };
  quickDOL: { used: number; limit: number };
  weatherReports: { used: number; limit: number };
}

/**
 * Get monthly quotas for a plan
 */
export function getMonthlyQuotas(planId: PlanId) {
  const plan = PLANS[planId];
  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }
  return plan.quotas;
}

/**
 * Get current quota usage for an organization
 * Calculates from usage_tokens or org_usage table
 */
export async function getQuotaUsage(orgId: string): Promise<QuotaUsage> {
  // Get current billing period (month start)
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Query usage from current month
  // TODO: Replace with actual org_usage table when implemented
  const mockupsUsed = 0; // Count from uploads or separate tracking table
  const dolUsed = 0; // Count from quick_dols table where createdAt >= periodStart
  const weatherUsed = 0; // Count from weather_documents table where createdAt >= periodStart

  // Get Org's plan
  const Org = await prisma.org.findUnique({
    where: { id: orgId },
    select: { planId: true },
  });

  const planId = (Org?.planId || "solo") as PlanId;
  const quotas = getMonthlyQuotas(planId);

  return {
    aiMockups: { used: mockupsUsed, limit: quotas.aiMockups },
    quickDOL: { used: dolUsed, limit: quotas.quickDOL },
    weatherReports: { used: weatherUsed, limit: quotas.weatherReports },
  };
}

/**
 * Check if Org has quota remaining for a feature
 */
export async function hasQuotaRemaining(
  orgId: string,
  feature: keyof QuotaUsage
): Promise<boolean> {
  const usage = await getQuotaUsage(orgId);
  const { used, limit } = usage[feature];
  return used < limit;
}

/**
 * Increment usage for a feature
 * Throws if quota exceeded (unless FREE_BETA=true)
 */
export async function incrementUsage(orgId: string, feature: keyof QuotaUsage): Promise<void> {
  const freeBeta = process.env.FREE_BETA === "true";

  if (!freeBeta) {
    const hasQuota = await hasQuotaRemaining(orgId, feature);
    if (!hasQuota) {
      throw new Error(
        `Quota exceeded for ${feature}. Please upgrade or purchase additional credits.`
      );
    }
  }

  // TODO: Implement actual usage tracking table
  // For now, usage is inferred from created records in respective tables
  // TODO: Persist usage row; telemetry event optional.
}

/**
 * Reset monthly quotas for all organizations
 * Run as cron job on 1st of each month
 */
export async function resetMonthlyQuotas(): Promise<void> {
  // TODO: Implement quota reset logic
  // This would clear the usage counters in org_usage table
  // Monthly quota reset stub.
}

/**
 * Seed initial quotas for new organization
 */
export async function seedOrganizationQuotas(
  orgId: string,
  planId: PlanId = "solo"
): Promise<void> {
  const quotas = getMonthlyQuotas(planId);

  // Update organization plan
  await prisma.org.update({
    where: { id: orgId },
    data: { planId: planId },
  });

  // TODO: Create initial usage tracking records if needed
  // Seed quotas stub (plan stored on Org record).
}
