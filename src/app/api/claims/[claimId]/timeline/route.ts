// src/app/api/claims/[id]/timeline/route.ts
// API endpoint for creating timeline events

import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const claimId = params.id;

  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;

    // Verify claim access
    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) return accessResult;

    const body = await req.json();
    const { title, description, eventType, metadata } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const timelineEvent = await prisma.claim_timeline_events.create({
      data: {
        id: crypto.randomUUID(),
        claim_id: claimId,
        org_id: orgId,
        type: eventType || "update",
        description: title + (description ? `: ${description}` : ""),
        actor_id: userId,
        actor_type: "user",
        metadata: metadata || null,
        visible_to_client: false,
        occurred_at: new Date(),
      },
    });

    console.log("[TIMELINE_CREATE] Success:", {
      claimId,
      eventId: timelineEvent.id,
      title,
    });

    return NextResponse.json({
      success: true,
      event: timelineEvent,
    });
  } catch (error: any) {
    console.error("[TIMELINE_CREATE_ERROR]", {
      claimId,
      error: error.message,
    });

    return new NextResponse("Failed to create timeline event", { status: 500 });
  }
}

// GET endpoint to fetch timeline for a claim
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const claimId = params.id;

  try {
    const orgCtx = await safeOrgContext();

    if (!orgCtx?.orgId) {
      return new NextResponse("No org context", { status: 403 });
    }

    // Verify claim belongs to user's org
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        orgId: orgCtx.orgId,
      },
      select: { id: true },
    });

    if (!claim) {
      return new NextResponse("Claim not found or access denied", { status: 404 });
    }

    const timeline = await prisma.claim_timeline_events.findMany({
      where: { claim_id: claimId },
      orderBy: { occurred_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      timeline,
    });
  } catch (error: any) {
    console.error("[TIMELINE_GET_ERROR]", {
      claimId,
      error: error.message,
    });

    return new NextResponse("Failed to fetch timeline", { status: 500 });
  }
}
