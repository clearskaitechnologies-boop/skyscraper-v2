import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/portal/claims/[claimId]/events
 * Fetch timeline events for client portal (only client-visible events)
 * Requires valid portal access token or Clerk auth
 */
export async function GET(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const claimId = params.claimId;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    // Verify client has access to this claim
    const accessQuery: any = { claimId };
    if (email) {
      accessQuery.email = email;
    }

    const access = await prisma.client_access.findFirst({
      where: accessQuery,
    });

    if (!access) {
      // Also check ClaimClientLink as fallback
      const link = await prisma.claimClientLink.findFirst({
        where: {
          claimId,
          status: { in: ["PENDING", "CONNECTED"] },
        },
      });

      if (!link) {
        return NextResponse.json(
          { error: "Unauthorized — no access to this claim" },
          { status: 403 }
        );
      }
    }

    // Fetch only client-visible ClaimEvents
    const events = await prisma.claim_timeline_events.findMany({
      where: {
        claim_id: claimId,
        visible_to_client: true, // Only show events marked as client-visible
      },
      orderBy: { occurred_at: "desc" },
      take: 50,
    });

    // Format events for frontend
    const formattedEvents = events.map((event) => ({
      id: event.id,
      type: event.type,
      metadata: event.metadata || {},
      actorName: event.actor_type || "System",
      createdAt: event.occurred_at.toISOString(),
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error("Error fetching client portal events:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
