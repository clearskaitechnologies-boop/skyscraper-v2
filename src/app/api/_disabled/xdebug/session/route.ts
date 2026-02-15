/**
 * UNCRASHABLE DEBUG SESSION ENDPOINT
 *
 * RULES:
 * - ALWAYS returns 200 JSON (never throws, never 404)
 * - Works even if org init fails
 * - Shows DB host, env, userId, clerkOrgId, org status
 * - Public route (middleware allows through)
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ActiveOrgResult, getActiveOrgSafe } from "@/lib/auth/getActiveOrgSafe";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    // Get session (may be null)
    const { userId, orgId: clerkOrgId } = await auth();

    if (!userId) {
      return NextResponse.json({
        ok: false,
        reason: "NO_SESSION",
        timestamp,
        message: "User not authenticated - sign in first",
      });
    }

    // Get DB host safely
    let dbHost = "unknown";
    try {
      const dbUrl = process.env.DATABASE_URL || "";
      const match = dbUrl.match(/@([^/:]+)/);
      dbHost = match ? match[1] : "localhost";
    } catch {
      dbHost = "error-parsing";
    }

    // Try to get org (but DON'T fail if it doesn't work)
    let orgResult: ActiveOrgResult | null = null;
    let orgError: string | null = null;
    try {
      orgResult = await getActiveOrgSafe({ allowAutoCreate: false });
    } catch (error: any) {
      orgError = error.message;
    }

    // Get membership count
    let membershipsCount = 0;
    try {
      membershipsCount = await prisma.user_organizations.count({
        where: { userId },
      });
    } catch {
      membershipsCount = -1;
    }

    // Get claim count for org (if org exists)
    let claimsCountForOrg = 0;
    let recentClaims: any[] = [];
    if (orgResult?.ok) {
      try {
        claimsCountForOrg = await prisma.claims.count({
          where: { orgId: orgResult.org.id },
        });

        recentClaims = await prisma.claims.findMany({
          where: { orgId: orgResult.org.id },
          select: {
            id: true,
            claimNumber: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        });
      } catch {
        claimsCountForOrg = -1;
      }
    }

    // ALWAYS return success with full diagnostics
    return NextResponse.json({
      ok: true,
      timestamp,
      session: {
        userId,
        clerkOrgId: clerkOrgId || null,
      },
      org: orgResult?.ok
        ? {
            id: orgResult.org.id,
            name: orgResult.org.name,
            clerkOrgId: orgResult.org.clerkOrgId,
            source: orgResult.source,
          }
        : null,
      orgError: orgResult?.ok === false ? orgResult.error : orgError,
      orgReason: orgResult?.ok === false ? orgResult.reason : null,
      membershipsCount,
      claimsCountForOrg,
      recentClaims,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV || null,
        VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
      },
      database: {
        host: dbHost,
      },
    });
  } catch (error: any) {
    // Even catastrophic errors return 200 with error details
    return NextResponse.json(
      {
        ok: false,
        reason: "CATASTROPHIC_ERROR",
        timestamp,
        error: error.message,
        stack: error.stack?.split("\n").slice(0, 5),
      },
      { status: 200 }
    );
  }
}
