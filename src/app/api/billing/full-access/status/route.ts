import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/billing/full-access/status
 *
 * Returns user's Full Access subscription status
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.$queryRaw<
      Array<{
        full_access: boolean;
        expires_at: Date | null;
        stripe_subscription_id: string | null;
      }>
    >`
      SELECT full_access, expires_at, stripe_subscription_id
      FROM tn_memberships
      WHERE user_id = ${userId}::uuid
    `;

    if (!membership || membership.length === 0) {
      return NextResponse.json({
        hasFullAccess: false,
        expiresAt: null,
        subscriptionId: null,
      });
    }

    const status = membership[0];
    return NextResponse.json({
      hasFullAccess: status.full_access,
      expiresAt: status.expires_at,
      subscriptionId: status.stripe_subscription_id,
    });
  } catch (err: any) {
    console.error("Full Access status error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch status" }, { status: 500 });
  }
}

/**
 * DELETE /api/billing/full-access/status
 *
 * Cancels user's Full Access subscription
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.$queryRaw<Array<{ stripe_subscription_id: string | null }>>`
      SELECT stripe_subscription_id
      FROM tn_memberships
      WHERE user_id = ${userId}::uuid
    `;

    if (!membership || membership.length === 0 || !membership[0].stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    await stripe.subscriptions.cancel(membership[0].stripe_subscription_id);

    return NextResponse.json({ ok: true, description: "Subscription canceled" });
  } catch (err: any) {
    console.error("Full Access cancel error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
