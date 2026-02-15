/**
 * Save Certificate API
 * POST /api/claims/[claimId]/final-payout/save-certificate
 *
 * Saves a signed certificate to the claim when downloaded.
 * Stores the signature data and marks it as locally signed.
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

    const { signatureDataUrl, signedBy } = await req.json();
    const claimId = params.claimId;

    // Get claim to verify it exists and get orgId
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { orgId: true, insured_name: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const signerName = signedBy || claim.insured_name || "Property Owner";
    const signedAt = new Date();

    // Store the signed certificate
    await prisma.$executeRaw`
      INSERT INTO signed_documents (
        "claimId", "orgId", name, type, "signatureDataUrl", 
        "signedBy", "signedAt", "uploadedBy", metadata
      ) VALUES (
        ${claimId}, 
        ${claim.orgId}, 
        ${`Certificate of Completion - Signed by ${signerName}`}, 
        ${"COMPLETION_CERTIFICATE_SIGNED"},
        ${signatureDataUrl || null},
        ${signerName},
        ${signedAt},
        ${userId},
        ${JSON.stringify({
          signedLocally: true,
          downloadedAt: signedAt.toISOString(),
          method: "local_signature_download",
        })}::jsonb
      )
    `;

    // Update claim with signature tracking fields
    await prisma.$executeRaw`
      UPDATE claims 
      SET "certificationSignedAt" = ${signedAt},
          "certificationSignedBy" = ${signerName}
      WHERE id = ${claimId}
    `;

    return NextResponse.json({
      success: true,
      message: "Certificate saved to claim",
      signedAt: signedAt.toISOString(),
      signedBy: signerName,
    });
  } catch (error: any) {
    console.error("[POST /api/claims/[claimId]/final-payout/save-certificate] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save certificate" },
      { status: 500 }
    );
  }
}
