/**
 * requireActiveSubscription
 * ─────────────────────────────────────────────────────────
 * THE ONLY BILLING GUARD.
 * $80/seat/month. Active subscription = unlimited everything.
 *
 * Call this in any API route to gate access:
 *   const sub = await requireActiveSubscription(orgId);
 *
 * Throws if no active subscription (catch → 402).
 */

import { isBetaMode } from "@/lib/beta";
import prisma from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/security/roles";

export class SubscriptionRequiredError extends Error {
  constructor(message = "Active subscription required") {
    super(message);
    this.name = "SubscriptionRequiredError";
  }
}

export async function requireActiveSubscription(orgId: string) {
  // Beta mode bypass — all users have full access during beta
  if (isBetaMode()) {
    return { id: "beta-bypass", status: "active", seatCount: 999 };
  }

  // Founder bypass — platform admins never need a subscription
  try {
    const isAdmin = await isPlatformAdmin();
    if (isAdmin) {
      return { id: "admin-bypass", status: "active", seatCount: 999 };
    }
  } catch {
    // auth() may not be available in all contexts — fall through to DB check
  }

  // Check the Subscription table first (seat-billing source of truth)
  const subscription = await prisma.subscription.findFirst({
    where: { orgId },
    select: {
      id: true,
      status: true,
      seatCount: true,
      currentPeriodEnd: true,
      stripeSubId: true,
    },
  });

  if (subscription && ["active", "trialing"].includes(subscription.status)) {
    return subscription;
  }

  // Fallback: check Org.subscriptionStatus (legacy field, still synced by webhook)
  const org = await prisma.org.findUnique({
    where: { id: orgId },
    select: { subscriptionStatus: true },
  });

  if (org && ["active", "trialing"].includes(org.subscriptionStatus || "")) {
    return { id: orgId, status: org.subscriptionStatus, seatCount: 1 };
  }

  throw new SubscriptionRequiredError();
}

/**
 * Convenience: returns boolean instead of throwing
 */
export async function hasActiveSubscription(orgId: string): Promise<boolean> {
  try {
    await requireActiveSubscription(orgId);
    return true;
  } catch {
    return false;
  }
}
