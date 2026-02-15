/**
 * Demo Status API
 *
 * Returns the current demo mode status for the authenticated user's org.
 * Used by frontend components to determine whether to show demo data or empty states.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getDemoStatus } from "@/lib/demo/DemoService";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      // Not authenticated - check env-level demo mode only
      const envDemoMode =
        process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.DEMO_MODE === "true";
      return NextResponse.json({
        isDemoEnabled: envDemoMode,
        envDemoMode,
        orgDemoMode: false,
        demoSeededAt: null,
        authenticated: false,
      });
    }

    // Get org ID from Clerk or lookup user's primary org
    let resolvedOrgId = orgId;

    if (!resolvedOrgId) {
      // Try to find user's org from our database
      const user = await prisma.users.findUnique({
        where: { clerkUserId: userId },
        select: { orgId: true },
      });
      resolvedOrgId = user?.orgId ?? undefined;
    }

    if (!resolvedOrgId) {
      // No org - return env-level demo mode only
      const envDemoMode =
        process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.DEMO_MODE === "true";
      return NextResponse.json({
        isDemoEnabled: envDemoMode,
        envDemoMode,
        orgDemoMode: false,
        demoSeededAt: null,
        authenticated: true,
        hasOrg: false,
      });
    }

    // Get full demo status for org
    const status = await getDemoStatus(resolvedOrgId);

    return NextResponse.json({
      ...status,
      authenticated: true,
      hasOrg: true,
      orgId: resolvedOrgId,
    });
  } catch (error) {
    console.error("[DEMO_STATUS] Error:", error);

    // Fallback to env-level check on error
    const envDemoMode =
      process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.DEMO_MODE === "true";
    return NextResponse.json({
      isDemoEnabled: envDemoMode,
      envDemoMode,
      orgDemoMode: false,
      demoSeededAt: null,
      error: "Failed to fetch org demo status",
    });
  }
}
