import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Internal API for creating notifications (used by other server actions)
export async function POST(req: NextRequest) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { claimId, type, title, body: notificationBody } = body;

    if (!claimId || !type || !title || !notificationBody) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notification = await prisma.projectNotification.create({
      data: {
        id: crypto.randomUUID(),
        orgId,
        claimId,
        notificationType: type,
        title,
        message: notificationBody,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    logger.error("Error creating notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
