export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

/**
 * Liveness probe endpoint
 *
 * Returns 200 if the process is alive AND critical env vars are present.
 * Returns 503 if critical config is missing — signals to load balancers
 * that this instance should not receive traffic.
 */
export async function GET() {
  try {
    // Critical environment validation — without these the app cannot function
    const requiredEnvVars = ["DATABASE_URL", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"];
    const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

    if (missingEnvVars.length > 0) {
      logger.warn("[health/live] Missing critical env vars:", missingEnvVars);
      return NextResponse.json(
        {
          status: "degraded",
          timestamp: new Date().toISOString(),
          service: "skaiscraper",
          version: "3.0.0",
          missing: missingEnvVars,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "skaiscraper",
      version: "3.0.0",
      env: {
        hasDatabase: true,
        hasClerk: true,
      },
    });
  } catch (error) {
    logger.error("[health/live] Unexpected error:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        service: "skaiscraper",
        version: "3.0.0",
      },
      { status: 503 }
    );
  }
}
