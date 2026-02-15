/**
 * Sentry Test Route (Development Only)
 *
 * GET /api/test-sentry
 *
 * Throws a test error to verify Sentry integration is working.
 * Only works in development mode to prevent accidental production errors.
 *
 * Usage:
 * 1. Start dev server: pnpm dev
 * 2. Visit: http://localhost:3000/api/test-sentry
 * 3. Check Sentry dashboard for error capture
 */

import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Only allow test errors in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Test route only available in development" },
      { status: 403 }
    );
  }

  try {
    // Add breadcrumb for context
    Sentry.addBreadcrumb({
      category: "test",
      message: "Sentry test route accessed",
      level: "info",
    });

    // Throw test error
    throw new Error("🧪 Sentry Test Error — If you see this in Sentry, monitoring is working!");
  } catch (error) {
    // Capture exception with metadata
    Sentry.captureException(error, {
      tags: {
        subsystem: "test",
        route: "/api/test-sentry",
      },
      extra: {
        testMode: true,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    });

    // Re-throw to ensure Sentry catches it
    throw error;
  }
}
