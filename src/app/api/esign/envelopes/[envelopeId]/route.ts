/**
 * GET /api/esign/envelopes/[id]
 *
 * Get envelope details
 */

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ envelopeId: string }> }
) {
  try {
    const { envelopeId } = await params;

    const envelope = await prisma.signatureEnvelope.findUnique({
      where: { id: envelopeId },
    });

    if (!envelope) {
      return NextResponse.json({ ok: false, message: "Envelope not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      envelope: {
        id: envelope.id,
        provider: envelope.provider,
        externalId: envelope.externalId,
        status: envelope.status,
        documentName: envelope.documentName,
        documentUrl: envelope.documentUrl,
        signedDocumentUrl: envelope.signedDocumentUrl,
        signerEmail: envelope.signerEmail,
        signerName: envelope.signerName,
        signerRole: envelope.signerRole,
        sentAt: envelope.sentAt,
        viewedAt: envelope.viewedAt,
        signedAt: envelope.signedAt,
        expiresAt: envelope.expiresAt,
        createdAt: envelope.createdAt,
        metadata: envelope.metadata,
      },
    });
  } catch (error) {
    console.error("[ENVELOPE_GET_ERROR]", error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to get envelope" },
      { status: 500 }
    );
  }
}
