import { NextRequest, NextResponse } from "next/server";

// Disable prerendering for this dev endpoint
export const dynamic = "force-dynamic";

/**
 * Test endpoint to verify Sentry error tracking
 * Only works in non-production environments
 */
export async function GET(request: NextRequest) {
  // Only allow in development/staging
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "This endpoint is disabled in production" }, { status: 403 });
  }

  // Test error to verify Sentry ingestion
  throw new Error("Test error from /api/dev/throw - Sentry integration test");
}
