/**
 * POST /api/billing/update-seats
 *
 * Updates the seat count on an existing Stripe subscription.
 * Stripe handles proration automatically.
 * Body: { seatCount: number }
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { PRICE_PER_SEAT_CENTS, validateSeatCount } from "@/lib/billing/seat-pricing";
import prisma from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Body ────────────────────────────────────────────────────────
    const body = await req.json();
    const newSeatCount = Number(body.seatCount);
    const v = validateSeatCount(newSeatCount);
    if (!v.valid) {
      return NextResponse.json({ error: v.error }, { status: 400 });
    }

    // ── Resolve org ─────────────────────────────────────────────────
    const membership = await prisma.user_organizations.findFirst({
      where: { userId },
      select: { organizationId: true },
    });
    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }
    const orgId = membership.organizationId;

    // ── Get subscription ────────────────────────────────────────────
    const sub = await prisma.subscription.findUnique({
      where: { orgId },
    });
    if (!sub || !sub.stripeSubId || !sub.stripeSubscriptionItemId) {
      return NextResponse.json(
        { error: "No active subscription found. Create one first." },
        { status: 404 }
      );
    }
    if (sub.status !== "active" && sub.status !== "trialing") {
      return NextResponse.json(
        { error: `Subscription is ${sub.status}. Cannot update seats.` },
        { status: 400 }
      );
    }

    // ── Stripe client ───────────────────────────────────────────────
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    // ── Update quantity on Stripe ───────────────────────────────────
    // Stripe automatically prorates when changing quantity mid-cycle
    await stripe.subscriptionItems.update(sub.stripeSubscriptionItemId, {
      quantity: newSeatCount,
      proration_behavior: "always_invoice",
    });

    // ── Update local record ─────────────────────────────────────────
    const oldSeatCount = sub.seatCount;
    await prisma.subscription.update({
      where: { orgId },
      data: {
        seatCount: newSeatCount,
        updatedAt: new Date(),
      },
    });

    logger.debug(`[update-seats] org=${orgId} seats: ${oldSeatCount} → ${newSeatCount}`);

    return NextResponse.json({
      success: true,
      previousSeatCount: oldSeatCount,
      newSeatCount,
      monthlyTotal: (newSeatCount * PRICE_PER_SEAT_CENTS) / 100,
      prorated: true,
    });
  } catch (error: any) {
    logger.error("[update-seats] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update seats" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/billing/update-seats
 *
 * Returns current seat information
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.user_organizations.findFirst({
      where: { userId },
      select: { organizationId: true },
    });
    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const sub = await prisma.subscription.findUnique({
      where: { orgId: membership.organizationId },
    });

    // Count active users in org
    const activeUsers = await prisma.user_organizations.count({
      where: { organizationId: membership.organizationId },
    });

    return NextResponse.json({
      seatCount: sub?.seatCount || 0,
      seatsUsed: activeUsers,
      status: sub?.status || "none",
      pricePerSeat: PRICE_PER_SEAT_CENTS / 100,
      monthlyTotal: ((sub?.seatCount || 0) * PRICE_PER_SEAT_CENTS) / 100,
    });
  } catch (error: any) {
    logger.error("[update-seats GET] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get seat info" },
      { status: 500 }
    );
  }
}
