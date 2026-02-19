export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST /api/queue/echo
 *
 * Test endpoint to verify queue system is working.
 * Enqueues an echo job and returns the job ID.
 * Check Railway worker logs to verify job was processed.
 *
 * @example
 * curl -X POST https://skaiscrape.com/api/queue/echo \
 *   -H "Content-Type: application/json" \
 *   -d '{"message":"test","foo":"bar"}'
 *
 * @returns { jobId: string, description: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { requireApiAuth } from "@/lib/auth/apiAuth";
import { enqueue } from "@/lib/queue";

export async function POST(req: NextRequest) {
  try {
    // Require auth even for test endpoints
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    // Get optional payload from request body
    let payload: any = {};

    try {
      payload = await req.json();
    } catch {
      // No body or invalid JSON - use default payload
      payload = {
        description: "Echo test",
        timestamp: new Date().toISOString(),
      };
    }

    // Add timestamp if not provided
    if (!payload.timestamp) {
      payload.timestamp = new Date().toISOString();
    }

    // Enqueue the echo job
    const jobId = await enqueue("echo" as any, payload as any);

    return NextResponse.json(
      {
        jobId,
        description: "Echo job enqueued. Check Railway worker logs for output.",
        payload,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to enqueue echo job:", error);

    return NextResponse.json(
      {
        error: "Failed to enqueue echo job",
        description: error.message,
      },
      { status: 500 }
    );
  }
}
