import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/me/notifications - Fetch user notifications
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const notifications = await prisma.$queryRaw<any[]>`
      SELECT * FROM notifications
      WHERE user_id = ${userId}
      ${unreadOnly ? prisma.$queryRaw`AND is_read = false` : prisma.$queryRaw``}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return new Response(JSON.stringify({ notifications }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch notifications" }), { status: 500 });
  }
}

// POST /api/me/notifications - Create notification
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await req.json();
  const { orgId, title, message, type = "info", actionUrl, actionLabel } = body;

  if (!title || !message) {
    return new Response(JSON.stringify({ error: "Title and message required" }), { status: 400 });
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO notifications (org_id, userId, title, message, type, action_url, action_label)
      VALUES (${orgId || userId}, ${userId}, ${title}, ${message}, ${type}, ${actionUrl || null}, ${actionLabel || null})
    `;

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return new Response(JSON.stringify({ error: "Failed to create notification" }), { status: 500 });
  }
}

// PATCH /api/me/notifications/[id] - Mark as read
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await req.json();
  const { id, isRead = true } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: "Notification ID required" }), { status: 400 });
  }

  try {
    await prisma.$executeRaw`
      UPDATE notifications
      SET is_read = ${isRead}, read_at = ${isRead ? new Date() : null}
      WHERE id = ${id} AND user_id = ${userId}
    `;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to update notification:", error);
    return new Response(JSON.stringify({ error: "Failed to update notification" }), { status: 500 });
  }
}
