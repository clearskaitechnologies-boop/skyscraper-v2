import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

// Prisma singleton imported from @/lib/db/prisma

/**
 * POST /api/trades/cancel-subscription
 *
 * Cancels the user's Full Access subscription at period end
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription
    const membership = await prisma.$queryRaw<Array<{ stripe_subscription_id: string | null }>>`
      SELECT stripe_subscription_id
      FROM tn_memberships
      WHERE user_id = ${userId}::uuid
    `;

    if (!membership || !membership[0]?.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const subscriptionId = membership[0].stripe_subscription_id;

    // Cancel at period end
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log(
      `[FULL_ACCESS] Subscription ${subscriptionId} set to cancel at period end for user ${userId}`
    );

    return NextResponse.json({
      ok: true,
      description: "Subscription will cancel at end of billing period",
    });
  } catch (err: any) {
    console.error("POST /api/trades/cancel-subscription error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
