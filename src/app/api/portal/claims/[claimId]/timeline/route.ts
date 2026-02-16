// ORG-SCOPE: Scoped by claimId — access verified via ClaimClientLink. Claim belongs to one org. No cross-tenant risk.
import { NextRequest, NextResponse } from "next/server";

import { isPortalAuthError, requirePortalAuth } from "@/lib/auth/requirePortalAuth";
import prisma from "@/lib/prisma";

/**
 * GET /api/portal/claims/[claimId]/timeline
 *
 * Returns the client-visible timeline for a claim.
 * This is the homeowner's view of their claim progress.
 * Requires Clerk auth.
 */
export async function GET(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const authResult = await requirePortalAuth();
    if (isPortalAuthError(authResult)) return authResult;
    const { userId } = authResult;

    const { claimId } = params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!claimId) {
      return NextResponse.json({ error: "Claim ID required" }, { status: 400 });
    }

    // Verify access via ClaimClientLink
    const link = await prisma.claimClientLink.findFirst({
      where: {
        claimId,
        status: { in: ["PENDING", "CONNECTED"] },
      },
      select: {
        claimId: true,
      },
    });

    if (!link || link.claimId !== claimId) {
      return NextResponse.json({ error: "Invalid or expired access" }, { status: 403 });
    }

    // Fetch timeline events (only client-visible ones)
    const events = await prisma.claim_timeline_events.findMany({
      where: {
        claim_id: claimId,
        visible_to_client: true,
      },
      orderBy: {
        occurred_at: "desc",
      },
      select: {
        id: true,
        type: true,
        description: true,
        occurred_at: true,
      },
    });

    // Also get current claim status
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        status: true,
        title: true,
        dateOfLoss: true,
        carrier: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Build a summary with key milestones
    const milestones = buildMilestones(claim, events);

    return NextResponse.json({
      ok: true,
      claim: {
        id: claim.id,
        status: claim.status,
        title: claim.title,
        dateOfLoss: claim.dateOfLoss,
        carrier: claim.carrier,
      },
      timeline: events.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.type,
        description: e.description,
        date: e.occurred_at,
        icon: getIconForType(e.type),
      })),
      milestones,
    });
  } catch (error) {
    console.error("[Portal Timeline] Error:", error);
    return NextResponse.json({ error: "Failed to load timeline" }, { status: 500 });
  }
}

/**
 * Build milestone summary for the claim
 */
function buildMilestones(claim: any, events: any[]) {
  const eventTypes = new Set(events.map((e) => e.type));

  const milestones = [
    {
      id: "claim_filed",
      title: "Claim Filed",
      completed: true,
      date: claim.dateOfLoss,
      description: "Your claim was submitted",
    },
    {
      id: "inspection_scheduled",
      title: "Inspection",
      completed: eventTypes.has("inspection_scheduled") || eventTypes.has("inspection_complete"),
      date: events.find((e) => e.type === "inspection_scheduled")?.createdAt || null,
      description: eventTypes.has("inspection_complete")
        ? "Inspection completed"
        : eventTypes.has("inspection_scheduled")
          ? "Inspection scheduled"
          : "Pending inspection",
    },
    {
      id: "photos_uploaded",
      title: "Photos Documented",
      completed: eventTypes.has("photo_uploaded"),
      date: events.find((e) => e.type === "photo_uploaded")?.createdAt || null,
      description: "Damage photos captured",
    },
    {
      id: "report_generated",
      title: "Report Generated",
      completed: eventTypes.has("document_generated") || eventTypes.has("ai_damage_ran"),
      date:
        events.find((e) => e.type === "document_generated" || e.type === "ai_damage_ran")
          ?.createdAt || null,
      description: "Damage assessment report created",
    },
    {
      id: "estimate_submitted",
      title: "Estimate Submitted",
      completed:
        claim.status === "estimate_submitted" ||
        claim.status === "approved" ||
        claim.status === "completed",
      date: events.find((e) => e.type === "estimate_submitted")?.createdAt || null,
      description: "Repair estimate sent to insurance",
    },
    {
      id: "approval",
      title: "Approval",
      completed: claim.status === "approved" || claim.status === "completed",
      date: events.find((e) => e.type === "claim_approved")?.createdAt || null,
      description: claim.status === "approved" ? "Claim approved" : "Awaiting approval",
    },
  ];

  return milestones;
}

/**
 * Get icon identifier for event type
 */
function getIconForType(type: string): string {
  const iconMap: Record<string, string> = {
    claim_filed: "file-text",
    photo_uploaded: "camera",
    ai_damage_ran: "cpu",
    weather_report_generated: "cloud-rain",
    document_generated: "file-check",
    inspection_scheduled: "calendar",
    inspection_complete: "check-circle",
    estimate_submitted: "send",
    claim_approved: "check-square",
    status_change: "refresh-cw",
    message_sent: "message-circle",
    note_added: "sticky-note",
  };

  return iconMap[type] || "circle";
}
