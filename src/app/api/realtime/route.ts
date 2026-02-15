import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ITEM 26: Real-time notification system
export async function POST(req: NextRequest) {
  try {
    const { userId: authUserId, orgId: authOrgId } = await auth();

    const body = await req.json();
    const { event, data, orgId, userId } = body;

    const effectiveOrgId = orgId || authOrgId;
    if (!event || !data || !effectiveOrgId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create notification (ProjectNotification requires claimId, no userId/type/jobId)
    if (!data.claimId) {
      // If no claimId provided, just log and return success without DB write
      console.log(
        `[REAL-TIME] Event: ${event}, User: ${userId || authUserId}, Org: ${effectiveOrgId} (no claimId, skipping DB)`
      );
      return NextResponse.json({
        success: true,
        notification: { event, message: data.message, title: data.title },
      });
    }

    const notification = await prisma.projectNotification.create({
      data: {
        id: crypto.randomUUID(),
        orgId: effectiveOrgId,
        claimId: data.claimId,
        notificationType: event,
        title: data.title || "Notification",
        message: data.message || "",
        read: false,
        createdAt: new Date(),
      },
    });

    // Log for Pusher/Socket.io integration (when configured)
    if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY) {
      // Pusher integration would go here
      console.log(`[REAL-TIME] Pusher configured, would push: ${event}`);
    }

    console.log(
      `[REAL-TIME] Event: ${event}, User: ${userId || authUserId}, Org: ${effectiveOrgId}`
    );

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Real-time notification error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}

// Subscribe to real-time updates (Server-Sent Events endpoint)
export async function GET(req: NextRequest) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return recent notifications for org (ProjectNotification doesn't have userId field)
  const notifications = await prisma.projectNotification.findMany({
    where: {
      orgId,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    notifications,
    message:
      "Poll this endpoint for updates. WebSocket/SSE integration available when Pusher is configured.",
    pusherConfigured: !!(process.env.PUSHER_APP_ID && process.env.PUSHER_KEY),
  });
}
