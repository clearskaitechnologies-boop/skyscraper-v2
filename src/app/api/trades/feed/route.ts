// ORG-SCOPE: Public marketplace data — cross-org by design
// GET returns all active tradesPost records (public feed — no auth required for read).
// POST is userId-scoped (creates post as authenticated user).
// tradesPost has no orgId; the trades feed is a cross-org social network.

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/trades/feed
 * Get public trades network posts
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Get existing TradesPost model (defined around line 192)
    const posts = await prisma.tradesPost.findMany({
      where: {
        active: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });

    const total = await prisma.tradesPost.count({
      where: { active: true },
    });

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[TRADES_FEED_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch trades feed" }, { status: 500 });
  }
}

/**
 * POST /api/trades/feed
 * Create a new trades post
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, title, type, tags, images, location, city, state } = body;

    if (!content || !type) {
      return NextResponse.json({ error: "Content and type are required" }, { status: 400 });
    }

    // Get user's TradesProfile for profileId on the post
    const profile = await prisma.tradesProfile.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "No trades profile found" }, { status: 400 });
    }

    const post = await prisma.tradesPost.create({
      data: {
        id: crypto.randomUUID(),
        authorId: userId,
        profileId: profile.id,
        type: type,
        title: title || "",
        content,
        tags: tags || [],
        images: images || [],
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("[CREATE_TRADES_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
