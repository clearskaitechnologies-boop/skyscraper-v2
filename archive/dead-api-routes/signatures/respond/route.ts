// /api/signatures/respond

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "@/lib/auth/withAuth";
import { notifyDocumentSigned } from "@/lib/notifications/sendNotification";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { isTestMode } from "@/lib/testMode";
import { createId } from "@paralleldrive/cuid2";

export const dynamic = "force-dynamic";

export const POST = withAuth(async (req: NextRequest, { userId, orgId }) => {
  try {
    const rl = await checkRateLimit(userId, "API");
    if (!rl.success) {
      return NextResponse.json(
        { error: "rate_limit_exceeded", message: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { requestId, action } = body;

    if (!requestId || !["signed", "declined"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Fetch signature envelope and verify org ownership via linked claim
    const signatureEnvelope = await prisma.signatureEnvelope.findUnique({
      where: { id: requestId },
    });

    if (!signatureEnvelope) {
      return NextResponse.json({ error: "Signature request not found" }, { status: 404 });
    }

    // If the envelope has a linked claim, verify org ownership
    if (signatureEnvelope.claimId) {
      const claim = await prisma.claims.findFirst({
        where: { id: signatureEnvelope.claimId, orgId },
      });
      if (!claim) {
        return NextResponse.json({ error: "Signature request not found" }, { status: 404 });
      }
    }

    if (signatureEnvelope.status !== "sent" && signatureEnvelope.status !== "viewed") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    // Update signature envelope
    const updated = await prisma.signatureEnvelope.update({
      where: { id: requestId },
      data: {
        status: action,
        signedAt: action === "signed" ? new Date() : null,
      },
    });

    // Log event if we have a claimId
    if (signatureEnvelope.claimId) {
      await prisma.claim_timeline_events.create({
        data: {
          id: createId(),
          claim_id: signatureEnvelope.claimId,
          type: action === "signed" ? "signature_signed" : "signature_declined",
          actor_id: userId,
          actor_type: "client",
          visible_to_client: true,
          metadata: {
            documentName: signatureEnvelope.documentName,
            signerEmail: signatureEnvelope.signerEmail,
            requestId,
          },
        },
      });

      // Send notification to contractor if signed
      if (action === "signed") {
        const claim = await prisma.claims.findUnique({
          where: { id: signatureEnvelope.claimId },
          select: { claimNumber: true, assignedTo: true },
        });

        if (claim?.assignedTo) {
          await notifyDocumentSigned(
            claim.assignedTo,
            signatureEnvelope.id,
            signatureEnvelope.documentName,
            userId
          );
        }
      }
    }

    // Notify Pro
    if (isTestMode()) {
      logger.info(
        `[TestMode][Notify] Document "${signatureEnvelope.documentName}" ${action} by ${signatureEnvelope.signerEmail}`
      );
    }

    return NextResponse.json({
      success: true,
      signatureEnvelope: updated,
      message: action === "signed" ? "Document signed successfully" : "Signature declined",
    });
  } catch (error) {
    logger.error("Error responding to signature request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process signature response" },
      { status: 500 }
    );
  }
});
