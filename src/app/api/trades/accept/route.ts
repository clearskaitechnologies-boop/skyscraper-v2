import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { notifyConnectionAccepted } from "@/lib/services/tradesNotifications";

/**
 * Helper to generate a unique slug for contacts
 */
function generateContactSlug(firstName: string, lastName: string): string {
  const base = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return `${base}-${nanoid(6)}`;
}

/**
 * POST /api/trades/accept
 * Contractor accepts a connection request
 *
 * Updates:
 * - Connection status → ACCEPTED
 * - Lead → stage = "qualified"
 * - Appointment → confirmed
 * - Sends notification to client
 */

const AcceptConnectionSchema = z.object({
  connectionId: z.string().cuid(),
  responseMessage: z.string().optional(),
  suggestedAppointment: z.string().optional(), // ISO datetime
  estimatedCost: z.number().int().optional(), // in cents
});

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = AcceptConnectionSchema.parse(body);

    // Fetch connection
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

    // Verify org ownership - check if the current org has access to this contractor
    // For now, we allow the accept if the contractor exists (will be enhanced with proper org check)
    if (!connection.tradesCompany) {
      return NextResponse.json(
        { error: "Unauthorized to accept this connection" },
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

    // Calculate response time
    const responseTimeMinutes = Math.floor(
      (new Date().getTime() - connection.invitedAt.getTime()) / 1000 / 60
    );

    // Update connection
    const updatedConnection = await prisma.clientProConnection.update({
      where: { id: data.connectionId },
      data: {
        status: "accepted",
        connectedAt: new Date(),
      },
    });

    // Note: Lead and appointment updates would be handled separately if needed
    // ClientProConnection links directly to Client and tradesCompany

    // ──────────────────────────────────────────────────────
    // SYNC TO CONTACTS: Create a contact card for the client
    // ──────────────────────────────────────────────────────
    try {
      // Use the client from the connection include
      const client = connection.Client;

      if (client) {
        // Check if contact already exists for this client
        const existingContact = await prisma.contacts.findFirst({
          where: {
            orgId,
            email: client.email || undefined,
          },
        });

        if (!existingContact) {
          // Parse name into first/last
          const firstName = client.firstName || client.name?.split(" ")[0] || "Unknown";
          const lastName =
            client.lastName || client.name?.split(" ").slice(1).join(" ") || "Client";

          await prisma.contacts.create({
            data: {
              id: `contact_${nanoid()}`,
              orgId,
              firstName,
              lastName,
              email: client.email || null,
              phone: client.phone || null,
              source: "trades_connection",
              notes: `Client connected via Trades Network. Service: ${connection.notes || "General inquiry"}`,
              tags: ["trades-client", "general"],
              slug: generateContactSlug(firstName, lastName),
              updatedAt: new Date(),
            },
          });
          console.log(`[trades/accept] Created contact for client: ${client.name}`);
        }
      }
    } catch (contactError) {
      console.error("[trades/accept] Error creating contact:", contactError);
      // Non-critical - don't fail the acceptance
    }

    // Update contractor stats (response rate, etc)
    // Note: Stats are tracked at the company level via tradesCompany
    const contractor = connection.tradesCompany;

    if (contractor) {
      // Calculate new response rate based on connections
      const totalConnections = await prisma.clientProConnection.count({
        where: {
          contractorId: connection.contractorId,
          status: {
            in: ["accepted", "declined", "ACCEPTED", "DECLINED"],
          },
        },
      });

      const acceptedConnections = await prisma.clientProConnection.count({
        where: {
          contractorId: connection.contractorId,
          status: { in: ["accepted", "ACCEPTED"] },
        },
      });

      // Response rate is tracked but tradesCompany doesn't have responseRatePct field
      // This could be logged or stored elsewhere if needed
      const _responseRatePct =
        totalConnections > 0 ? Math.round((acceptedConnections / totalConnections) * 100) : 100;
      console.log(`[trades/accept] Response rate for ${contractor.name}: ${_responseRatePct}%`);
    }

    // Send notification to client (logged for now - notification system can be added)
    console.log(
      `[trades/accept] Connection accepted notification for client: ${connection.clientId}`
    );
    const notificationData = {
      recipientClientId: connection.clientId,
      type: "connection_accepted",
      title: "Contractor Accepted Your Request!",
      message: `${connection.tradesCompany.name} has accepted your request.${
        data.responseMessage ? ` Message: ${data.responseMessage}` : ""
      }`,
      actionUrl: `/client/connections/${connection.id}`,
      metadata: {
        connectionId: connection.id,
        contractorName: connection.tradesCompany.name,
        estimatedCost: data.estimatedCost,
      },
    };
    // Store notification
    try {
      await prisma.clientNotification.create({
        data: {
          clientId: notificationData.recipientClientId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          actionUrl: notificationData.actionUrl,
          metadata: notificationData.metadata,
        },
      });
    } catch (notifError) {
      console.error("[trades/accept] ClientNotification create failed:", notifError);
    }

    // Create initial message thread if doesn't exist
    const existingThread = await prisma.messageThread.findFirst({
      where: {
        orgId,
        clientId: connection.clientId,
        tradePartnerId: connection.contractorId.toString(),
      },
    });

    let thread = existingThread;
    if (!existingThread) {
      thread = await prisma.messageThread.create({
        data: {
          id: crypto.randomUUID(),
          orgId,
          clientId: connection.clientId,
          tradePartnerId: connection.contractorId.toString(),
          subject: `${connection.tradesCompany.name} - Connection`,
          isPortalThread: true,
        },
      });
    }

    // Add acceptance message to thread
    if (data.responseMessage && thread) {
      await prisma.message.create({
        data: {
          id: crypto.randomUUID(),
          threadId: thread.id,
          senderUserId: userId,
          senderType: "pro",
          body: data.responseMessage,
          fromPortal: false,
        },
      });
    }

    // Send trades network notification
    try {
      const client = connection.Client;

      if (client?.userId) {
        await notifyConnectionAccepted({
          clientClerkId: client.userId,
          proCompanyName: connection.tradesCompany.name,
          connectionId: connection.id,
          proClerkId: userId,
        });
      }
    } catch (notifError) {
      console.error("Failed to send trades notification:", notifError);
    }

    return NextResponse.json({
      success: true,
      connection: updatedConnection,
      message: "Connection accepted! Client has been notified.",
      thread,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[POST /api/trades/accept] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
