import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/health/db
 * Database health check - returns connection status and basic counts
 */
export async function GET() {
  try {
    const [orgCount, claimCount, memberCount] = await Promise.all([
      prisma.org.count(),
      prisma.claims.count(),
      prisma.user_organizations.count(),
    ]);

    return NextResponse.json({
      ok: true,
      database: "connected",
      counts: {
        orgs: orgCount,
        claims: claimCount,
        memberships: memberCount,
      },
      ts: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        ts: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
