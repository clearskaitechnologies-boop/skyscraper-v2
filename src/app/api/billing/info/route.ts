export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getCustomerInvoices, getCustomerPaymentMethods } from "@/lib/billing/portal";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: "Organization context required" }, { status: 403 });
    }

    // Resolve org from Clerk orgId — NEVER accept client-supplied orgId
    const resolvedOrg = await prisma.org.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });

    if (!resolvedOrg) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Verify user membership
    const membership = await prisma.user_organizations.findFirst({
      where: { userId, organizationId: resolvedOrg.id },
    });
    if (!membership) {
      return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 });
    }

    const serverOrgId = resolvedOrg.id;

    // Fetch Org with billing info using server-derived orgId
    const Org = await prisma.org.findUnique({
      where: { id: serverOrgId },
      select: {
        id: true,
        name: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        planKey: true,
        trialEndsAt: true,
        BillingSettings: {
          select: {
            autoRefill: true,
            refillThreshold: true,
          },
        },
      },
    });

    if (!Org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let paymentMethods: any[] = [];
    let invoices: any[] = [];

    // Fetch from Stripe if customer exists
    if (Org.stripeCustomerId) {
      try {
        paymentMethods = await getCustomerPaymentMethods(Org.stripeCustomerId);
        invoices = await getCustomerInvoices(Org.stripeCustomerId, 12);
      } catch (stripeError) {
        console.error("Stripe fetch error (non-blocking):", stripeError);
      }
    }

    return NextResponse.json({
      org: {
        id: Org.id,
        name: Org.name,
        subscriptionStatus: Org.subscriptionStatus,
        planKey: Org.planKey,
        trialEndsAt: Org.trialEndsAt,
      },
      paymentMethods,
      invoices,
      autoRefill: {
        enabled: Org.BillingSettings?.autoRefill ?? false,
        threshold: Org.BillingSettings?.refillThreshold ?? 10,
      },
    });
  } catch (error) {
    logger.error("Error fetching billing info:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
