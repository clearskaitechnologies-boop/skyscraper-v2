import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { notifyConnectionDeclined } from "@/lib/services/tradesNotifications";

/**
 * POST /api/trades/decline
 * Contractor declines a connection request
 */

const DeclineConnectionSchema = z.object({
  connectionId: z.string().cuid(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = DeclineConnectionSchema.parse(body);

    // Fetch connection with contractor details
    const connection = await prisma.clientProConnection.findUnique({
      where: { id: data.connectionId },
      include: {
        tradesCompany: true,
        Client: true,
      },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Verify the user is a member of the contractor company
    const membership = await prisma.tradesCompanyMember.findFirst({
      where: {
        companyId: connection.contractorId,
        userId: userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Unauthorized to decline this connection" },
        { status: 403 }
      );
    }

    // Check current status (accept both uppercase and legacy lowercase pending)
    if (connection.status !== "PENDING" && connection.status !== "pending") {
      return NextResponse.json(
        { error: `Connection already ${connection.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Update connection status to declined
    const updatedConnection = await prisma.clientProConnection.update({
      where: { id: data.connectionId },
      data: {
        status: "declined",
        notes: data.reason ? `Declined: ${data.reason}` : connection.notes,
      },
    });

    // Send trades network notification
    try {
      if (connection.Client?.userId) {
        await notifyConnectionDeclined({
          clientClerkId: connection.Client.userId,
          proCompanyName: connection.tradesCompany.name,
          connectionId: connection.id,
        });
      }
    } catch (notifError) {
      console.error("Failed to send trades notification:", notifError);
    }

    return NextResponse.json({
      success: true,
      connection: updatedConnection,
      message: "Connection declined. Client has been notified.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[POST /api/trades/decline] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
