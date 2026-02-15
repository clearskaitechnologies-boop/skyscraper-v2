// /api/signatures/respond

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { notifyDocumentSigned } from "@/lib/notifications/sendNotification";
import prisma from "@/lib/prisma";
import { isTestMode } from "@/lib/testMode";
import { createId } from "@paralleldrive/cuid2";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, action } = body;

    if (!requestId || !["signed", "declined"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Fetch signature envelope
    const signatureEnvelope = await prisma.signatureEnvelope.findUnique({
      where: { id: requestId },
    });

    if (!signatureEnvelope) {
      return NextResponse.json({ error: "Signature request not found" }, { status: 404 });
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
      console.log(
        `[TestMode][Notify] Document "${signatureEnvelope.documentName}" ${action} by ${signatureEnvelope.signerEmail}`
      );
    }

    return NextResponse.json({
      success: true,
      signatureEnvelope: updated,
      message: action === "signed" ? "Document signed successfully" : "Signature declined",
    });
  } catch (error: any) {
    console.error("Error responding to signature request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process signature response" },
      { status: 500 }
    );
  }
}
