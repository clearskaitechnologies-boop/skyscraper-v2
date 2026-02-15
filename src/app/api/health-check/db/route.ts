import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/_health/db
 * Database health check - returns counts and connection status
 */
export async function GET() {
  try {
    const [orgCount, claimCount, membershipCount] = await Promise.all([
      prisma.org.count(),
      prisma.claims.count(),
      prisma.user_organizations.count(),
    ]);

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      counts: {
        organizations: orgCount,
        claims: claimCount,
        memberships: membershipCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
