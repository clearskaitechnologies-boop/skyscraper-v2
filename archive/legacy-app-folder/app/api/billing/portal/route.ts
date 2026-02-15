// ============================================================================
// H-8: Stripe Customer Portal Endpoint
// ============================================================================
//
// Creates Stripe Customer Portal session for subscription management
// Allows customers to:
//   - View and update payment method
//   - View billing history and invoices
//   - Cancel subscription
//   - Update billing details
//
// POST /api/billing/portal
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

export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get organization with Stripe customer ID
    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // If no Stripe customer ID, create one
    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          organizationId: org.id,
        },
      });
      customerId = customer.id;

      // Update organization with Stripe customer ID
      await db.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/billing`,
    });

    // Redirect to Stripe Customer Portal
    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("[BILLING_PORTAL_ERROR]", error);
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 });
  }
}
