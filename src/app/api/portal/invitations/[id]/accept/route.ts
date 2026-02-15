/**
 * Accept Invitation API
 * Handles accepting a connection invitation from a pro
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/portal/invitations/[id]/accept
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Accept the invitation
    const updated = await prisma.clientConnection.update({
      where: { id },
      data: {
        status: "connected",
        connectedAt: new Date(),
      },
    });

    // Fetch client info for notification
    const clientRecord = await prisma.client
      .findUnique({
        where: { id: connection.clientId },
        select: { firstName: true, lastName: true, name: true },
      })
      .catch(() => null);

    // Notify the pro who sent the invitation
    if (connection.invitedBy) {
      const clientName =
        [clientRecord?.firstName, clientRecord?.lastName].filter(Boolean).join(" ") ||
        clientRecord?.name ||
        "A client";
      await prisma.tradeNotification
        .create({
          data: {
            recipientId: connection.invitedBy,
            type: "connection_accepted",
            title: `🤝 ${clientName} accepted your connection!`,
            message: `${clientName} is now connected with you. You can start messaging.`,
            actionUrl: "/invitations",
          },
        })
        .catch((e: any) => console.error("[accept] Failed to create notification:", e));
    }

    return NextResponse.json({ success: true, message: "Connection accepted" });
  } catch (error: any) {
    console.error("[portal/invitations/accept] Failed:", error);
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
  }
}
