// ============================================================================
// H-8: Stripe Checkout Upgrade Endpoint
// ============================================================================
//
// Creates Stripe Checkout session for plan upgrades/downgrades
// Handles tier changes:
//   - Starter → Professional
//   - Starter → Enterprise
//   - Professional → Enterprise
//   - Downgrades (applied at period end)
//
// POST /api/billing/upgrade
// Body: { tierId: "PROFESSIONAL" | "ENTERPRISE" | "STARTER" }
//
// Security: Requires authenticated user with organization
// ============================================================================

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

// Map tier IDs to Stripe Price IDs
const TIER_TO_PRICE_ID: Record<string, string> = {
  STARTER: process.env.STRIPE_PRICE_SOLO_MONTHLY || "",
  PROFESSIONAL: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "",
};

export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const formData = await request.formData();
    const tierId = formData.get("tierId") as string;

    if (!tierId || !["STARTER", "PROFESSIONAL", "ENTERPRISE"].includes(tierId)) {
      return NextResponse.json({ error: "Invalid tier ID" }, { status: 400 });
    }

    // Get organization and pricing tier details
    const [org, pricingTier] = await Promise.all([
      db.organization.findUnique({
        where: { id: orgId },
        select: {
          id: true,
          name: true,
          tier: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
        },
      }),
      db.pricingTier.findUnique({
        where: { id: tierId },
      }),
    ]);

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (!pricingTier) {
      return NextResponse.json({ error: "Pricing tier not found" }, { status: 404 });
    }

    // Check if already on this tier
    if (org.tier === tierId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/billing?error=already-on-plan`
      );
    }

    // Get Stripe Price ID
    const priceId = TIER_TO_PRICE_ID[tierId];
    if (!priceId) {
      return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
    }

    // If no Stripe customer, create one
    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          organizationId: org.id,
          organizationName: org.name,
        },
      });
      customerId = customer.id;

      await db.organization.update({
        where: { id: orgId },
        data: { stripeCustomerId: customerId },
      });
    }

    // If existing subscription, update it
    if (org.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId);

      // Update subscription with new price
      await stripe.subscriptions.update(org.stripeSubscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
          },
        ],
        proration_behavior: "create_prorations", // Pro-rate the charge
      });

      // Update organization tier immediately
      await db.organization.update({
        where: { id: orgId },
        data: { tier: tierId },
      });

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/billing?success=updated`
      );
    }

    // No existing subscription - create Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/billing?success=subscribed`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/billing?canceled=true`,
      metadata: {
        organizationId: org.id,
        tierId: tierId,
      },
      subscription_data: {
        metadata: {
          organizationId: org.id,
          tierId: tierId,
        },
      },
    });

    // Redirect to Stripe Checkout
    return NextResponse.redirect(session.url!);
  } catch (error) {
    console.error("[BILLING_UPGRADE_ERROR]", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
