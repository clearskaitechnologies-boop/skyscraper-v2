import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { BETA_PAYMENTS_DISABLED_MESSAGE, isBetaMode } from "@/lib/beta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

/**
 * POST /api/billing/full-access/checkout
 *
 * Creates a Stripe Checkout session for SKAI's Full Access subscription
 * Product: "SKAI'S FULL ACCESS TO THE TRADES NETWORK"
 * Price: $9.99/month
 * Benefit: Unlimited messaging + job posting (AI tools still cost tokens)
 */
export async function POST(req: NextRequest) {
  try {
    if (isBetaMode()) {
      return NextResponse.json({ error: BETA_PAYMENTS_DISABLED_MESSAGE }, { status: 403 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const priceId = process.env.STRIPE_PRICE_FULL_ACCESS;
    if (!priceId) {
      return NextResponse.json({ error: "Full Access product not configured" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      automatic_tax: { enabled: true }, // ✅ Stripe automatic tax
      success_url: `${appUrl}/billing?full_access=success`,
      cancel_url: `${appUrl}/billing?full_access=canceled`,
      metadata: {
        userId,
        productType: "full_access",
      },
      subscription_data: {
        metadata: {
          userId,
          productType: "full_access",
        },
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    logger.error("Full Access checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
