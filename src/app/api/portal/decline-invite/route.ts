/**
 * POST /api/portal/decline-invite
 *
 * Client declines a Pro's invitation to connect.
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
    });

    if (!connection) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Verify client owns this connection
    if (connection.clientId !== client.id) {
      return NextResponse.json(
        { error: "You are not authorized to decline this invitation" },
        { status: 403 }
      );
    }

    // Update connection status to declined
    const updatedConnection = await prisma.clientProConnection.update({
      where: { id: connectionId },
      data: {
        status: "declined",
      },
    });

    console.log(`[DeclineInvite] Client ${client.id} declined invite ${connectionId}`);

    return NextResponse.json({
      success: true,
      message: "Invitation declined",
    });
  } catch (error: any) {
    console.error("[DeclineInvite] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to decline invitation" },
      { status: 500 }
    );
  }
}
