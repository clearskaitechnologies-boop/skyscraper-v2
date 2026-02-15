import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const revokeSchema = z.object({
  connectionId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = revokeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { connectionId } = validation.data;

    // Get user
    const user = await prisma.users.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Verify user owns this connection
    const connection = await prisma.clientProConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json({ ok: false, error: "Connection not found" }, { status: 404 });
    }

    if (connection.clientId !== user.id) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.clientProConnection.update({
      where: { id: connectionId },
      data: { status: "REVOKED" },
    });

    return NextResponse.json({ ok: true, connection: updated });
  } catch (error) {
    console.error("POST /api/connections/revoke error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
