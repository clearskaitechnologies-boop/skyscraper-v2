/**
 * COMPREHENSIVE DIAGNOSTICS ENDPOINT
 *
 * PUBLIC ROUTE - Returns full system state for debugging
 * - Environment info
 * - Clerk auth status
 * - Database connectivity
 * - Org resolution status
 * - Counts and recent data
 *
 * NEVER THROWS - always returns JSON
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getActiveOrgSafe } from "@/lib/auth/getActiveOrgSafe";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    // Get environment info
    const env = {
      vercelEnv: process.env.VERCEL_ENV || "local",
      nodeEnv: process.env.NODE_ENV || "development",
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
      nodeVersion: process.version,
    };

    // Get Clerk auth status
    let clerkAuth: any = { hasAuth: false, userId: null, orgIdFromClerk: null };
    try {
      const authResult = await auth();
      clerkAuth = {
        hasAuth: !!authResult.userId,
        userId: authResult.userId || null,
        orgIdFromClerk: authResult.orgId || null,
      };
    } catch (authError: any) {
      clerkAuth.error = authError.message;
    }

    // Get DB info
    let dbInfo: any = { host: "unknown", canConnect: false };
    try {
      const dbUrl = process.env.DATABASE_URL || "";
      const match = dbUrl.match(/@([^/:]+)/);
      dbInfo.host = match ? match[1] : "localhost";

      // Test connection
      await prisma.$queryRaw`SELECT 1`;
      dbInfo.canConnect = true;
    } catch (dbError: any) {
      dbInfo.canConnect = false;
      dbInfo.error = dbError.message;
    }

    // Test Prisma models
    let prismaCheck: any = { modelsOk: false };
    try {
      await prisma.org.findMany({ take: 1 });
      prismaCheck.modelsOk = true;
    } catch (prismaError: any) {
      prismaCheck.modelsOk = false;
      prismaCheck.error = prismaError.message;
      prismaCheck.errorCode = prismaError.code;
      prismaCheck.errorMeta = prismaError.meta;
    }

    // Try org resolution (only if we have a user)
    let orgResolution: any = { attempted: false };
    let counts: any = { totalOrgs: 0, totalMemberships: 0, totalClaimsForOrg: 0 };

    if (clerkAuth.userId) {
      try {
        const orgResult = await getActiveOrgSafe({ allowAutoCreate: false });
        orgResolution = {
          attempted: true,
          success: orgResult.ok,
          ...(orgResult.ok
            ? {
                orgId: orgResult.org.id,
                orgName: orgResult.org.name,
                clerkOrgId: orgResult.org.clerkOrgId,
                source: orgResult.source,
              }
            : {
                reason: orgResult.reason,
                error: orgResult.error,
              }),
        };

        // Get counts if org exists
        if (orgResult.ok) {
          try {
            counts.totalClaimsForOrg = await prisma.claims.count({
              where: { orgId: orgResult.org.id },
            });
          } catch {}
        }

        // Get membership count for this user
        try {
          counts.totalMemberships = await prisma.user_organizations.count({
            where: { userId: clerkAuth.userId },
          });
        } catch {}
      } catch (orgError: any) {
        orgResolution.attempted = true;
        orgResolution.success = false;
        orgResolution.error = orgError.message;
      }
    }

    // Get global counts
    try {
      counts.totalOrgs = await prisma.org.count();
    } catch {}

    // Return full diagnostic info
    return NextResponse.json({
      ok: true,
      timestamp,
      env,
      clerk: clerkAuth,
      db: dbInfo,
      prisma: prismaCheck,
      orgResolution,
      counts,
      message: "Diagnostics collected successfully",
    });
  } catch (error: any) {
    // Even catastrophic errors return 200 with error details
    return NextResponse.json(
      {
        ok: false,
        timestamp,
        reason: "CATASTROPHIC_ERROR",
        error: error.message,
        stack: error.stack?.split("\n").slice(0, 5),
      },
      { status: 200 }
    );
  }
}
