// ============================================================================
// H-9: Usage Metering Increment API
// ============================================================================
//
// Increments usage counters for claims, AI credits, storage
// Checks limits before allowing operations
// Returns usage status and warnings
//
// POST /api/usage/increment
// Body: { type: "claims" | "ai_credits" | "storage", amount: number }
// ============================================================================

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Using orgId from auth()
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const body = await request.json();
    const { type, amount = 1 } = body;

    if (!["claims", "ai_credits", "storage"].includes(type)) {
      return NextResponse.json({ error: "Invalid usage type" }, { status: 400 });
    }

    // Get current org and tier details
    const [org, tier] = await Promise.all([
      db.organization.findUnique({
        where: { id: orgId },
        select: {
          id: true,
          tier: true,
          claimsUsedThisMonth: true,
          aiCreditsUsedThisMonth: true,
          storageBytesUsed: true,
        },
      }),
      db.pricingTier.findFirst({
        where: { id: { in: ["STARTER", "PROFESSIONAL", "ENTERPRISE"] } },
      }),
    ]);

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get tier limits
    const tierDetails = await db.pricingTier.findUnique({
      where: { id: org.tier || "STARTER" },
    });

    if (!tierDetails) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    // Calculate new usage
    let newUsage = 0;
    let limit = 0;
    let updateData: any = {};

    if (type === "claims") {
      newUsage = (org.claimsUsedThisMonth || 0) + amount;
      limit = tierDetails.claimsPerMonth;
      updateData.claimsUsedThisMonth = newUsage;
    } else if (type === "ai_credits") {
      newUsage = (org.aiCreditsUsedThisMonth || 0) + amount;
      limit = tierDetails.aiCreditsPerMonth;
      updateData.aiCreditsUsedThisMonth = newUsage;
    } else if (type === "storage") {
      newUsage = Number(org.storageBytesUsed || 0) + amount;
      limit = tierDetails.storageGb * 1024 * 1024 * 1024; // Convert GB to bytes
      updateData.storageBytesUsed = newUsage;
    }

    // Check if over limit (allow Enterprise unlimited)
    const isUnlimited = limit >= 999999;
    const isOverLimit = !isUnlimited && newUsage > limit;
    const percentUsed = isUnlimited ? 0 : (newUsage / limit) * 100;

    if (isOverLimit) {
      return NextResponse.json(
        {
          error: "Usage limit exceeded",
          type,
          current: newUsage,
          limit,
          percentUsed,
          tier: org.tier,
          upgradeRequired: true,
        },
        { status: 429 }
      );
    }

    // Update usage
    await db.organization.update({
      where: { id: orgId },
      data: updateData,
    });

    // Determine warning level
    let warning = null;
    if (percentUsed >= 90) {
      warning = "critical"; // 90%+
    } else if (percentUsed >= 80) {
      warning = "high"; // 80-89%
    } else if (percentUsed >= 60) {
      warning = "medium"; // 60-79%
    }

    return NextResponse.json({
      success: true,
      type,
      current: newUsage,
      limit: isUnlimited ? "unlimited" : limit,
      percentUsed: Math.round(percentUsed),
      warning,
      tier: org.tier,
    });
  } catch (error) {
    console.error("[USAGE_INCREMENT_ERROR]", error);
    return NextResponse.json({ error: "Failed to increment usage" }, { status: 500 });
  }
}
