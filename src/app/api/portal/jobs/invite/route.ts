/**
 * POST /api/portal/jobs/invite
 *
 * Client creates a job request and invites a pro to it.
 * Creates a ClientWorkRequest which will appear in the pro's leads.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { notifyConnectionRequest } from "@/lib/services/tradesNotifications";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get client from auth - using userId (Clerk userId stored in Client model)
    const client = await prisma.client.findFirst({
      where: { userId: userId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { companyId, title, description, urgency, tradeType } = body;

    if (!companyId || !title) {
      return NextResponse.json({ error: "Company ID and job title are required" }, { status: 400 });
    }

    // Look up the trades company with owner member for notifications
    const tradesCompany = await prisma.tradesCompany.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        members: {
          where: { isOwner: true },
          select: { userId: true },
          take: 1,
        },
      },
    });

    if (!tradesCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get owner's userId for notifications
    const ownerUserId = tradesCompany.members[0]?.userId;

    // Create a ClientWorkRequest (job invitation to specific pro)
    const workRequest = await prisma.clientWorkRequest.create({
      data: {
        id: crypto.randomUUID(),
        clientId: client.id,
        targetProId: companyId,
        title: title,
        description: description || "",
        category: tradeType || "General",
        urgency: urgency || "normal",
        status: "pending",
      },
    });

    // Create or update a network connection (pending until pro accepts)
    const connection = await prisma.clientProConnection.upsert({
      where: {
        clientId_contractorId: {
          clientId: client.id,
          contractorId: companyId,
        },
      },
      create: {
        id: crypto.randomUUID(),
        clientId: client.id,
        contractorId: companyId,
        status: "pending",
        invitedAt: new Date(),
        invitedBy: userId,
      },
      update: {
        // Don't overwrite connected status
        invitedAt: new Date(),
      },
    });

    // Build client name for notification
    const clientName =
      client.name || `${client.firstName || ""} ${client.lastName || ""}`.trim() || "A client";

    // Create notification for the pro if they have an owner user
    if (ownerUserId) {
      try {
        await notifyConnectionRequest({
          proClerkId: ownerUserId,
          clientName,
          serviceType: tradeType || title,
          connectionId: connection.id,
        });
        console.log(`[JobInvite] Created notification for pro ${ownerUserId}`);
      } catch (notifyError) {
        // Don't fail the request if notification fails
        console.error("[JobInvite] Failed to create notification:", notifyError);
      }
    }

    console.log(
      `[JobInvite] Created work request ${workRequest.id} for client ${client.id} → company ${companyId}`
    );

    return NextResponse.json({
      success: true,
      requestId: workRequest.id,
      message: `Invitation sent to ${tradesCompany.name}`,
    });
  } catch (error: any) {
    console.error("[JobInvite] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create job invitation" },
      { status: 500 }
    );
  }
}
