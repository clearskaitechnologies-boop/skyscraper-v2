/**
 * TASK 135: BILLING INTEGRATION
 *
 * Stripe billing with subscriptions and invoicing.
 */

import prisma from "@/lib/prisma";

export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING";

export interface Subscription {
  id: string;
  tenantId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export async function createSubscription(
  tenantId: string,
  plan: string,
  billingCycle: BillingCycle
): Promise<string> {
  // TODO: Create Stripe customer and subscription
  const subscription = await prisma.subscription.create({
    data: {
      tenantId,
      stripeCustomerId: "stripe_cus_xxx",
      stripeSubscriptionId: "stripe_sub_xxx",
      plan,
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    } as any,
  });

  return subscription.id;
}

export async function getSubscription(tenantId: string): Promise<Subscription | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId },
  });
  return subscription as any;
}

export async function cancelSubscription(tenantId: string): Promise<void> {
  await prisma.subscription.update({
    where: { tenantId },
    data: { cancelAtPeriodEnd: true } as any,
  });
}

export async function getUsageForBilling(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  apiCalls: number;
  storage: number;
  users: number;
}> {
  const [apiCalls, storage, users] = await Promise.all([
    prisma.apiLog.count({
      where: {
        tenantId,
        timestamp: { gte: startDate, lte: endDate },
      },
    }),
    prisma.document.aggregate({
      where: { tenantId },
      _sum: { fileSize: true },
    }),
    prisma.users.count({
      where: {
        organizationMemberships: {
          some: { organization: { tenantId } },
        },
      },
    }),
  ]);

  return {
    apiCalls,
    storage: (storage._sum.fileSize || 0) / (1024 * 1024 * 1024),
    users,
  };
}
