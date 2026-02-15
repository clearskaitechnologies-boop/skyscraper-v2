/**
 * POST /api/trades/engagement
 * Track engagement events for pro search ranking
 * Events: view, click, save, message, connect
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const EngagementSchema = z.object({
  proId: z.string(), // tradesCompanyMember.id (UUID)
  action: z.enum(["view", "click", "save", "message", "connect", "search_appear"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proId, action } = EngagementSchema.parse(body);

    // Get or create engagement record
    let engagement = await prisma.pro_engagement.findUnique({
      where: { contractorId: proId },
    });

    if (!engagement) {
      // Create new engagement record
      engagement = await prisma.pro_engagement.create({
        data: {
          id: crypto.randomUUID(),
          contractorId: proId,
          profileViews: action === "view" ? 1 : 0,
          searchAppears: action === "search_appear" ? 1 : 0,
          cardClicks: action === "click" ? 1 : 0,
          saves: action === "save" ? 1 : 0,
          messagesSent: action === "message" ? 1 : 0,
          connectRequests: action === "connect" ? 1 : 0,
        },
      });
    } else {
      // Update existing record
      const updateData: any = {};
      switch (action) {
        case "view":
          updateData.profileViews = { increment: 1 };
          break;
        case "search_appear":
          updateData.searchAppears = { increment: 1 };
          break;
        case "click":
          updateData.cardClicks = { increment: 1 };
          break;
        case "save":
          updateData.saves = { increment: 1 };
          break;
        case "message":
          updateData.messagesSent = { increment: 1 };
          break;
        case "connect":
          updateData.connectRequests = { increment: 1 };
          break;
      }

      engagement = await prisma.pro_engagement.update({
        where: { contractorId: proId },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TRACK_ENGAGEMENT]", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Don't fail the request for tracking errors
    return NextResponse.json({ success: false });
  }
}

/**
 * GET /api/trades/engagement?proId=xxx
 * Get engagement stats for a contractor (for profile page)
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const proId = searchParams.get("proId");

    if (!proId) {
      return NextResponse.json({ error: "proId required" }, { status: 400 });
    }

    const engagement = await prisma.pro_engagement.findUnique({
      where: { contractorId: proId },
    });

    if (!engagement) {
      return NextResponse.json({
        profileViews: 0,
        saves: 0,
        connectRequests: 0,
        engagementScore: 0,
      });
    }

    return NextResponse.json({
      profileViews: engagement.profileViews,
      saves: engagement.saves,
      connectRequests: engagement.connectRequests,
      engagementScore: engagement.engagementScore,
      messagesSent: engagement.messagesSent,
    });
  } catch (error) {
    console.error("[GET_ENGAGEMENT]", error);
    return NextResponse.json({ error: "Failed to get engagement stats" }, { status: 500 });
  }
}
