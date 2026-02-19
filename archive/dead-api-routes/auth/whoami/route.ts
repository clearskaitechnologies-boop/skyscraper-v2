import { currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * WHO AM I - Debug endpoint for auth state
 * Shows everything about the current user's identity across all systems
 *
 * This helps diagnose why a pro user might end up at /portal instead of /dashboard
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({
        ok: false,
        authenticated: false,
        message: "No Clerk session found",
        fix: "User needs to sign in",
      });
    }

    // Gather all identity information
    const clerkData = {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      publicMetadata: user.publicMetadata,
      userType: user.publicMetadata?.userType || null,
    };

    // Check user_registry
    let userRegistry: {
      id: string;
      userType: string | null;
      displayName: string | null;
      onboardingComplete: boolean;
    } | null = null;
    try {
      userRegistry = await prisma.user_registry.findUnique({
        where: { clerkUserId: user.id },
        select: {
          id: true,
          userType: true,
          displayName: true,
          onboardingComplete: true,
        },
      });
    } catch (e) {
      logger.error("Error fetching user_registry:", e);
    }

    // Check org membership (THE KEY INDICATOR OF PRO STATUS)
    let orgMembership: {
      id: string;
      organizationId: string;
      role: string;
    } | null = null;
    try {
      orgMembership = await prisma.user_organizations.findFirst({
        where: { userId: user.id },
        select: {
          id: true,
          organizationId: true,
          role: true,
        },
      });
    } catch (e) {
      logger.error("Error fetching org membership:", e);
    }

    // Check organization details if membership exists
    let organization: {
      id: string;
      name: string;
      clerkOrgId: string | null;
    } | null = null;
    if (orgMembership?.organizationId) {
      try {
        organization = await prisma.org.findUnique({
          where: { id: orgMembership.organizationId },
          select: {
            id: true,
            name: true,
            clerkOrgId: true,
          },
        });
      } catch (e) {
        logger.error("Error fetching organization:", e);
      }
    }

    // Determine actual user type
    const isPro =
      clerkData.userType === "pro" || userRegistry?.userType === "pro" || !!orgMembership;

    const isClient = clerkData.userType === "client" || userRegistry?.userType === "client";

    const effectiveUserType = isPro ? "pro" : isClient ? "client" : "unknown";

    // Build diagnosis
    const diagnosis: string[] = [];
    if (!clerkData.userType) {
      diagnosis.push("❌ Clerk publicMetadata.userType is NOT set");
    }
    if (!userRegistry) {
      diagnosis.push("❌ No user_registry entry found");
    }
    if (orgMembership) {
      diagnosis.push("✅ User HAS org membership - THIS IS A PRO USER");
    } else {
      diagnosis.push("❌ No org membership found");
    }

    if (isPro && clerkData.userType !== "pro") {
      diagnosis.push(
        "⚠️ User is PRO (has org) but Clerk metadata says: " + (clerkData.userType || "nothing")
      );
      diagnosis.push("🔧 FIX: Need to update Clerk publicMetadata.userType = 'pro'");
    }

    return NextResponse.json({
      ok: true,
      authenticated: true,
      clerk: clerkData,
      userRegistry,
      orgMembership,
      organization,
      effectiveUserType,
      isPro,
      isClient,
      diagnosis,
      expectedRoute: isPro ? "/dashboard" : isClient ? "/portal" : "/onboarding/select-type",
    });
  } catch (error) {
    logger.error("whoami error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
