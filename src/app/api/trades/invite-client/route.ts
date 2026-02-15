/**
 * POST /api/trades/invite-client
 *
 * Pro invites a client to collaborate on a job.
 * Creates a ClientProConnection with status "pro_invited"
 * When client accepts, a job folder is created in their portal.
 */

import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the trades company for this user via membership
    const member = await prisma.tradesCompanyMember.findFirst({
      where: { userId },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    const tradesCompany = member?.company;

    if (!tradesCompany) {
      return NextResponse.json(
        { error: "No trades company found for your organization" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { clientId, clientEmail, clientName, serviceType, jobTitle, jobDescription, leadId } =
      body;

    // Either clientId (existing client) or clientEmail (new invite)
    if (!clientId && !clientEmail) {
      return NextResponse.json(
        { error: "Either clientId or clientEmail is required" },
        { status: 400 }
      );
    }

    let targetClientId = clientId;

    // If clientEmail provided, find or create a client
    if (!targetClientId && clientEmail) {
      // Check if client exists with this email
      let client = await prisma.client.findFirst({
        where: { email: clientEmail },
      });

      if (!client) {
        // Create a new client record (they'll activate when they sign up)
        const slug = `client-${nanoid(8)}`;
        const nameParts = (clientName || "").split(" ");

        client = await prisma.client.create({
          data: {
            id: crypto.randomUUID(),
            orgId,
            slug,
            email: clientEmail,
            name: clientName || null,
            firstName: nameParts[0] || null,
            lastName: nameParts.slice(1).join(" ") || null,
            status: "invited",
          },
        });
        console.log(`[InviteClient] Created new client ${client.id} for email ${clientEmail}`);
      }

      targetClientId = client.id;
    }

    if (!targetClientId) {
      return NextResponse.json({ error: "Could not resolve client" }, { status: 400 });
    }

    // Check if connection already exists
    const existingConnection = await prisma.clientProConnection.findFirst({
      where: {
        clientId: targetClientId,
        contractorId: tradesCompany.id,
      },
    });

    if (existingConnection?.status === "connected" || existingConnection?.status === "ACCEPTED") {
      return NextResponse.json({
        success: true,
        alreadyConnected: true,
        connectionId: existingConnection.id,
        message: "Already connected with this client",
      });
    }

    // Create or update the connection
    const connection = await prisma.clientProConnection.upsert({
      where: {
        clientId_contractorId: {
          clientId: targetClientId,
          contractorId: tradesCompany.id,
        },
      },
      create: {
        id: crypto.randomUUID(),
        clientId: targetClientId,
        contractorId: tradesCompany.id,
        status: "pro_invited",
        invitedAt: new Date(),
        invitedBy: userId,
        notes: [serviceType || jobTitle, jobDescription].filter(Boolean).join(" - ") || null,
      },
      update: {
        status: "pro_invited",
        invitedAt: new Date(),
        invitedBy: userId,
        notes: [serviceType || jobTitle, jobDescription].filter(Boolean).join(" - ") || undefined,
      },
    });

    // Note: Client will see the invite in their portal invites list

    // If leadId provided, link the connection to the lead
    if (leadId) {
      try {
        await prisma.leads.update({
          where: { id: leadId },
          data: { clientId: targetClientId },
        });
        console.log(`[InviteClient] Linked lead ${leadId} to client ${targetClientId}`);
      } catch (e) {
        console.warn("[InviteClient] Could not link lead:", e);
      }
    }

    console.log(
      `[InviteClient] Pro ${tradesCompany.name} invited client ${targetClientId} (connection: ${connection.id})`
    );

    return NextResponse.json({
      success: true,
      connectionId: connection.id,
      message: `Invitation sent to client`,
    });
  } catch (error: any) {
    console.error("[InviteClient] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to invite client" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trades/invite-client
 *
 * Get list of pending client invites (pro_invited status)
 */
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.tradesCompanyMember.findFirst({
      where: { userId },
      include: {
        company: {
          select: { id: true },
        },
      },
    });

    const tradesCompany = member?.company;
    if (!tradesCompany) {
      return NextResponse.json({ invites: [] });
    }

    const invites = await prisma.clientProConnection.findMany({
      where: {
        contractorId: tradesCompany.id,
        status: "pro_invited",
      },
      include: {
        Client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { invitedAt: "desc" },
    });

    return NextResponse.json({
      invites: invites.map((inv) => ({
        id: inv.id,
        clientId: inv.clientId,
        clientName: inv.Client?.name || inv.Client?.email || "Unknown",
        clientEmail: inv.Client?.email,
        notes: inv.notes,
        invitedAt: inv.invitedAt,
        status: inv.status,
      })),
    });
  } catch (error: any) {
    console.error("[InviteClient GET] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
