/**
 * Final Payout Signature API
 * POST /api/claims/[claimId]/final-payout/signature
 *
 * Saves the homeowner's signature on the Certificate of Completion
 * Uses raw SQL for the signed_documents table until Prisma schema is updated
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { signatureDataUrl, signedBy, signedAt } = await req.json();

    if (!signatureDataUrl) {
      return NextResponse.json({ error: "Signature data is required" }, { status: 400 });
    }

    const claimId = params.claimId;

    // Get claim to verify it exists and get orgId
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { orgId: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Store signature in signed_documents table using raw SQL
    const documentName = `Certificate of Completion - Signed by ${signedBy}`;
    const documentType = "COMPLETION_CERTIFICATE_SIGNED";
    const signedAtDate = new Date(signedAt);
    const metadata = JSON.stringify({
      signedBy,
      signedAt,
      documentType: "certificate_signature",
    });

    const result = await prisma.$executeRaw`
      INSERT INTO signed_documents (
        "claimId", "orgId", name, type, "signatureDataUrl", 
        "signedBy", "signedAt", "uploadedBy", metadata
      ) VALUES (
        ${claimId}, ${claim.orgId}, ${documentName}, ${documentType}, 
        ${signatureDataUrl}, ${signedBy}, ${signedAtDate}, ${userId}, ${metadata}::jsonb
      )
      RETURNING id
    `;

    // Update claim with signature tracking fields using raw SQL
    await prisma.$executeRaw`
      UPDATE claims 
      SET "certificationSignedAt" = ${signedAtDate},
          "certificationSignedBy" = ${signedBy}
      WHERE id = ${claimId}
    `;

    return NextResponse.json({
      success: true,
      message: "Signature saved successfully",
    });
  } catch (error: any) {
    console.error("[POST /api/claims/[claimId]/final-payout/signature] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save signature" },
      { status: 500 }
    );
  }
}
