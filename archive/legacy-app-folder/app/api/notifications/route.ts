// ============================================================================
// H-16: Notifications API
// ============================================================================

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    // H-16: Query real notifications from activities
    // Using claim activities as notification source
    try {
      const activities = await db.claim_activities?.findMany({
        where: {
          organization_id: orgId,
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
        include: {
          claim: {
            select: {
              id: true,
              claimNumber: true,
              title: true,
            },
          },
        },
      });

      const notifications = (activities || []).map((activity: any) => ({
        id: activity.id,
        type: activity.activity_type || "claim",
        title: activity.description,
        message: activity.claim?.title || `Claim #${activity.claim?.claimNumber}`,
        link: `/claims/${activity.claim_id}`,
        read: false,
        createdAt: activity.created_at,
      }));

      const unreadCount = notifications.length;

      return NextResponse.json({
        notifications,
        unreadCount,
      });
    } catch (error) {
      console.warn("[Notifications] Using fallback - claim_activities may not exist yet");
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
      });
    }
  } catch (error) {
    console.error("[NOTIFICATIONS_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
