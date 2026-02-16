/**
 * Send Mailers API
 * POST /api/mailers/send
 * Order print+mail fulfillment for batch job addresses
 *
 * STUB: Mailer batch/job models are not yet in Prisma schema.
 * This endpoint returns a "not implemented" response until the
 * BatchJob, MailerBatch, and MailerJob models are added.
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { LOB_ENABLED } from "@/lib/lob/client";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface SendMailersRequest {
  batchJobId: string;
  selection: "all" | "high_confidence" | "custom";
  addressIds?: string[];
  template?: "postcard" | "letter";
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session.userId || !session.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!LOB_ENABLED) {
      return NextResponse.json({ error: "Mailer fulfillment not configured" }, { status: 503 });
    }

    // Parse request body for validation
    const body: SendMailersRequest = await req.json();
    const { batchJobId, selection, addressIds: _addressIds, template = "postcard" } = body;

    // STUB: BatchJob, MailerBatch, and MailerJob models not yet in Prisma schema
    // Return a placeholder response indicating feature is not yet available
    console.log(
      `[Mailers] Stub: Would send ${template} mailers for batch ${batchJobId} with selection: ${selection}`
    );

    return NextResponse.json(
      {
        success: false,
        error: "Mailer functionality not yet implemented. BatchJob/MailerBatch models pending.",
        stub: true,
        request: {
          batchJobId,
          selection,
          template,
        },
      },
      { status: 501 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send mailers";
    logger.error("[Mailers] Send error:", error);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
