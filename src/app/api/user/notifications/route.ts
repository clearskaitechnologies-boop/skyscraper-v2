/**
 * User Notifications API (Prisma-based)
 * GET - List notifications for current user's org
 * PATCH - Mark notification(s) as read
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/user/notifications
 * Returns all notifications for the authenticated user's org
 * Query params:
 *   ?unreadOnly=true - filter to unread only
 *   ?claimId=xyz - filter to specific claim
 */
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!orgId) {
      return NextResponse.json({ error: "No organization selected" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const claimId = searchParams.get("claimId");

    const where: any = { orgId };

    if (unreadOnly) {
      where.read = false;
    }

    if (claimId) {
      where.claimId = claimId;
    }

    const notifications = await prisma.projectNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to 50 most recent
      select: {
        id: true,
        notificationType: true,
        title: true,
        message: true,
        read: true,
        readAt: true,
        createdAt: true,
        claimId: true,
        metadata: true,
      },
    });

    // Get unread count
    const unreadCount = await prisma.projectNotification.count({
      where: {
        orgId,
        read: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    logger.error("Get notifications error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve notifications" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/notifications
 * Mark notification(s) as read
 * Body: { notificationIds: string[] } or { markAllRead: true }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!orgId) {
      return NextResponse.json({ error: "No organization selected" }, { status: 400 });
    }

    const body = await req.json();
    const { notificationIds, markAllRead } = body;

    if (markAllRead) {
      // Mark all org's notifications as read
      await prisma.projectNotification.updateMany({
        where: {
          orgId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "notificationIds array or markAllRead flag required" },
        { status: 400 }
      );
    }

    // Mark specific notifications as read (verify they belong to org)
    await prisma.projectNotification.updateMany({
      where: {
        id: { in: notificationIds },
        orgId, // Security: ensure org owns these notifications
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Notifications marked as read" });
  } catch (error) {
    logger.error("Update notifications error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notifications" },
      { status: 500 }
    );
  }
}
