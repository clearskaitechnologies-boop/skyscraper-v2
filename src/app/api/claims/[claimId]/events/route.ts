import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/claims/[claimId]/events
 * Fetch timeline events for a claim (internal view - includes all events)
 */
export async function GET(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claimId = params.claimId;

    // Verify claim exists and user has access
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { id: true, orgId: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Fetch all ClaimEvents (Pro view sees everything, including internal events)
    const events = await prisma.claim_timeline_events.findMany({
      where: { claim_id: claimId },
      orderBy: { occurred_at: "desc" },
      take: 50,
    });

    // Format events for frontend
    const formattedEvents = events.map((event) => ({
      id: event.id,
      type: event.type,
      metadata: event.metadata || {},
      visibility: event.visible_to_client ? "client" : "internal",
      actorName: event.actor_id || "System",
      createdAt: event.occurred_at.toISOString(),
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error("Error fetching claim events:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
