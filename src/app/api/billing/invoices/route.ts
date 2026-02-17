export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import prisma from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

const stripe = getStripeClient();

/**
 * GET /api/billing/invoices
 *
 * Fetch invoice history for an organization from Stripe.
 * Returns a list of invoices with:
 * - Invoice number
 * - Date
 * - Amount
 * - Status (paid, pending, etc.)
 * - Download link (PDF)
 * - Hosted invoice URL
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedOrgId = searchParams.get("orgId") || orgId;
    const limit = Math.min(parseInt(searchParams.get("limit") || "25", 10), 100);
    const startingAfter = searchParams.get("startingAfter") || undefined;

    if (!requestedOrgId) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
    }

    // Fetch org with stripe customer ID
    const org = await prisma.org.findUnique({
      where: { id: requestedOrgId },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (!org.stripeCustomerId) {
      return NextResponse.json({
        invoices: [],
        hasMore: false,
        message: "No Stripe customer associated with this organization",
      });
    }

    // Fetch invoices from Stripe
    const invoicesResponse = await stripe.invoices.list({
      customer: org.stripeCustomerId,
      limit,
      starting_after: startingAfter,
      expand: ["data.subscription"],
    });

    const invoices = invoicesResponse.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      amountDue: inv.amount_due,
      amountPaid: inv.amount_paid,
      amountRemaining: inv.amount_remaining,
      currency: inv.currency,
      status: inv.status, // 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
      created: inv.created, // Unix timestamp (seconds)
      dueDate: inv.due_date, // Unix timestamp or null
      periodStart: inv.period_start,
      periodEnd: inv.period_end,
      hostedInvoiceUrl: inv.hosted_invoice_url,
      invoicePdf: inv.invoice_pdf,
      description: inv.description,
      customerEmail: inv.customer_email,
      // Line items summary
      lineItems:
        inv.lines?.data?.slice(0, 5).map((line) => ({
          description: line.description,
          amount: line.amount,
          quantity: line.quantity,
        })) || [],
      // Subscription info if applicable
      subscriptionId:
        typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id || null,
    }));

    return NextResponse.json({
      invoices,
      hasMore: invoicesResponse.has_more,
      totalCount: invoices.length,
    });
  } catch (error) {
    logger.error("Error fetching invoices:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
