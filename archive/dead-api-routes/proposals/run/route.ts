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

import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  requireActiveSubscription,
  SubscriptionRequiredError,
} from "@/lib/billing/requireActiveSubscription";
import { enqueue } from "@/lib/queue";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // ── Auth ──
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Billing guard ──
    try {
      await requireActiveSubscription(orgId);
    } catch (error) {
      if (error instanceof SubscriptionRequiredError) {
        return NextResponse.json(
          { error: "subscription_required", message: "Active subscription required" },
          { status: 402 }
        );
      }
      throw error;
    }

    // ── Rate limit ──
    const rl = await checkRateLimit(userId, "AI");
    if (!rl.success) {
      return NextResponse.json(
        {
          error: "rate_limit_exceeded",
          message: "Too many requests. Please try again later.",
          retryAfter: rl.reset,
        },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) },
        }
      );
    }

    const body = await req.json();
    const { leadId, orgId: bodyOrgId, userId: bodyUserId, title, sections } = body;

    // Enqueue proposal generation job
    const jobId = await enqueue("proposal-generate", {
      leadId,
      orgId: bodyOrgId || orgId,
      userId: bodyUserId || userId,
      title: title || "New Proposal",
      sections: sections || [],
    });

    logger.debug(`Proposal generation job enqueued: ${jobId}`);

    return NextResponse.json({
      jobId,
    });
  } catch (error) {
    logger.error("Error enqueuing proposal generation job:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
