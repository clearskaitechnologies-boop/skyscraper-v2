import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getActiveOrgContext } from "@/lib/auth/tenant";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Production diagnostic endpoint
 * Returns system health without exposing secrets
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const results: any = {
    timestamp,
    env: {
      VERCEL_ENV: process.env.VERCEL_ENV || "unknown",
      NODE_ENV: process.env.NODE_ENV || "unknown",
      runtime: "nodejs",
    },
    checks: {},
  };

  // 1. Database URL check (boolean only)
  results.checks.hasDatabaseUrl = !!process.env.DATABASE_URL;

  // 2. Clerk keys check (boolean only)
  results.checks.hasClerkKeys = !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );

  // 3. Database smoke test
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.checks.dbSmokeTest = "pass";
  } catch (error: any) {
    results.checks.dbSmokeTest = "fail";
    results.checks.dbError = error.message || "Unknown DB error";
  }

  // 4. Auth smoke test
  try {
    const { userId } = await auth();
    results.checks.authSmokeTest = userId ? "pass" : "no-user";
    results.checks.userId = userId || null;
  } catch (error: any) {
    results.checks.authSmokeTest = "fail";
    results.checks.authError = error.message || "Unknown auth error";
  }

  // 5. Org resolution smoke test
  try {
    const orgContext = await getActiveOrgContext();
    results.checks.orgResolutionSmokeTest = orgContext.ok ? "pass" : "fail";
    results.checks.orgId = orgContext.ok ? orgContext.orgId : null;
    if (!orgContext.ok) {
      results.checks.orgError = orgContext.error;
    }
  } catch (error: any) {
    results.checks.orgResolutionSmokeTest = "fail";
    results.checks.orgError = error.message || "Unknown org error";
  }

  // 6. Tables smoke test (light query to key tables)
  try {
    const orgId = results.checks.orgId;
    if (orgId) {
      const [claimsCount, contactsCount, propertiesCount] = await Promise.all([
        prisma.claims.count({ where: { orgId } }),
        prisma.contacts.count({ where: { orgId } }),
        prisma.properties.count({ where: { orgId } }),
      ]);
      results.checks.tablesSmoke = "pass";
      results.checks.recordCounts = {
        claims: claimsCount,
        contacts: contactsCount,
        properties: propertiesCount,
      };
    } else {
      results.checks.tablesSmoke = "skip-no-org";
    }
  } catch (error: any) {
    results.checks.tablesSmoke = "fail";
    results.checks.tablesError = error.message || "Unknown tables error";
  }

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}
