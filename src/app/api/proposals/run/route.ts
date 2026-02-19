export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Proposals Run API
 *
 * POST /api/proposals/run
 * Enqueues a proposal generation job.
 *
 * Request:
 * {
 *   "leadId": "...",     // optional
 *   "orgId": "...",      // optional
 *   "userId": "...",     // optional
 *   "title": "...",      // optional, default "New Proposal"
 *   "sections": [        // optional
 *     { "key": "intro", "data": { "text": "..." } },
 *     { "key": "scope", "data": { ... } }
 *   ]
 * }
 *
 * Response:
 * {
 *   "jobId": "..."
 * }
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { enqueue } from "@/lib/queue";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, orgId, userId, title, sections } = body;

    // Enqueue proposal generation job
    const jobId = await enqueue(
      "proposal-generate",
      {
        leadId,
        orgId,
        userId,
        title: title || "New Proposal",
        sections: sections || [],
      }
    );

    logger.debug(`Proposal generation job enqueued: ${jobId}`);

    return NextResponse.json({
      jobId,
    });
  } catch (error) {
    logger.error("Error enqueuing proposal generation job:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
