export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import prisma from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, claimId, documentIds = [] } = body;

    if (!clientId || !claimId) {
      return NextResponse.json(
        {
          error: "Client ID and Claim ID are required",
        },
        { status: 400 }
      );
    }

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
      include: { properties: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get client info for notification (guard against orphaned/deleted contacts)
    const client = await prisma.contacts.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json(
        { error: "Contact not found. The contact may have been deleted." },
        { status: 404 }
      );
    }

    // Create or update client-claim link
    const clientLink = await prisma.claimClientLink.upsert({
      where: {
        claimId_clientEmail: { claimId, clientEmail: clientId },
      },
      create: {
        id: crypto.randomUUID(),
        claimId,
        clientEmail: clientId,
        clientName: client?.firstName
          ? `${client.firstName} ${client.lastName || ""}`.trim()
          : null,
        invitedBy: userId,
        status: "PENDING",
      },
      update: {
        status: "PENDING",
      },
    });

    // Send notification email to client
    if (resend && client?.email) {
      const org = await prisma.org.findUnique({ where: { id: orgId } });
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com"}/portal/claims/${claimId}`;

      await resend.emails.send({
        from: `${org?.name || "SkaiScraper"} <notifications@skaiscrape.com>`,
        to: client.email,
        subject: `You have access to claim ${claim.claimNumber}`,
        html: `
          <h2>Claim Access Granted</h2>
          <p>Hi ${client.firstName || "there"},</p>
          <p>You now have access to view claim <strong>${claim.claimNumber}</strong>.</p>
          <p><strong>Property:</strong> ${claim.title}</p>
          ${documentIds.length > 0 ? `<p><strong>Shared Documents:</strong> ${documentIds.length} document(s)</p>` : ""}
          <p>
            <a href="${portalUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
              View Claim
            </a>
          </p>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Client successfully added to claim with shared documents",
      clientLink,
    });
  } catch (error) {
    logger.error("Error adding client to claim:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get("claimId");

    if (!claimId) {
      return NextResponse.json(
        {
          error: "Claim ID is required",
        },
        { status: 400 }
      );
    }

    // Fetch actual client-claim associations
    const clientLinks = await prisma.claimClientLink.findMany({
      where: { claimId },
    });

    // Map client links to response format
    const clientClaims = clientLinks.map((link) => ({
      id: link.id,
      clientId: link.clientUserId,
      claimId: link.claimId,
      clientName: link.clientName || "Unknown",
      clientEmail: link.clientEmail,
      status: link.status,
      addedAt: link.invitedAt.toISOString(),
      acceptedAt: link.acceptedAt?.toISOString() || null,
    }));

    return NextResponse.json({
      clientClaims,
    });
  } catch (error) {
    logger.error("Error fetching client claims:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
