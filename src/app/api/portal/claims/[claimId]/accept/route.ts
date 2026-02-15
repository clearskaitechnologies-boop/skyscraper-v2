import { NextRequest, NextResponse } from "next/server";

import { createTimelineEvent } from "@/lib/claims/timeline";
import prisma from "@/lib/prisma";

/**
 * POST /api/portal/claims/[claimId]/accept
 *
 * Homeowner accepts/confirms a proposal, estimate, or completion.
 * Creates a record of their acceptance with timestamp and IP.
 *
 * Body:
 *   token: Portal access token (required)
 *   acceptanceType: "proposal" | "estimate" | "completion" | "terms"
 *   notes?: Optional notes from homeowner
 *   signatureData?: Base64 signature if applicable
 */
export async function POST(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { claimId } = params;
    const body = await request.json();
    const { token, acceptanceType, notes, signatureData } = body;

    if (!claimId) {
      return NextResponse.json({ error: "Claim ID required" }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: "Access token required" }, { status: 401 });
    }

    if (!acceptanceType) {
      return NextResponse.json({ error: "acceptanceType is required" }, { status: 400 });
    }

    const validTypes = ["proposal", "estimate", "completion", "terms"];
    if (!validTypes.includes(acceptanceType)) {
      return NextResponse.json(
        { error: `acceptanceType must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify access via client link
    const link = await prisma.claimClientLink.findFirst({
      where: {
        claimId,
        status: { in: ["PENDING", "CONNECTED"] },
      },
      select: {
        claimId: true,
        clientEmail: true,
        clientName: true,
      },
    });

    if (!link || link.claimId !== claimId) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    // Get IP for audit trail
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0] || realIp || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Get claim details
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        orgId: true,
        claimNumber: true,
        title: true,
        status: true,
        Org: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Create acceptance record in claim_timeline_events
    const acceptanceId = `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await prisma.claim_timeline_events.create({
      data: {
        id: acceptanceId,
        claim_id: claimId,
        org_id: claim.orgId,
        type: `client_${acceptanceType}_accepted`,
        description: JSON.stringify({
          acceptanceType,
          acceptedBy: link.clientName || link.clientEmail || "Homeowner",
          acceptedByEmail: link.clientEmail,
          acceptedAt: new Date().toISOString(),
          clientIp,
          userAgent,
          notes: notes || null,
          hasSignature: !!signatureData,
        }),
        visible_to_client: true,
      },
    });

    // If signature provided, store it
    if (signatureData) {
      try {
        await prisma.signatureEnvelope.create({
          data: {
            id: crypto.randomUUID(),
            claimId,
            documentName: `${acceptanceType}_acceptance`,
            status: "signed",
            signerEmail: link.clientEmail || "unknown@email.com",
            signerName: link.clientName || "Homeowner",
            signerRole: "client",
            signedAt: new Date(),
            metadata: { signatureData },
          },
        });
      } catch (e) {
        console.error("[Portal Accept] Failed to store signature:", e);
        // Continue even if signature storage fails
      }
    }

    // Create timeline event
    const eventTitle = getAcceptanceTitle(acceptanceType);
    await createTimelineEvent({
      claimId,
      type: `client_${acceptanceType}_accepted`,
      title: eventTitle,
      body: notes
        ? `${link.clientName || "Homeowner"} accepted with notes: ${notes}`
        : `${link.clientName || "Homeowner"} has confirmed their acceptance.`,
      visibleToClient: true,
    });

    // Update claim status if applicable
    if (acceptanceType === "proposal") {
      await prisma.claims.update({
        where: { id: claimId },
        data: {
          status: "proposal_accepted",
          updatedAt: new Date(),
        },
      });
    } else if (acceptanceType === "completion") {
      await prisma.claims.update({
        where: { id: claimId },
        data: {
          status: "completed",
          updatedAt: new Date(),
        },
      });
    }

    // Log notification to trades team
    try {
      await prisma.tradeNotification.create({
        data: {
          recipientId: claim.orgId,
          type: "claim_accepted",
          title: eventTitle,
          message: `Client accepted ${acceptanceType} for claim ${claim.claimNumber || claim.title}`,
          actionUrl: `/claims/${claimId}`,
          metadata: { claimId, acceptanceType, acceptanceId },
        },
      });
    } catch (notifError) {
      console.error("[Portal Accept] TradeNotification create failed:", notifError);
    }

    return NextResponse.json({
      ok: true,
      acceptanceId,
      message: `Thank you! Your ${acceptanceType} has been recorded.`,
      acceptedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Portal Accept] Error:", error);
    return NextResponse.json({ error: "Failed to record acceptance" }, { status: 500 });
  }
}

function getAcceptanceTitle(type: string): string {
  const titles: Record<string, string> = {
    proposal: "Proposal Accepted by Homeowner",
    estimate: "Estimate Approved by Homeowner",
    completion: "Work Completion Confirmed",
    terms: "Terms & Conditions Accepted",
  };
  return titles[type] || "Client Acceptance Recorded";
}

/**
 * GET /api/portal/claims/[claimId]/accept
 *
 * Check acceptance status for a claim
 */
export async function GET(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { claimId } = params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Access token required" }, { status: 401 });
    }

    // Verify access via client link
    const link = await prisma.claimClientLink.findFirst({
      where: {
        claimId,
        status: { in: ["PENDING", "CONNECTED"] },
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Invalid access" }, { status: 403 });
    }

    // Get all acceptance events from timeline
    const acceptances = await prisma.claim_timeline_events.findMany({
      where: {
        claim_id: claimId,
        type: {
          startsWith: "client_",
          endsWith: "_accepted",
        },
      },
      orderBy: { occurred_at: "desc" },
      select: {
        id: true,
        type: true,
        description: true,
        occurred_at: true,
      },
    });

    return NextResponse.json({
      ok: true,
      acceptances: acceptances.map((a) => ({
        id: a.id,
        type: (a.type as string).replace("client_", "").replace("_accepted", ""),
        acceptedAt: a.occurred_at,
        data: a.description ? JSON.parse(a.description) : null,
      })),
    });
  } catch (error) {
    console.error("[Portal Accept GET] Error:", error);
    return NextResponse.json({ error: "Failed to get acceptance status" }, { status: 500 });
  }
}
