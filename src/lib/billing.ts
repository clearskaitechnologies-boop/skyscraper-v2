import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { redirect } from "next/navigation";

import { isBetaMode } from "@/lib/beta";
import prisma from "@/lib/prisma";

// Prisma singleton imported from @/lib/db/prisma

export interface UserPlanAndTokens {
  plan: string;
  tokensRemaining: number;
  subscriptionStatus: string;
  canAccessFeature: (feature: string) => boolean;
  hasTokens: () => boolean;
}

export async function getUserPlanAndTokens(userId?: string): Promise<UserPlanAndTokens> {
  const { userId: authUserId, orgId } = await auth();
  const targetUserId = userId || authUserId;

  if (!targetUserId) {
    return {
      plan: "free",
      tokensRemaining: 0,
      subscriptionStatus: "inactive",
      canAccessFeature: () => false,
      hasTokens: () => false,
    };
  }

  try {
    // Get user's organization
    const org = await prisma.org.findFirst({
      where: {
        clerkOrgId: orgId || "",
      },
      include: {
        plan: true,
        subscription: true,
        tokens: true,
      },
    });

    if (!org) {
      return {
        plan: "free",
        tokensRemaining: 0,
        subscriptionStatus: "inactive",
        canAccessFeature: (feature: string) => feature === "demo",
        hasTokens: () => false,
      };
    }

    // Get latest token balance from ledger
    const latestTokenEntry = await prisma.tokens_ledger.findFirst({
      where: { org_id: org.id },
      orderBy: { createdAt: "desc" },
    });

    const plan = org.plan?.slug || "free";
    const tokensRemaining = latestTokenEntry?.balance || org.tokens?.aiRemaining || 0;
    const subscriptionStatus = org.subscription?.status || "inactive";

    return {
      plan,
      tokensRemaining,
      subscriptionStatus,
      canAccessFeature: (feature: string) => {
        if (feature === "demo") return true;
        if (subscriptionStatus !== "active") return false;

        const planFeatures = {
          free: ["demo"],
          solo: ["demo", "basic-reports", "ai-analysis"],
          business: ["demo", "basic-reports", "ai-analysis", "advanced-reports", "integrations"],
          enterprise: [
            "demo",
            "basic-reports",
            "ai-analysis",
            "advanced-reports",
            "integrations",
            "custom-branding",
            "api-access",
          ],
        };

        return planFeatures[plan as keyof typeof planFeatures]?.includes(feature) || false;
      },
      hasTokens: () => tokensRemaining > 0,
    };
  } catch (error) {
    logger.error("Error getting user plan and tokens:", error);
    return {
      plan: "free",
      tokensRemaining: 0,
      subscriptionStatus: "error",
      canAccessFeature: () => false,
      hasTokens: () => false,
    };
  }
}

export async function consumeTokens(
  count: number = 1,
  orgId?: string
): Promise<{ success: boolean; remainingTokens: number }> {
  const { orgId: authOrgId } = await auth();
  const targetOrgId = orgId || authOrgId;

  if (!targetOrgId) {
    return { success: false, remainingTokens: 0 };
  }

  try {
    const org = await prisma.org.findUnique({
      where: { clerkOrgId: targetOrgId },
      include: {
        tokens: true,
      },
    });

    if (!org) {
      return { success: false, remainingTokens: 0 };
    }

    // Get current balance from latest ledger entry
    const latestEntry = await prisma.tokens_ledger.findFirst({
      where: { org_id: org.id },
      orderBy: { createdAt: "desc" },
    });

    const currentBalance = latestEntry?.balance || org.tokens?.aiRemaining || 0;

    if (currentBalance < count) {
      return { success: false, remainingTokens: currentBalance };
    }

    // Atomic token consumption - create ledger entry
    await prisma.tokens_ledger.create({
      data: {
        org_id: org.id,
        change: -count,
        balance: currentBalance - count,
        reason: `Consumed ${count} token${count > 1 ? "s" : ""} for operation`,
      },
    });

    return { success: true, remainingTokens: currentBalance - count };
  } catch (error) {
    logger.error("Error consuming tokens:", error);
    return { success: false, remainingTokens: 0 };
  }
}

// Server-side function to check and redirect if insufficient access
export async function requireTokens(requiredTokens: number = 1, requiredFeature?: string) {
  // BETA MODE: Allow all access during beta testing
  if (isBetaMode()) {
    logger.debug("[BILLING] Beta mode active - bypassing token check");
    return {
      subscriptionStatus: "active" as const,
      canAccessFeature: () => true,
      hasTokens: () => true,
      tokensRemaining: 999999,
    };
  }

  const userPlan = await getUserPlanAndTokens();

  if (requiredFeature && !userPlan.canAccessFeature(requiredFeature)) {
    redirect("/pricing?feature=" + encodeURIComponent(requiredFeature));
  }

  if (!userPlan.hasTokens() || userPlan.tokensRemaining < requiredTokens) {
    redirect("/pricing?tokens=" + requiredTokens);
  }

  return userPlan;
}

// Check subscription status for feature access
export async function requireSubscription(feature?: string) {
  // BETA MODE: Allow all access during beta testing
  if (isBetaMode()) {
    logger.debug("[BILLING] Beta mode active - bypassing subscription check");
    return {
      subscriptionStatus: "active" as const,
      plan: "enterprise",
      tokensRemaining: 999999,
      canAccessFeature: () => true,
      hasTokens: () => true,
    };
  }

  const userPlan = await getUserPlanAndTokens();

  if (userPlan.subscriptionStatus !== "active") {
    redirect("/pricing?required=subscription");
  }

  if (feature && !userPlan.canAccessFeature(feature)) {
    redirect("/pricing?feature=" + encodeURIComponent(feature));
  }

  return userPlan;
}
