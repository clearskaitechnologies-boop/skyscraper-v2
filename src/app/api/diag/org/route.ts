/**
 * Diagnostic endpoint to show org resolution result in production
 * Helps debug "Claim not found" and "No access" issues
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getResolvedOrgResult } from "@/lib/auth/orgResolver";
import prisma from "@/lib/prisma";

// 🔥 FORCE NODE RUNTIME - PRISMA CANNOT RUN ON EDGE
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 🚨 COMPREHENSIVE DEBUG - Show EVERYTHING about Prisma
  if (!prisma || typeof prisma !== "object") {
    return NextResponse.json(
      {
        ok: false,
        error: "PRISMA_UNDEFINED",
        prismaType: typeof prisma,
        prismaValue: String(prisma),
      },
      { status: 500 }
    );
  }

  const allKeys = Object.keys(prisma as any);
  const orgKeys = allKeys.filter((k) => k.toLowerCase().includes("org"));
  const userKeys = allKeys.filter((k) => k.toLowerCase().includes("user"));

  const hasUserOrgs = !!(prisma as any).user_organizations;
  const hasOrg = !!(prisma as any).org;

  // If Prisma delegates missing, return debug info
  if (!hasUserOrgs || !hasOrg) {
    return NextResponse.json(
      {
        ok: false,
        error: "PRISMA_DELEGATES_MISSING",
        prismaType: typeof prisma,
        totalDelegates: allKeys.length,
        orgRelatedKeys: orgKeys,
        userRelatedKeys: userKeys,
        hasUserOrganizations: hasUserOrgs,
        hasOrg: hasOrg,
        sampleKeys: allKeys.slice(0, 50),
      },
      { status: 500 }
    );
  }

  try {
    const clerkAuth = await auth();
    const orgResult = await getResolvedOrgResult();

    // Get additional context if we have a user
    let userOrgs: any[] = [];
    let legacyOrgId: string | null = null;

    if (clerkAuth.userId) {
      // Check user_organizations table
      userOrgs = await prisma.user_organizations.findMany({
        where: { userId: clerkAuth.userId },
        select: {
          organizationId: true,
          role: true,
          createdAt: true,
        },
      });

      // Check legacy users.orgId
      const user = await prisma.users.findUnique({
        where: { clerkUserId: clerkAuth.userId },
        select: { orgId: true },
      });
      legacyOrgId = user?.orgId ?? null;
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      clerk: {
        userId: clerkAuth.userId ?? null,
        orgId: clerkAuth.orgId ?? null,
      },
      resolution: orgResult,
      debug: {
        userOrganizations: userOrgs,
        legacyOrgId,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? String(error),
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}
