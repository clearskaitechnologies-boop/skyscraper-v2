import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { sendEmail, TEMPLATES } from "@/lib/email/resend";
import prisma from "@/lib/prisma";
import { verifyProClaimAccess } from "@/lib/security";

/**
 * POST /api/claims/[claimId]/invite-client
 * Pro invites a client by email to connect to a claim
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ claimId: string }> }) {
  try {
    const { userId } = await auth();
    const { claimId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Security: Verify Pro has access to this claim
    const hasAccess = await verifyProClaimAccess(userId, claimId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { clientEmail, clientName } = body;

    if (!clientEmail) {
      return NextResponse.json({ error: "Client email is required" }, { status: 400 });
    }

    // Check if invite already exists
    const existing = await prisma.claimClientLink.findUnique({
      where: {
        claimId_clientEmail: {
          claimId,
          clientEmail,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Client already invited to this claim" }, { status: 409 });
    }

    // Create the invite
    const link = await prisma.claimClientLink.create({
      data: {
        id: crypto.randomUUID(),
        claimId,
        clientEmail,
        clientName,
        clientUserId: "", // Will be filled when client accepts
        status: "PENDING",
        invitedBy: userId,
      },
    });

    // Get org branding for email
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { orgId: true },
    });

    let companyName = "SkaiScraper";
    if (claim?.orgId) {
      const branding = await prisma.org_branding.findFirst({
        where: { orgId: claim.orgId },
        select: { companyName: true },
      });
      if (branding?.companyName) {
        companyName = branding.companyName;
      }
    }

    // Send invitation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com";
    const magicLink = `${appUrl}/client/accept-invite?token=${link.id}`;

    try {
      await sendEmail({
        to: clientEmail,
        subject: TEMPLATES.CLIENT_INVITE.subject,
        html: TEMPLATES.CLIENT_INVITE.getHtml({
          clientName: clientName || "Valued Client",
          magicLink,
          companyName,
        }),
      });
      console.log(`[INVITE_CLIENT] Email sent to ${clientEmail}`);
    } catch (emailError) {
      console.error("[INVITE_CLIENT] Failed to send email:", emailError);
      // Don't fail the request - invite was created, email can be resent
    }

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        clientEmail: link.clientEmail,
        status: link.status,
        invitedAt: link.invitedAt,
      },
      emailSent: true,
    });
  } catch (error) {
    console.error("[INVITE_CLIENT_ERROR]", error);
    return NextResponse.json({ error: "Failed to invite client" }, { status: 500 });
  }
}
