export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Liveness probe endpoint
 * This should ALWAYS return 200 OK if the server is running.
 * Do not perform any database or external checks here.
 */
export async function GET() {
  try {
    // Basic environment validation
    const requiredEnvVars = ["DATABASE_URL", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"];
    const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

    if (missingEnvVars.length > 0) {
      logger.warn("[health/live] Missing env vars:", missingEnvVars);
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "skaiscraper",
      version: "3.0.0",
      env: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasClerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      },
    });
  } catch (error) {
    logger.error("[health/live] Unexpected error:", error);
    // Still return 200 OK for liveness probe
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "skaiscraper",
      version: "3.0.0",
    });
  }
}
