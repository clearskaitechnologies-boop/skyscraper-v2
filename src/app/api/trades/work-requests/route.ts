/**
 * GET /api/trades/work-requests
 *
 * Fetches ClientWorkRequests targeted at the current user's trades company.
 * Used by the pro dashboard to see job invitations from clients.
 */

import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

function generateContactSlug(firstName: string, lastName: string): string {
  const base = `${firstName}-${lastName}`.toLowerCase().replace(/\s+/g, "-");
  return `${base}-${nanoid(6)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the trades company for this user's member profile
    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    const tradesCompany = member?.companyId
      ? await prisma.tradesCompany.findUnique({
          where: { id: member.companyId },
          select: { id: true, name: true },
        })
      : null;

    if (!tradesCompany) {
      return NextResponse.json({
        workRequests: [],
        message: "No trades company found for this org",
      });
    }

    // Fetch work requests targeted at this company
    const workRequests = await prisma.clientWorkRequest.findMany({
      where: {
        targetProId: tradesCompany.id,
      },
      include: {
        Client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Check connection status for each client (for privacy controls)
    const clientIds = [...new Set(workRequests.map((wr) => wr.clientId))];
    const connections = await prisma.clientProConnection.findMany({
      where: {
        contractorId: tradesCompany.id,
        clientId: { in: clientIds },
        status: "connected",
      },
      select: { clientId: true },
    });
    const connectedClientIds = new Set(connections.map((c) => c.clientId));

    return NextResponse.json({
      workRequests: workRequests.map((wr) => {
        const isConnected = connectedClientIds.has(wr.clientId);
        return {
          id: wr.id,
          title: wr.title,
          description: wr.description,
          category: wr.category,
          urgency: wr.urgency,
          status: wr.status,
          preferredDate: wr.preferredDate,
          // PRIVACY: Only show address if connected
          propertyAddress: isConnected ? wr.propertyAddress : null,
          createdAt: wr.createdAt,
          isConnected,
          Client: {
            id: wr.Client?.id,
            name: wr.Client?.name || "Anonymous",
            avatarUrl: wr.Client?.avatarUrl,
            // PRIVACY: Only show contact info if connected
            email: isConnected ? wr.Client?.email : null,
            phone: isConnected ? wr.Client?.phone : null,
            address: isConnected ? wr.Client?.address : null,
          },
        };
      }),
    });
  } catch (error: any) {
    console.error("[WorkRequests] Error:", error);

    // If table doesn't exist, return empty
    if (error.code === "P2021") {
      return NextResponse.json({
        workRequests: [],
        message: "Work requests table not yet created",
      });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch work requests" },
      { status: 500 }
    );
  }
}

// Update a work request status
export async function PATCH(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the trades company for this user's member profile
    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    const tradesCompany = member?.companyId
      ? await prisma.tradesCompany.findUnique({
          where: { id: member.companyId },
          select: { id: true },
        })
      : null;

    const body = await req.json();
    const { requestId, status, convertTo } = body;

    if (!requestId || !status) {
      return NextResponse.json({ error: "Request ID and status are required" }, { status: 400 });
    }

    // Get the work request to find client with full details
    const workRequest = await prisma.clientWorkRequest.findUnique({
      where: { id: requestId },
      include: {
        Client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    // Update the work request
    const updated = await prisma.clientWorkRequest.update({
      where: { id: requestId },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    // If status is "accepted", connect client and pro + create Lead
    if (status === "accepted" && workRequest && tradesCompany) {
      // 1. Upsert ClientProConnection
      await prisma.clientProConnection.upsert({
        where: {
          clientId_contractorId: {
            clientId: workRequest.clientId,
            contractorId: tradesCompany.id,
          },
        },
        create: {
          id: crypto.randomUUID(),
          clientId: workRequest.clientId,
          contractorId: tradesCompany.id,
          status: "connected",
          invitedAt: new Date(),
          connectedAt: new Date(),
          invitedBy: userId,
        },
        update: {
          status: "connected",
          connectedAt: new Date(),
        },
      });

      // 2. Create or find contact for the client
      let contactId: string | null = null;
      if (workRequest.Client) {
        const client = workRequest.Client;

        // Check if contact already exists
        let contact = await prisma.contacts.findFirst({
          where: {
            orgId,
            OR: [{ email: client.email || undefined }].filter((c) => c.email),
          },
        });

        if (!contact) {
          const nameParts = (client.name || "Unknown Client").split(" ");
          const firstName = nameParts[0] || "Unknown";
          const lastName = nameParts.slice(1).join(" ") || "Client";

          contact = await prisma.contacts.create({
            data: {
              id: `contact_${nanoid()}`,
              orgId,
              firstName,
              lastName,
              email: client.email || null,
              phone: client.phone || null,
              street: client.address || null,
              source: "client_work_request",
              notes: `Client submitted work request: ${workRequest.title}`,
              tags: ["trades-client", workRequest.category].filter(Boolean),
              slug: generateContactSlug(firstName, lastName),
              updatedAt: new Date(),
            },
          });
          console.log(`[WorkRequests PATCH] Created contact for client: ${client.name}`);
        }
        contactId = contact.id;
      }

      // 3. Create Lead in CRM
      if (contactId) {
        const leadId = `lead_${nanoid()}`;
        await prisma.leads.create({
          data: {
            id: leadId,
            orgId,
            contactId,
            title: workRequest.title,
            description:
              workRequest.description ||
              `Work request from client: ${workRequest.Client?.name || "Unknown"}`,
            source: "client_work_request",
            stage: "qualified",
            temperature: "hot",
            jobCategory: "lead",
            clientId: workRequest.clientId,
            createdBy: userId,
            updatedAt: new Date(),
          },
        });
        console.log(`[WorkRequests PATCH] Created lead ${leadId} for work request ${requestId}`);
      }

      // 4. Notify the client that their work request was accepted
      try {
        if (workRequest.Client) {
          // Find the client's Clerk userId to send notification
          const clientRecord = await prisma.client.findUnique({
            where: { id: workRequest.clientId },
            select: { userId: true },
          });

          if (clientRecord?.userId) {
            // Find the pro's company name for the notification
            const proCompany = await prisma.tradesCompany.findUnique({
              where: { id: tradesCompany.id },
              select: { name: true },
            });

            await prisma.tradeNotification.create({
              data: {
                recipientId: clientRecord.userId,
                type: "work_request_accepted",
                title: "Work Request Accepted! 🎉",
                message: `${proCompany?.name || "A contractor"} accepted your work request: ${workRequest.title}. Check your Shared Jobs to track progress.`,
                actionUrl: "/portal/my-jobs",
                metadata: {
                  workRequestId: workRequest.id,
                  contractorName: proCompany?.name,
                  category: workRequest.category,
                },
              },
            });
            console.log(
              `[WorkRequests PATCH] Notified client ${clientRecord.userId} of acceptance`
            );
          }
        }
      } catch (notifErr) {
        console.warn("[WorkRequests PATCH] Failed to notify client:", notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      workRequest: updated,
      message: `Status updated to ${status}`,
    });
  } catch (error: any) {
    console.error("[WorkRequests PATCH] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update work request" },
      { status: 500 }
    );
  }
}
