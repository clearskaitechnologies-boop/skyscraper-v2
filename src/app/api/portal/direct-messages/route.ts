/**
 * Direct Messages API
 * For messaging between connected clients and pros
 *
 * Unlike claim-based messages, these are direct messages within the network
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/portal/direct-messages?connectionId=xxx
 * Fetch messages for a specific connection
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");
    const contractorId = searchParams.get("contractorId");

    // Get client
    const client = await prisma.client.findFirst({
      where: { userId: userId },
    });

    if (!client) {
      return NextResponse.json({ messages: [], error: "Client not found" });
    }

    // Find the connection
    let connection;
    if (connectionId) {
      connection = await prisma.clientProConnection.findUnique({
        where: { id: connectionId },
      });
    } else if (contractorId) {
      connection = await prisma.clientProConnection.findUnique({
        where: {
          clientId_contractorId: {
            clientId: client.id,
            contractorId: contractorId,
          },
        },
      });
    }

    if (!connection) {
      return NextResponse.json({ messages: [], error: "Connection not found" });
    }

    // Verify this client owns this connection
    if (connection.clientId !== client.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch messages for this connection
    // We'll use a convention: threadId = "direct-{connectionId}"
    const threadId = `direct-${connection.id}`;

    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt,
        fromPortal: m.fromPortal,
        senderType: m.senderType,
        senderName: m.fromPortal ? "You" : "Contractor",
      })),
    });
  } catch (error: any) {
    console.error("[DirectMessages GET] Error:", error);
    return NextResponse.json({ messages: [], error: error.message || "Failed to fetch messages" });
  }
}

/**
 * POST /api/portal/direct-messages
 * Send a direct message to a connected pro
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await prisma.client.findFirst({
      where: { userId: userId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    const { contractorId, message, connectionId } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Find or verify connection
    let connection;
    if (connectionId) {
      connection = await prisma.clientProConnection.findUnique({
        where: { id: connectionId },
        include: { tradesCompany: { select: { id: true } } },
      });
    } else if (contractorId) {
      connection = await prisma.clientProConnection.findUnique({
        where: {
          clientId_contractorId: {
            clientId: client.id,
            contractorId: contractorId,
          },
        },
        include: { tradesCompany: { select: { id: true } } },
      });
    }

    if (!connection) {
      // Auto-create connection if inviting
      if (contractorId) {
        const contractor = await prisma.tradesCompany.findUnique({
          where: { id: contractorId },
          select: { id: true },
        });

        if (contractor) {
          connection = await prisma.clientProConnection.create({
            data: {
              id: crypto.randomUUID(),
              clientId: client.id,
              contractorId: contractorId,
              status: "pending",
              invitedAt: new Date(),
              invitedBy: userId,
            },
            include: { tradesCompany: { select: { id: true } } },
          });
        }
      }
    }

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (connection.clientId !== client.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create thread ID for direct messages
    const threadId = `direct-${connection.id}`;

    // Check if thread exists, create if not
    let thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      thread = await prisma.messageThread.create({
        data: {
          id: threadId,
          orgId: connection.tradesCompany.id,
          subject: `Direct - ${client.name || "Client"}`,
          isPortalThread: true,
        },
      });
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        id: uuidv4(),
        threadId: threadId,
        body: message.trim(),
        fromPortal: true,
        senderUserId: userId,
        senderType: "client",
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        body: newMessage.body,
        createdAt: newMessage.createdAt,
        fromPortal: true,
      },
    });
  } catch (error: any) {
    console.error("[DirectMessages POST] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
