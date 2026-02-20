/**
 * Billing Adapter
 * Converts Prisma billing models → Domain camelCase DTOs
 */

import type { Org, Plan, Subscription, TokenWallet } from "@prisma/client";

// =============================================================================
// Domain DTOs
// =============================================================================

export interface TokenWalletDTO {
  id: string;
  orgId: string;
  aiRemaining: number;
  dolCheckRemaining: number;
  dolFullRemaining: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionDTO {
  id: string;
  orgId: string;
  stripeCustomerId: string;
  stripeSubId?: string;
  status: string;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanDTO {
  id: string;
  name: string;
  slug: string;
  stripeProductId: string;
  stripePriceId: string;
  monthlyPriceId: string;
  monthlyTokens: number;
  aiIncluded: number;
  dolCheckIncluded: number;
  dolFullIncluded: number;
  aiOverageCents: number;
  dolCheckOverageCents: number;
  dolFullOverageCents: number;
  limits?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgBillingDTO {
  id: string;
  name: string;
  slug?: string;
  planId?: string;
  pricingTier?: string;
  aiCredits: number;
  aiCreditsUsed: number;
  stripeCustomerId?: string;
  stripeSubId?: string;
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Computed
  aiCreditsRemaining: number;
  isTrialing: boolean;
}

// =============================================================================
// Adapter Functions
// =============================================================================

/**
 * Convert a raw Prisma TokenWallet row to DTO
 */
export function adaptTokenWallet(row: TokenWallet): TokenWalletDTO {
  return {
    id: row.id,
    orgId: row.orgId,
    aiRemaining: row.aiRemaining,
    dolCheckRemaining: row.dolCheckRemain,
    dolFullRemaining: row.dolFullRemain,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Convert a raw Prisma Subscription row to DTO
 */
export function adaptSubscription(row: Subscription): SubscriptionDTO {
  return {
    id: row.id,
    orgId: row.orgId,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubId: row.stripeSubId ?? undefined,
    status: row.status,
    currentPeriodEnd: row.currentPeriodEnd ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Convert a raw Prisma Plan row to DTO
 */
export function adaptPlan(row: Plan): PlanDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    stripeProductId: row.stripeProductId,
    stripePriceId: row.stripePriceId,
    monthlyPriceId: row.monthlyPriceId,
    monthlyTokens: row.monthlyTokens,
    aiIncluded: row.aiIncluded,
    dolCheckIncluded: row.dolCheckIncluded,
    dolFullIncluded: row.dolFullIncluded,
    aiOverageCents: row.aiOverageCents,
    dolCheckOverageCents: row.dolCheckOverageCents,
    dolFullOverageCents: row.dolFullOverageCents,
    limits: (row.limits as Record<string, unknown>) ?? undefined,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Convert a raw Prisma Org row to OrgBillingDTO
 */
export function adaptOrgBilling(row: Org): OrgBillingDTO {
  const aiCredits = (row as any).aiCredits ?? 0;
  const aiCreditsUsed = (row as any).aiCreditsUsed ?? 0;
  const trialEndsAt = (row as any).trialEndsAt ?? undefined;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug ?? undefined,
    planId: (row as any).planId ?? undefined,
    pricingTier: (row as any).pricingTier ?? undefined,
    aiCredits,
    aiCreditsUsed,
    stripeCustomerId: (row as any).stripeCustomerId ?? undefined,
    stripeSubId: (row as any).stripeSubId ?? undefined,
    trialEndsAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,

    // Computed
    aiCreditsRemaining: aiCredits - aiCreditsUsed,
    isTrialing: trialEndsAt ? new Date(trialEndsAt) > new Date() : false,
  };
}

/**
 * Adapt multiple token wallets
 */
export function adaptTokenWallets(rows: TokenWallet[]): TokenWalletDTO[] {
  return rows.map(adaptTokenWallet);
}

/**
 * Adapt multiple plans
 */
export function adaptPlans(rows: Plan[]): PlanDTO[] {
  return rows.map(adaptPlan);
}
