/**
 * Accept Trades Connection Request API
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Use the lowercase tradesConnection model which has status field
const tradesConnectionModel = prisma.tradesConnection as any;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the connection
    const connection = await tradesConnectionModel.findUnique({
      where: { id },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Only the addressee can accept
    if (connection.addresseeId !== userId) {
      return NextResponse.json(
        { error: "Only the recipient can accept this request" },
        { status: 403 }
      );
    }

    // Update the connection to accepted
    const updated = await tradesConnectionModel.update({
      where: { id },
      data: {
        status: "accepted",
        connectedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, connection: updated });
  } catch (error) {
    console.error("[trades/connections/accept] Failed:", error);
    return NextResponse.json({ error: "Failed to accept connection" }, { status: 500 });
  }
}
