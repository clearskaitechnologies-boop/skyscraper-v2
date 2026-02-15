// IMPORTANT: Use Node.js runtime for pg compatibility (not Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { pgPool } from "@/lib/db";

/**
 * Database Health Check
 * GET /api/diag/db
 *
 * Tests that the PostgreSQL connection pool is working correctly.
 * Returns current timestamp from database.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await pgPool.connect();

  try {
    const { rows } = await client.query("SELECT 'ok'::text as status, now() as timestamp");

    return NextResponse.json({
      status: rows[0].status,
      timestamp: rows[0].timestamp,
      pool: {
        totalCount: pgPool.totalCount,
        idleCount: pgPool.idleCount,
        waitingCount: pgPool.waitingCount,
      },
    });
  } catch (error: any) {
    console.error("[DB HEALTH CHECK ERROR]:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        details: "Failed to connect to database",
      },
      { status: 500 }
    );
  } finally {
    // IMPORTANT: Release the client back to the pool (DO NOT call pool.end()!)
    client.release();
  }
}
