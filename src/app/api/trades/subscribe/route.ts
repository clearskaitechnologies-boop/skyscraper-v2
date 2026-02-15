import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { BETA_PAYMENTS_DISABLED_MESSAGE, isBetaMode } from "@/lib/beta";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

// Stripe Full Access Product ID (create in Stripe Dashboard)
// Test mode: price_XXXXXXXXXXXXX
// Live mode: price_XXXXXXXXXXXXX
const FULL_ACCESS_PRICE_ID = process.env.STRIPE_FULL_ACCESS_PRICE_ID!;

/**
 * POST /api/trades/subscribe
 *
 * Creates a Stripe checkout session for Full Access subscription ($9.99/mo)
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

    if (!FULL_ACCESS_PRICE_ID) {
      console.error("STRIPE_FULL_ACCESS_PRICE_ID not configured");
      return NextResponse.json({ error: "Subscription not configured" }, { status: 500 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: FULL_ACCESS_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        userId,
        product: "full_access",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      subscription_data: {
        metadata: {
          userId,
          product: "full_access",
        },
      },
    });

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (err: any) {
    console.error("POST /api/trades/subscribe error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
