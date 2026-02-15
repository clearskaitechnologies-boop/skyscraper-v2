/**
 * POST /api/portal/accept-pro-invite
 *
 * Client accepts a Pro's invitation to connect.
 * Creates a ClientWorkRequest (job folder) for the client to track the work.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get client from auth
    const client = await prisma.client.findFirst({
      where: { userId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { connectionId } = body;

    if (!connectionId) {
      return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
    }

    // Find the connection
    const connection = await prisma.clientProConnection.findUnique({
      where: { id: connectionId },
      include: {
        tradesCompany: {
          select: {
            id: true,
            name: true,
            specialties: true,
          },
        },
      },
    });

    if (!connection) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const contractor = connection.tradesCompany;

    // Verify client owns this connection
    if (connection.clientId !== client.id) {
      return NextResponse.json(
        { error: "You are not authorized to accept this invitation" },
        { status: 403 }
      );
    }

    if (connection.status !== "pro_invited" && connection.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `Cannot accept invitation with status: ${connection.status}`,
        },
        { status: 400 }
      );
    }

    // Update connection status
    const updatedConnection = await prisma.clientProConnection.update({
      where: { id: connectionId },
      data: {
        status: "connected",
        connectedAt: new Date(),
      },
    });

    // Create a ClientWorkRequest (job folder) for the client
    const workRequest = await prisma.clientWorkRequest.create({
      data: {
        id: crypto.randomUUID(),
        clientId: client.id,
        targetProId: connection.contractorId,
        title: `Project with ${contractor?.name || "Contractor"}`,
        description:
          connection.notes ||
          `You accepted an invitation from ${contractor?.name || "a contractor"} to collaborate.`,
        category: contractor?.specialties?.[0] || "General",
        urgency: "normal",
        status: "accepted",
      },
    });

    // Create notification for the pro (simplified - would need org lookup in production)
    // For now, skip creating notification as we don't have orgId on tradesCompany

    console.log(
      `[AcceptProInvite] Client ${client.id} accepted invite from ${connection.contractorId}, created job ${workRequest.id}`
    );

    return NextResponse.json({
      success: true,
      connection: updatedConnection,
      jobId: workRequest.id,
      message: `Connected with ${contractor?.name || "contractor"}`,
    });
  } catch (error: any) {
    console.error("[AcceptProInvite] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to accept invitation" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/portal/accept-pro-invite
 *
 * Get list of pending pro invites for the current client
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await prisma.client.findFirst({
      where: { userId },
    });

    if (!client) {
      return NextResponse.json({ invites: [] });
    }

    const invites = await prisma.clientProConnection.findMany({
      where: {
        clientId: client.id,
        status: { in: ["pro_invited", "PENDING"] },
      },
      include: {
        tradesCompany: {
          select: {
            id: true,
            name: true,
            specialties: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
      orderBy: { invitedAt: "desc" },
    });

    return NextResponse.json({
      invites: invites.map((inv) => ({
        id: inv.id,
        contractorId: inv.contractorId,
        contractorName: inv.tradesCompany?.name || "Unknown Company",
        specialties: inv.tradesCompany?.specialties || [],
        averageRating: inv.tradesCompany?.rating,
        reviewCount: inv.tradesCompany?.reviewCount,
        notes: inv.notes,
        invitedAt: inv.invitedAt,
      })),
    });
  } catch (error: any) {
    console.error("[AcceptProInvite GET] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
