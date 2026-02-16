import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { notifyConnectionDeclined } from "@/lib/services/tradesNotifications";

const declineSchema = z.object({
  connectionId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = declineSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { connectionId } = validation.data;

    // Verify the caller is a member of the contractor company
    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!member?.companyId) {
      return NextResponse.json(
        { ok: false, error: "You are not associated with a trades company" },
        { status: 403 }
      );
    }

    const connection = await prisma.clientProConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json({ ok: false, error: "Connection not found" }, { status: 404 });
    }

    if (connection.contractorId !== member.companyId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.clientProConnection.update({
      where: { id: connectionId },
      data: { status: "declined" },
    });

    // Send notification to client
    try {
      const client = await prisma.client.findUnique({
        where: { id: connection.clientId },
        select: { userId: true },
      });
      const company = await prisma.tradesCompany.findUnique({
        where: { id: member.companyId },
        select: { name: true },
      });
      if (client?.userId && company) {
        await notifyConnectionDeclined({
          clientClerkId: client.userId,
          proCompanyName: company.name,
          connectionId,
        });
      }
    } catch (notifErr) {
      console.error("[connections/decline] Notification error:", notifErr);
    }

    return NextResponse.json({ ok: true, connection: updated });
  } catch (error) {
    logger.error("POST /api/connections/decline error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
