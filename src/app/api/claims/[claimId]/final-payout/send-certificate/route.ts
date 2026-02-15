/**
 * Send Certificate for Signature API
 * POST /api/claims/[claimId]/final-payout/send-certificate
 *
 * Sends the Certificate of Completion to the client via messaging
 * for remote signature. Creates a signing link and message thread.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claimId = params.claimId;

    // Get the claim with client info
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        orgId: true,
        claimNumber: true,
        insured_name: true,
        homeownerEmail: true,
        homeowner_email: true,
        propertyId: true,
        clientId: true,
        properties: {
          select: {
            street: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const clientEmail = claim.homeownerEmail || claim.homeowner_email;
    if (!clientEmail) {
      return NextResponse.json(
        { error: "No client email on file. Please add homeowner email to send." },
        { status: 400 }
      );
    }

    // Get the user info (users model has 'name' not 'firstName'/'lastName')
    const user = await prisma.users.findFirst({
      where: { clerkUserId: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create a signing token for the certificate
    const signingToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    // Store the signing request
    await prisma.$executeRaw`
      INSERT INTO signed_documents (
        "claimId", "orgId", name, type, "signedBy", "uploadedBy", metadata
      ) VALUES (
        ${claimId}, 
        ${claim.orgId}, 
        ${`Certificate of Completion - Pending Signature`}, 
        ${"COMPLETION_CERTIFICATE_PENDING"},
        ${claim.insured_name || "Property Owner"},
        ${userId},
        ${JSON.stringify({
          signingToken,
          sentTo: clientEmail,
          sentAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          status: "pending",
        })}::jsonb
      )
    `;

    // Build the signing URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com";
    const signingUrl = `${baseUrl}/sign/certificate/${signingToken}`;

    // Create or find existing message thread with this client
    let thread = await prisma.messageThread.findFirst({
      where: {
        claimId,
        orgId: claim.orgId,
      },
    });

    if (!thread) {
      // Create new thread
      thread = await prisma.messageThread.create({
        data: {
          id: uuidv4(),
          orgId: claim.orgId,
          claimId,
          clientId: claim.clientId || null,
          subject: `Certificate of Completion - Claim #${claim.claimNumber}`,
        },
      });
    }

    // Send the message with signing link
    const propertyAddress = claim.properties
      ? `${claim.properties.street}, ${claim.properties.city}, ${claim.properties.state} ${claim.properties.zipCode}`
      : "your property";

    const messageBody = `Hello ${claim.insured_name || "Homeowner"},

Your Certificate of Completion for Claim #${claim.claimNumber} is ready for signature.

**Property:** ${propertyAddress}

Please review and sign the certificate by clicking the link below:

🔗 **[Sign Certificate](${signingUrl})**

This link will expire in 7 days. Once signed, the certificate will be automatically saved to your claim file for insurance submission.

If you have any questions about the repairs or this certificate, please reply to this message.

Thank you for choosing us for your restoration project!

Best regards,
${user.name?.split(" ")[0] || ""} ${user.name?.split(" ").slice(1).join(" ") || ""}`.trim();

    await prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        threadId: thread.id,
        senderUserId: user.id,
        senderType: "pro",
        body: messageBody,
      },
    });

    // Update thread timestamp
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: `Certificate sent to ${clientEmail}`,
      signingUrl,
      threadId: thread.id,
    });
  } catch (error: any) {
    console.error("[POST /api/claims/[claimId]/final-payout/send-certificate] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send certificate" },
      { status: 500 }
    );
  }
}
