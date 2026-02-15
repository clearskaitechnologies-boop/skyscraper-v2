import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * Helper to generate a unique slug for contacts
 */
function generateContactSlug(firstName: string, lastName: string): string {
  const base = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return `${base}-${nanoid(6)}`;
}

/**
 * POST /api/trades/invites/[id]/respond
 * Accept or decline a trade invite/connection request
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accept } = await req.json();
    const inviteId = params.id;

    if (typeof accept !== "boolean") {
      return NextResponse.json(
        { error: "Missing 'accept' boolean in request body" },
        { status: 400 }
      );
    }

    // Find the connection/invite
    const connection = await prisma.clientProConnection.findUnique({
      where: { id: inviteId },
    });

    if (!connection) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Verify the current user is the contractor being invited
    const tradeProfile = await prisma.tradesCompanyMember.findFirst({
      where: {
        OR: [{ userId: userId }, { id: connection.contractorId }],
      },
    });

    if (!tradeProfile || tradeProfile.id !== connection.contractorId) {
      return NextResponse.json(
        { error: "You are not authorized to respond to this invite" },
        { status: 403 }
      );
    }

    // Update the connection status
    const updatedConnection = await prisma.clientProConnection.update({
      where: { id: inviteId },
      data: {
        status: accept ? "accepted" : "declined",
        connectedAt: accept ? new Date() : undefined,
      },
    });

    // Optionally create a notification for the client
    // NOTE: ProjectNotification requires claimId which we don't have here
    // Skipping notification creation for now

    // ──────────────────────────────────────────────────────
    // SYNC TO CONTACTS: Create a contact card when accepting
    // ──────────────────────────────────────────────────────
    if (accept && tradeProfile.orgId) {
      try {
        const client = await prisma.client.findUnique({
          where: { id: connection.clientId },
        });

        if (client) {
          // Check if contact already exists
          const existingContact = await prisma.contacts.findFirst({
            where: {
              orgId: tradeProfile.orgId,
              email: client.email || undefined,
            },
          });

          if (!existingContact) {
            const nameParts = (client.name || "Unknown Client").split(" ");
            const firstName = nameParts[0] || "Unknown";
            const lastName = nameParts.slice(1).join(" ") || "Client";

            await prisma.contacts.create({
              data: {
                id: `contact_${nanoid()}`,
                orgId: tradeProfile.orgId,
                firstName,
                lastName,
                email: client.email || null,
                phone: client.phone || null,
                source: "trades_connection",
                notes: "Client connected via Trades Network invite acceptance",
                tags: ["trades-client"],
                slug: generateContactSlug(firstName, lastName),
                updatedAt: new Date(),
              },
            });
            console.log(`[trades/invites/respond] Created contact for client: ${client.name}`);
          }
        }
      } catch (contactError) {
        console.error("[trades/invites/respond] Error creating contact:", contactError);
        // Non-critical - don't fail the response
      }
    }

    return NextResponse.json({
      ok: true,
      status: accept ? "accepted" : "declined",
      connection: updatedConnection,
    });
  } catch (error: any) {
    console.error("[trades/invites/respond] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to respond to invite" },
      { status: 500 }
    );
  }
}
