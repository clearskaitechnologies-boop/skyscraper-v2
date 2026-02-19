export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createBillingPortalSession } from "@/lib/billing/portal";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await checkRateLimit(userId, "API");
    if (!rl.success) {
      return NextResponse.json(
        { error: "rate_limit_exceeded", message: "Too many requests" },
        { status: 429 }
      );
    }

    if (!orgId) {
      return NextResponse.json({ error: "Organization context required" }, { status: 403 });
    }

    // Resolve org from Clerk orgId — NEVER accept client-supplied orgId
    const resolvedOrg = await prisma.org.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true, stripeCustomerId: true },
    });

    // Verify user membership in this org
    if (resolvedOrg) {
      const membership = await prisma.user_organizations.findFirst({
        where: { userId, organizationId: resolvedOrg.id },
      });
      if (!membership) {
        return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 });
      }
    }

    if (!resolvedOrg || !resolvedOrg.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found. Please subscribe first." },
        { status: 404 }
      );
    }

    // Create portal session
    const returnUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/account/billing`;

    const portalUrl = await createBillingPortalSession(resolvedOrg.stripeCustomerId, returnUrl);

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    logger.error("Portal session error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
