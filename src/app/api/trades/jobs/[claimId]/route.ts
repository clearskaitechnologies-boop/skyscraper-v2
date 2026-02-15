/**
 * /api/trades/jobs/[claimId]
 *
 * Contractor actions on a specific job (claim assignment).
 * Accept jobs, update status, and communicate with PA firm.
 */

import { randomUUID } from "crypto";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { createTimelineEvent } from "@/lib/claims/timeline";
import prisma from "@/lib/prisma";

/**
 * GET /api/trades/jobs/[claimId]
 * Get details of a specific job
 */
export async function GET(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;

    // Find the tradesCompanyMember for this user, then get their company
    const member = await prisma.tradesCompanyMember.findFirst({
      where: { userId },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    const company = member?.company;
    if (!company) {
      return NextResponse.json({ error: "No trades company profile found" }, { status: 404 });
    }

    // Verify this company is assigned to the claim via timeline events
    const assignment = await prisma.claim_timeline_events.findFirst({
      where: {
        claim_id: claimId,
        type: "contractor_assigned",
        metadata: { path: ["companyId"], equals: company.id },
      },
      orderBy: { occurred_at: "desc" },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Not assigned to this claim" }, { status: 403 });
    }

    // Check if unassigned after assignment
    const unassignment = await prisma.claim_timeline_events.findFirst({
      where: {
        claim_id: claimId,
        type: "contractor_unassigned",
        metadata: { path: ["companyId"], equals: company.id },
        occurred_at: { gt: assignment.occurred_at },
      },
    });

    if (unassignment) {
      return NextResponse.json({ error: "You have been removed from this claim" }, { status: 403 });
    }

    // Get current status
    const statusEvent = await prisma.claim_timeline_events.findFirst({
      where: {
        claim_id: claimId,
        type: { in: ["contractor_assigned", "contractor_accepted", "contractor_completed"] },
        metadata: { path: ["companyId"], equals: company.id },
      },
      orderBy: { occurred_at: "desc" },
    });

    // Get claim details (limited info for contractors)
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      include: {
        properties: {
          select: {
            street: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
        Org: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Fetch documents for contractor access via project
    let contractorDocuments: {
      id: string;
      title: string;
      category: string | null;
      url: string;
      createdAt: Date;
    }[] = [];
    if (claim?.projectId) {
      contractorDocuments = await prisma.documents.findMany({
        where: {
          projectId: claim.projectId,
          OR: [{ category: "scope" }, { category: "photos" }, { category: "specifications" }],
        },
        select: {
          id: true,
          title: true,
          category: true,
          url: true,
          createdAt: true,
        },
      });
    }

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const assignmentData = assignment.metadata as Record<string, unknown> | null;
    const currentStatus =
      statusEvent?.type === "contractor_completed"
        ? "completed"
        : statusEvent?.type === "contractor_accepted"
          ? "in_progress"
          : "assigned";

    return NextResponse.json({
      ok: true,
      job: {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        title: claim.title,
        damageType: claim.damageType,
        dateOfLoss: claim.dateOfLoss,
        description: claim.description,
        property: claim.properties,
        paFirm: claim.Org,
        documents: contractorDocuments,
        assignment: {
          status: currentStatus,
          role: (assignmentData?.role as string) || "primary_contractor",
          assignedAt: assignment.occurred_at,
          notes: assignmentData?.notes,
        },
      },
    });
  } catch (error) {
    console.error("[Trades Jobs Detail] Error:", error);
    return NextResponse.json({ error: "Failed to get job details" }, { status: 500 });
  }
}

/**
 * PATCH /api/trades/jobs/[claimId]
 * Update job status (accept, start work, complete)
 *
 * Body:
 *   action: "accept" | "start" | "complete"
 *   notes?: string
 *   estimatedCompletion?: ISO date string
 */
export async function PATCH(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;
    const body = await request.json();
    const { action, notes, estimatedCompletion } = body;

    if (!action || !["accept", "start", "complete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Find the tradesCompanyMember for this user, then get their company
    const member = await prisma.tradesCompanyMember.findFirst({
      where: { userId },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    const company = member?.company;
    if (!company) {
      return NextResponse.json({ error: "No trades company profile found" }, { status: 404 });
    }

    // Verify assignment via timeline events
    const assignment = await prisma.claim_timeline_events.findFirst({
      where: {
        claim_id: claimId,
        type: "contractor_assigned",
        metadata: { path: ["companyId"], equals: company.id },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Not assigned to this claim" }, { status: 403 });
    }

    // Get claim for notifications
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      include: {
        Org: { select: { name: true } },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Determine event type and message
    let eventType: string;
    let timelineTitle: string;
    let timelineBody: string;

    switch (action) {
      case "accept":
        eventType = "contractor_accepted";
        timelineTitle = `${company.name} Accepted Assignment`;
        timelineBody = `${company.name} has accepted this job${estimatedCompletion ? ` and estimates completion by ${new Date(estimatedCompletion).toLocaleDateString()}` : ""}.${notes ? ` Notes: ${notes}` : ""}`;
        break;
      case "start":
        eventType = "contractor_started";
        timelineTitle = `${company.name} Started Work`;
        timelineBody = `${company.name} has started work on this claim.${notes ? ` Notes: ${notes}` : ""}`;
        break;
      case "complete":
        eventType = "contractor_completed";
        timelineTitle = `${company.name} Completed Work`;
        timelineBody = `${company.name} has marked their work as complete.${notes ? ` Notes: ${notes}` : ""}`;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Create status event using claim_timeline_events
    await prisma.claim_timeline_events.create({
      data: {
        id: randomUUID(),
        claim_id: claimId,
        org_id: claim.orgId,
        type: eventType,
        description: timelineBody,
        actor_id: userId,
        visible_to_client: true,
        metadata: {
          companyId: company.id,
          companyName: company.name,
          action,
          notes,
          estimatedCompletion,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Create timeline event for the claim history
    await createTimelineEvent({
      claimId,
      type: eventType,
      title: timelineTitle,
      body: timelineBody,
      visibleToClient: true,
    });

    return NextResponse.json({
      ok: true,
      message: `Job ${action === "accept" ? "accepted" : action === "start" ? "started" : "completed"} successfully`,
      status:
        action === "complete" ? "completed" : action === "accept" ? "in_progress" : "in_progress",
    });
  } catch (error) {
    console.error("[Trades Jobs PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update job status" }, { status: 500 });
  }
}
