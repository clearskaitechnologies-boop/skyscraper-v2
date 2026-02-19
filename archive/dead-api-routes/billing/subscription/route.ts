import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  const { userId, orgId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedOrgId = orgId || userId;

    // Get Org with plan and subscription
    const Org = await prisma.org.findUnique({
      where: { clerkOrgId: resolvedOrgId },
      include: {
        Plan: true,
        Subscription: true,
      },
    });

    if (!Org) {
      return NextResponse.json({
        plan: "Free",
        tokens: 0,
        dolTokens: 0,
        weatherTokens: 0,
        subscription: null,
      });
    }

    // Get token wallet
    const wallet = await prisma.usage_tokens.findUnique({
      where: { orgId: Org.id },
    });

    return NextResponse.json({
      plan: Org.Plan?.name || "Free",
      tokens: wallet?.balance || 0,
      dolTokens: wallet?.balance || 0,
      weatherTokens: wallet?.balance || 0,
      subscription: Org.Subscription
        ? {
            status: Org.Subscription.status,
            currentPeriodEnd: Org.Subscription.currentPeriodEnd,
          }
        : null,
    });
  } catch (error) {
    logger.error("[Billing Subscription] Error:", error);
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}
