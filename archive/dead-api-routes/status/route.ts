import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/apiAuth";
import { pool } from "@/server/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Status endpoint
 * Locked: exposes DB status, Clerk enabled, assistant feature flags
 */
export async function GET() {
  const authResult = await requireApiAuth();
  if (authResult instanceof NextResponse) return authResult;

  const buildSha = process.env.NEXT_PUBLIC_BUILD_SHA || "unknown";
  const nodeEnv = process.env.NODE_ENV || "unknown";

  let dbStatus = "unknown";
  let dbError = null;

  // Test database connection
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    dbStatus = result.rows[0] ? "connected" : "error";
  } catch (error) {
    dbStatus = "error";
    dbError = error?.message || "Connection failed";
  }

  return NextResponse.json({
    status: "ok",
    build: {
      sha: buildSha,
      environment: nodeEnv,
      timestamp: new Date().toISOString(),
    },
    database: {
      status: dbStatus,
      error: dbError,
    },
    clerk: {
      enabled: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
    assistant: {
      enabled: process.env.NEXT_PUBLIC_ASSISTANT_ENABLED === "true",
      variant: process.env.NEXT_PUBLIC_ASSISTANT_VARIANT || "v2",
    },
  });
}
