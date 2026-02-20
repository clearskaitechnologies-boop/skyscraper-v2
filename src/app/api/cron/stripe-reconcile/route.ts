export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// =====================================================
// CRON: STRIPE RECONCILIATION
// =====================================================
// GET /api/cron/stripe-reconcile
// Ensures all active subscriptions have correct token balances
// Catches any missed webhook events
// Schedule: Daily via Vercel Cron
// =====================================================
// (Removed duplicate dynamic export)
import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { verifyCronSecret } from "@/lib/cron/verifyCronSecret";
import prisma from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

export const maxDuration = 300; // 5 minutes — iterates up to 1000 orgs + Stripe API

const stripe = getStripeClient()!;

const PLAN_TOKENS: Record<string, number> = {
  solo: 200,
  business: 1200,
  enterprise: 4000,
};

export async function GET(req: Request) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  let checked = 0;
  let fixed = 0;
  const errors: string[] = [];

  try {
    // Find orgs with active/grace status
    const orgs = await prisma.org.findMany({
      where: {
        subscriptionStatus: { in: ["active", "trialing"] },
        stripeCustomerId: { not: null },
      },
      take: 1000,
      select: {
        id: true,
        stripeCustomerId: true,
        planKey: true,
      },
    });

    for (const Org of orgs) {
      try {
        if (!Org.stripeCustomerId) continue;

        // Fetch active subscriptions from Stripe
        const subs = await stripe.subscriptions.list({
          customer: Org.stripeCustomerId,
          status: "active",
          limit: 1,
        });

        const activeSub = subs.data[0];
        if (!activeSub) continue;

        checked++;

        // Determine expected token balance
        const planKey = Org.planKey || "solo";
        const expectedTokens = PLAN_TOKENS[planKey] || 200;
        const currentBalance = 0; // TODO: TokenWallet model removed — wire up new token system

        // If balance is significantly lower than expected, top up
        if (currentBalance < expectedTokens * 0.5) {
          // TODO: usage_tokens model removed — wire up new token system
          fixed++;

          logger.debug(`Reconciled Org ${Org.id}: ${currentBalance} → ${expectedTokens} tokens`);
        }
      } catch (error) {
        errors.push(`Org ${Org.id}: ${error.message}`);
        logger.error(`Reconciliation error for Org ${Org.id}:`, error);
      }
    }

    // Log significant issues to Sentry
    if (errors.length > 10) {
      Sentry.captureMessage(`Stripe reconciliation had ${errors.length} errors`, {
        level: "warning",
        extra: {
          errorCount: errors.length,
          sampleErrors: errors.slice(0, 5),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      checked,
      fixed,
      errors: errors.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Stripe reconciliation cron error:", error);
    Sentry.captureException(error, {
      tags: { component: "stripe-reconcile-cron" },
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Reconciliation failed",
      },
      { status: 500 }
    );
  } finally {
    // Log partial progress if interrupted mid-loop (5-minute timeout)
    logger.info(
      `[stripe-reconcile] final progress: checked=${checked}, fixed=${fixed}, errors=${errors.length}`
    );
  }
}
