/**
 * 🔄 SYNC IDENTITY TO CLERK
 *
 * POST /api/auth/sync-identity
 *
 * Syncs user_registry.userType → Clerk publicMetadata.userType
 * This enables O(1) identity lookup in middleware (Edge runtime)
 *
 * Should be called:
 * - After user registration
 * - After onboarding completion
 * - When userType changes
 */

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { getUserIdentity } from "@/lib/identity/userIdentity";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get identity from user_registry (source of truth)
    const identity = await getUserIdentity(user.id);

    if (!identity) {
      return NextResponse.json(
        {
          error: "No identity found",
          message: "User not registered in user_registry",
        },
        { status: 404 }
      );
    }

    // Sync to Clerk publicMetadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(user.id, {
      publicMetadata: {
        userType: identity.userType,
        orgId: identity.orgId,
        onboardingComplete: identity.onboardingComplete,
      },
    });

    // Also set cookie as fallback
    const response = NextResponse.json({
      success: true,
      userType: identity.userType,
      synced: true,
    });

    response.cookies.set("x-user-type", identity.userType, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    logger.error("[/api/auth/sync-identity] Error:", error);
    return NextResponse.json(
      { error: "Failed to sync identity", message: error.message },
      { status: 500 }
    );
  }
}
