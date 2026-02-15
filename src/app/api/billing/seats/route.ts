/**
 * GET /api/billing/seats
 *
 * Returns seat usage, limits, and subscription info for the current org.
 * Used by the billing settings page and seat enforcement UI.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { checkSeatAvailability } from "@/lib/billing/seat-enforcement";
import { monthlyFormatted, PRICE_PER_SEAT_CENTS, pricingSummary } from "@/lib/billing/seat-pricing";
import prisma from "@/lib/prisma";

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
    const orgId = membership.organizationId;

    // Get seat check
    const seatCheck = await checkSeatAvailability(orgId);

    // Get subscription details
    const sub = await prisma.subscription.findUnique({
      where: { orgId },
      select: {
        seatCount: true,
        status: true,
        currentPeriodEnd: true,
        pricePerSeat: true,
        stripeSubId: true,
      },
    });

    const summary = pricingSummary(sub?.seatCount || 1);

    return NextResponse.json({
      ...seatCheck,
      subscription: sub
        ? {
            status: sub.status,
            seatCount: sub.seatCount,
            pricePerSeat: (sub.pricePerSeat || PRICE_PER_SEAT_CENTS) / 100,
            monthlyTotal: monthlyFormatted(sub.seatCount),
            currentPeriodEnd: sub.currentPeriodEnd?.toISOString() || null,
            hasSubscription: true,
          }
        : {
            status: "none",
            seatCount: 0,
            pricePerSeat: PRICE_PER_SEAT_CENTS / 100,
            monthlyTotal: "$0.00",
            currentPeriodEnd: null,
            hasSubscription: false,
          },
      pricing: summary,
    });
  } catch (error: any) {
    console.error("[billing/seats] Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to check seats" }, { status: 500 });
  }
}
