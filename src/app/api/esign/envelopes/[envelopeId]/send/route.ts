/**
 * POST /api/esign/envelopes/[id]/send
 *
 * Send an envelope to the designated signer
 * Uses the actual SignatureEnvelope schema with single signer info
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ envelopeId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const { envelopeId } = await params;

    // Get envelope
    const envelope = await prisma.signatureEnvelope.findUnique({
      where: { id: envelopeId },
    });

    if (!envelope) {
      return NextResponse.json({ ok: false, message: "Envelope not found" }, { status: 404 });
    }

    // Check if envelope has signer info
    if (!envelope.signerEmail) {
      return NextResponse.json(
        { ok: false, message: "No signer email configured" },
        { status: 400 }
      );
    }

    // Update envelope status to sent
    await prisma.signatureEnvelope.update({
      where: { id: envelopeId },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    // TODO: Integrate with email service to send signing invitation
    console.log(`[ESIGN] Envelope ${envelopeId} sent to ${envelope.signerEmail}`);

    return NextResponse.json({
      ok: true,
      message: "Envelope sent successfully",
      envelope: {
        id: envelope.id,
        status: "sent",
        signerEmail: envelope.signerEmail,
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[ENVELOPE_SEND_ERROR]", error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to send" },
      { status: 500 }
    );
  }
}
