/**
 * POST /api/esign/envelopes/[envelopeId]/finalize
 *
 * Finalize envelope - mark signature as complete
 * NOTE: Uses simplified SignatureEnvelope model (esign models not yet implemented)
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { envelopeId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const envelopeId = params.envelopeId;

    // Get envelope using SignatureEnvelope model
    const envelope = await prisma.signatureEnvelope.findUnique({
      where: { id: envelopeId },
    });

    if (!envelope) {
      return NextResponse.json({ ok: false, message: "Envelope not found" }, { status: 404 });
    }

    // Check if already signed
    if (envelope.status === "signed") {
      return NextResponse.json({
        ok: true,
        message: "Envelope already finalized",
        status: envelope.status,
        signedDocumentUrl: envelope.signedDocumentUrl,
      });
    }

    // Check if envelope is in valid state for finalization
    if (envelope.status === "voided" || envelope.status === "declined") {
      return NextResponse.json(
        { ok: false, message: `Cannot finalize ${envelope.status} envelope` },
        { status: 400 }
      );
    }

    // Update envelope status to signed/completed
    const updatedEnvelope = await prisma.signatureEnvelope.update({
      where: { id: envelopeId },
      data: {
        status: "signed",
        signedAt: new Date(),
        // signedDocumentUrl would be set by the signing process
      },
    });

    // Create claim document if claim exists (AUTO-ATTACH)
    if (envelope.claimId && envelope.documentUrl) {
      await prisma.$executeRaw`
        INSERT INTO claim_documents (claim_id, title, file_path, file_type, created_at)
        VALUES (${envelope.claimId}, ${envelope.documentName + " (Signed)"}, ${envelope.signedDocumentUrl || envelope.documentUrl}, 'pdf', NOW())
        ON CONFLICT DO NOTHING
      `;
    }

    return NextResponse.json({
      ok: true,
      signedDocumentUrl: updatedEnvelope.signedDocumentUrl,
      status: updatedEnvelope.status,
    });
  } catch (error) {
    console.error("[ENVELOPE_FINALIZE_ERROR]", error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to finalize" },
      { status: 500 }
    );
  }
}
