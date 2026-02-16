/**
 * Decline Invitation API
 * Handles declining a connection invitation from a pro
 */

import { NextRequest, NextResponse } from "next/server";

import { isPortalAuthError, requirePortalAuth } from "@/lib/auth/requirePortalAuth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/portal/invitations/[id]/decline
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requirePortalAuth();
    if (isPortalAuthError(authResult)) return authResult;
    const { userId } = authResult;

    const { id } = await params;

    // Verify the client owns this invitation
    const client = await prisma.client.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const connection = await prisma.clientConnection.findFirst({
      where: {
        id,
        clientId: client.id,
        status: "pending",
      },
    });

    if (!connection) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Decline the invitation
    await prisma.clientConnection.update({
      where: { id },
      data: {
        status: "declined",
      },
    });

    // Notify the pro that invitation was declined
    if (connection.invitedBy) {
      await prisma.tradeNotification
        .create({
          data: {
            recipientId: connection.invitedBy,
            type: "connection_declined",
            title: "Connection request declined",
            message: "A client has declined your connection invitation.",
            actionUrl: "/invitations",
          },
        })
        .catch((e: any) => console.error("[decline] Failed to create notification:", e));
    }

    return NextResponse.json({ success: true, message: "Invitation declined" });
  } catch (error: any) {
    console.error("[portal/invitations/decline] Failed:", error);
    return NextResponse.json({ error: "Failed to decline invitation" }, { status: 500 });
  }
}
