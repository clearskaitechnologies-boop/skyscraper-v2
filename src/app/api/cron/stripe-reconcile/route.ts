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
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { verifyCronSecret } from "@/lib/cron/verifyCronSecret";
import prisma from "@/lib/prisma";

export const maxDuration = 300; // 5 minutes — iterates up to 1000 orgs + Stripe API

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia" as any,
});

const PLAN_TOKENS: Record<string, number> = {
  solo: 200,
  business: 1200,
  enterprise: 4000,
};

export async function GET(req: Request) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

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
        TokenWallet: {
          select: {
            aiRemaining: true,
            dolCheckRemain: true,
            dolFullRemain: true,
          },
        },
      },
    });

    let checked = 0;
    let fixed = 0;
    const errors: string[] = [];

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
        const currentBalance = Org.TokenWallet?.aiRemaining || 0;

        // If balance is significantly lower than expected, top up
        if (currentBalance < expectedTokens * 0.5) {
          // Top up to full amount
          await prisma.usage_tokens.upsert({
            where: { orgId: Org.id },
            create: {
              orgId: Org.id,
              balance: expectedTokens,
            } as any,
            update: {
              balance: expectedTokens,
            },
          });

          fixed++;

          logger.debug(`Reconciled Org ${Org.id}: ${currentBalance} → ${expectedTokens} tokens`);
        }
      } catch (error: any) {
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
  }
}
