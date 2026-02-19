export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { logger } from "@/lib/logger";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { withAuth } from "@/lib/auth/withAuth";
import { getStripeCustomerIdForUser } from "@/lib/stripe/customer";

export const POST = withAuth(async (_req, { userId }) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = user.emailAddresses[0]?.emailAddress || "";
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const stripeCustomerId = await getStripeCustomerIdForUser(userId, email, name);

    return NextResponse.json({ stripe_customer_id: stripeCustomerId });
  } catch (error) {
    logger.error("Failed to ensure Stripe customer:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to ensure Stripe customer" },
      { status: 500 }
    );
  }
});
