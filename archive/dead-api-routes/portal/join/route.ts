/**
 * POST /api/portal/join
 *
 * API endpoint for the join page - handles accept/decline of pro invitations.
 * Creates or updates ClientProConnection records.
 */

import { logger } from "@/lib/logger";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { contractorId, claimId, token, action } = body;

    if (!contractorId) {
      return NextResponse.json({ error: "contractorId is required" }, { status: 400 });
    }

    if (!action || !["accept", "decline"].includes(action)) {
      return NextResponse.json({ error: "action must be 'accept' or 'decline'" }, { status: 400 });
    }

    // Verify the contractor exists
    const contractor = await prisma.tradesCompany.findUnique({
      where: { id: contractorId },
      select: {
        id: true,
        name: true,
        specialties: true,
      },
    });

    if (!contractor) {
      return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
    }

    // Get or create the client profile
    const email = user.emailAddresses?.[0]?.emailAddress;
    let client = await prisma.client.findFirst({
      where: {
        OR: [{ userId }, ...(email ? [{ email }] : [])],
      },
    });

    if (!client) {
      // Auto-create client profile
      const { createId } = await import("@paralleldrive/cuid2");
      const slug = `c-${createId()}`;

      // Find or create self-service org
      let orgId = "self-service-clients";
      try {
        const selfServiceOrg = await prisma.org.findFirst({
          where: { id: "self-service-clients" },
        });

        if (!selfServiceOrg) {
          await prisma.org.create({
            data: {
              id: "self-service-clients",
              name: "Self-Service Clients",
              clerkOrgId: "clerk_self_service_clients",
              updatedAt: new Date(),
            },
          });
        }
      } catch {
        // Org may already exist due to race condition
      }

      client = await prisma.client.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          slug,
          email: email || null,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Client",
          orgId,
          status: "active",
        },
      });
    }

    // Find existing connection
    const existingConnection = await prisma.clientProConnection.findUnique({
      where: {
        clientId_contractorId: {
          clientId: client.id,
          contractorId: contractor.id,
        },
      },
    });

    // Handle DECLINE action
    if (action === "decline") {
      if (existingConnection) {
        await prisma.clientProConnection.update({
          where: { id: existingConnection.id },
          data: {
            status: "declined",
          },
        });
      } else {
        // Create a declined record to prevent re-invites
        await prisma.clientProConnection.create({
          data: {
            id: crypto.randomUUID(),
            clientId: client.id,
            contractorId: contractor.id,
            status: "declined",
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Invitation declined",
      });
    }

    // Handle ACCEPT action
    if (existingConnection?.status === "connected") {
      return NextResponse.json({
        success: true,
        message: "Already connected",
        connectionId: existingConnection.id,
      });
    }

    // Create or update the connection
    const connection = existingConnection
      ? await prisma.clientProConnection.update({
          where: { id: existingConnection.id },
          data: {
            status: "connected",
            connectedAt: new Date(),
          },
        })
      : await prisma.clientProConnection.create({
          data: {
            id: crypto.randomUUID(),
            clientId: client.id,
            contractorId: contractor.id,
            status: "connected",
            connectedAt: new Date(),
          },
        });

    // Create a ClientWorkRequest (job folder) for the client to track this connection
    try {
      await prisma.clientWorkRequest.create({
        data: {
          id: crypto.randomUUID(),
          clientId: client.id,
          targetProId: contractor.id,
          title: `Project with ${contractor.name}`,
          description: `You connected with ${contractor.name} to collaborate on your projects.`,
          category: contractor.specialties?.[0] || "General",
          urgency: "normal",
          status: "accepted",
        },
      });
    } catch (workRequestError) {
      // Non-fatal - log but continue
      logger.error("[JOIN] Failed to create work request:", workRequestError);
    }

    return NextResponse.json({
      success: true,
      message: `Connected with ${contractor.name}`,
      connectionId: connection.id,
      clientSlug: client.slug,
    });
  } catch (error) {
    logger.error("[JOIN] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
