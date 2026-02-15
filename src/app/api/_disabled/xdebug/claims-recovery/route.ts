/**
 * CLAIMS RECOVERY DIAGNOSTIC ENDPOINT
 * Shows all claims created by current user across ALL orgs
 * Helps diagnose "where did my claims go?" issues
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Check if user is platform admin (optional - remove in production if not needed)
    const isDev = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV !== "production";

    // Get current org context
    let currentOrgId: string | null = null;
    try {
      const { orgId: clerkOrgId } = await auth();
      if (clerkOrgId) {
        const org = await prisma.org.findUnique({
          where: { clerkOrgId },
          select: { id: true },
        });
        currentOrgId = org?.id || null;
      }

      if (!currentOrgId) {
        const membership = await prisma.user_organizations.findFirst({
          where: { userId },
          select: { organizationId: true },
        });
        currentOrgId = membership?.organizationId || null;
      }
    } catch (error) {
      console.error("[claims-recovery] Error getting current org:", error);
    }

    // Find all claims in orgs this user belongs to
    const allClaims = await prisma.claims.findMany({
      where: {
        Org: {
          users: { some: { clerkUserId: userId } },
        },
      },
      select: {
        id: true,
        claimNumber: true,
        orgId: true,
        insured_name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to most recent 100
    });

    // Group claims by orgId
    const claimsByOrg: Record<string, typeof allClaims> = {};
    const orgIds = new Set<string>();

    allClaims.forEach((claim) => {
      if (!claimsByOrg[claim.orgId]) {
        claimsByOrg[claim.orgId] = [];
      }
      claimsByOrg[claim.orgId].push(claim);
      orgIds.add(claim.orgId);
    });

    // Get org details
    const orgs = await prisma.org.findMany({
      where: {
        id: { in: Array.from(orgIds) },
      },
      select: {
        id: true,
        name: true,
        clerkOrgId: true,
      },
    });

    const orgMap = Object.fromEntries(orgs.map((org) => [org.id, org]));

    // Build recovery report
    const recovery = Object.entries(claimsByOrg).map(([orgId, claims]) => ({
      orgId,
      orgName: orgMap[orgId]?.name || "Unknown",
      isCurrentOrg: orgId === currentOrgId,
      claimCount: claims.length,
      claims: claims.map((c) => ({
        id: c.id,
        claimNumber: c.claimNumber,
        insured_name: c.insured_name || "Unknown",
        status: c.status,
        createdAt: c.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({
      ok: true,
      userId,
      currentOrgId,
      totalClaims: allClaims.length,
      orgCount: orgIds.size,
      recovery,
      isDev,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[claims-recovery] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
