import prisma from "@/lib/prisma";

// Prisma singleton imported from @/lib/db/prisma

export interface SpendResult {
  success: boolean;
  balanceAfter?: number;
  reason?: string;
}

export interface WalletTopUpOptions {
  orgId: string;
  amountCents: number;
  reason: string;
  userId?: string;
  grantBonus?: boolean; // 5% bonus on top-ups
  correlationId?: string;
}

/**
 * Enforces wallet spending with atomic balance checks
 * Returns 402 if insufficient funds
 */
export async function ensureAndSpend(
  orgId: string,
  action: "aiMockup" | "dolPull" | "weatherReport",
  userId?: string,
  correlationId?: string
): Promise<SpendResult> {
  const costs = {
    aiMockup: 150, // $1.50 in cents
    dolPull: 250, // $2.50 in cents
    weatherReport: 899, // $8.99 in cents
  };

  const costCents = costs[action];

  return await prisma.$transaction(async (tx) => {
    // Compute current balance by summing deltas
    const wallet = await tx.tokens_ledger.aggregate({
      where: { org_id: orgId },
      _sum: { delta: true },
    });

    const currentBalance = wallet._sum?.delta ?? 0;

    if (currentBalance < costCents) {
      return {
        success: false,
        reason: "insufficient_funds",
        balanceAfter: currentBalance,
      };
    }

    // Deduct the cost
    const ledgerEntry = await tx.tokens_ledger.create({
      data: {
        id: crypto.randomUUID(),
        org_id: orgId,
        delta: -costCents,
        reason: `${action} usage`,
        ref_id: correlationId || `${action}_${Date.now()}`,
        balance_after: currentBalance - costCents,
        created_at: new Date(),
      },
    });

    return {
      success: true,
      balanceAfter: ledgerEntry.balance_after,
    };
  });
}

/**
 * Top up wallet with optional 5% bonus
 */
export async function topUpWallet(options: WalletTopUpOptions): Promise<{ newBalance: number }> {
  const { orgId, amountCents, reason, userId, grantBonus = false, correlationId } = options;

  let totalCents = amountCents;
  if (grantBonus) {
    totalCents = Math.round(amountCents * 1.05); // 5% bonus
  }

  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.tokens_ledger.aggregate({
      where: { org_id: orgId },
      _sum: { delta: true },
    });
    const currentBalance = wallet._sum?.delta ?? 0;
    const newBalance = currentBalance + totalCents;

    // Add primary credit
    await tx.tokens_ledger.create({
      data: {
        id: crypto.randomUUID(),
        org_id: orgId,
        delta: amountCents,
        reason,
        ref_id: correlationId || `topup_${Date.now()}`,
        balance_after: currentBalance + amountCents,
        created_at: new Date(),
      },
    });

    // Add bonus if applicable
    if (grantBonus) {
      const bonusAmount = totalCents - amountCents;
      await tx.tokens_ledger.create({
        data: {
          id: crypto.randomUUID(),
          org_id: orgId,
          delta: bonusAmount,
          reason: `5% bonus on ${reason}`,
          ref_id: `${correlationId || "topup"}_bonus`,
          balance_after: newBalance,
          created_at: new Date(),
        },
      });
    }

    return { newBalance };
  });
}

/**
 * Get current wallet balance for Org
 */
export async function getWalletBalance(orgId: string): Promise<number> {
  const result = await prisma.tokens_ledger.aggregate({
    where: { org_id: orgId },
    _sum: { delta: true },
  });
  return result._sum?.delta ?? 0;
}

/**
 * Check if Org needs low balance warning
 */
export async function shouldShowLowBalanceWarning(orgId: string): Promise<boolean> {
  const balance = await getWalletBalance(orgId);
  return balance < 500; // Less than $5.00
}

/**
 * Monthly reset for token quotas (called by cron)
 */
export async function resetMonthlyQuotas(): Promise<{ resetCount: number }> {
  console.log("Starting monthly quota reset...");

  const orgs = await prisma.org.findMany({
    select: {
      id: true,
      planId: true,
      planKey: true,
    },
  });

  const planIds = orgs.map((o) => o.planId).filter((v): v is string => Boolean(v));
  const planKeys = orgs.map((o) => o.planKey).filter((v): v is string => Boolean(v));

  const [plansByIdList, plansBySlugList] = await Promise.all([
    planIds.length
      ? prisma.plan.findMany({
          where: { id: { in: planIds } },
          select: { id: true, aiIncluded: true, monthlyTokens: true, slug: true },
        })
      : Promise.resolve([]),
    planKeys.length
      ? prisma.plan.findMany({
          where: { slug: { in: planKeys } },
          select: { id: true, aiIncluded: true, monthlyTokens: true, slug: true },
        })
      : Promise.resolve([]),
  ]);

  const plansById = new Map(plansByIdList.map((p) => [p.id, p] as const));
  const plansBySlug = new Map(plansBySlugList.map((p) => [p.slug, p] as const));

  let resetCount = 0;

  for (const o of orgs) {
    const plan = (o.planId && plansById.get(o.planId)) || (o.planKey && plansBySlug.get(o.planKey));
    if (!plan) continue;

    const included = (plan.aiIncluded ?? 0) || (plan.monthlyTokens ?? 0);
    const now = new Date();

    await prisma.usage_tokens.upsert({
      where: { orgId: o.id },
      update: { balance: included, updatedAt: now },
      create: {
        id: crypto.randomUUID(),
        orgId: o.id,
        balance: included,
        tier: "beta",
        updatedAt: now,
      },
    });

    resetCount++;
  }

  console.log(`Monthly reset complete: ${resetCount} orgs updated`);
  return { resetCount };
}
