export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// NOTE: TeamPost model doesn't exist in database - this route is disabled
// NOTE: Add TeamPost model to schema or use activities table for team posts

// import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the last 10 team posts
    // const posts = await prisma.teamPost.findMany({
    //   orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    //   take: 10,
    // });

    return NextResponse.json([]);
  } catch (error) {
    logger.error("Error fetching team posts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, pinned = false } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // const post = await prisma.teamPost.create({
    //   data: {
    //     authorId: userId,
    //     description: message.trim(),
    //     pinned,
    //   },
    // });

    return NextResponse.json({ description: "Not implemented" }, { status: 501 });
  } catch (error) {
    logger.error("Error creating team post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
