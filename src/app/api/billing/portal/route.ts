export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createBillingPortalSession } from "@/lib/billing/portal";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const requestedOrgId = body.orgId || orgId;

    if (!requestedOrgId) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
    }

    // Fetch Org
    const Org = await prisma.org.findUnique({
      where: { id: requestedOrgId },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!Org || !Org.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found. Please subscribe first." },
        { status: 404 }
      );
    }

    // Create portal session
    const returnUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/account/billing`;

    const portalUrl = await createBillingPortalSession(Org.stripeCustomerId, returnUrl);

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error("Portal session error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
