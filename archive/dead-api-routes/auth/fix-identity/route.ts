import { logger } from "@/lib/logger";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * FIX MY IDENTITY - Syncs user type to Clerk based on org membership
 *
 * If user has org membership → sets publicMetadata.userType = "pro"
 * This fixes the root cause of pro users being redirected to /portal
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const rl = await checkRateLimit(user.id, "AUTH");
    if (!rl.success) {
      return NextResponse.json(
        { error: "rate_limit_exceeded", message: "Too many requests" },
        { status: 429 }
      );
    }

    // Check org membership
    const orgMembership = await prisma.user_organizations.findFirst({
      where: { userId: user.id },
      select: { id: true, organizationId: true },
    });

    if (!orgMembership) {
      return NextResponse.json({
        ok: false,
        error: "No org membership found - cannot confirm pro status",
        suggestion: "This user may need to go through onboarding first",
      });
    }

    // User HAS org membership - they ARE a pro user
    // Update Clerk metadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        userType: "pro",
      },
    });

    // Also ensure user_registry exists and is marked as pro
    await prisma.user_registry.upsert({
      where: { clerkUserId: user.id },
      update: { userType: "pro" },
      create: {
        clerkUserId: user.id,
        userType: "pro",
        displayName:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
          "User",
        primaryEmail: user.emailAddresses?.[0]?.emailAddress || "",
        onboardingComplete: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Identity fixed! User is now marked as PRO",
      actions: ["✅ Clerk publicMetadata.userType = 'pro'", "✅ user_registry.userType = 'pro'"],
      nextStep: "Refresh the page or go to /dashboard",
    });
  } catch (error) {
    logger.error("fix-identity error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: "POST /api/auth/fix-identity to sync your pro status",
    description:
      "If you have org membership but are being redirected to /portal, call this endpoint to fix your identity",
  });
}
