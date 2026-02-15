/**
 * Trades Groups Posts API
 * Handles CRUD operations for posts within groups
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// GET - Get posts for a group
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    // Check group exists and user can view
    const group = await prisma.tradesGroup.findUnique({
      where: { id: groupId, isActive: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // For hidden groups, check membership
    if (group.privacy === "hidden") {
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const membership = await prisma.tradesGroupMember.findUnique({
        where: { groupId_userId: { groupId, userId } },
      });
      if (!membership || membership.status !== "active") {
        return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
      }
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.tradesGroupPost.findMany({
        where: { groupId, isActive: true },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.tradesGroupPost.count({
        where: { groupId, isActive: true },
      }),
    ]);

    // Fetch author profiles
    const authorIds = [...new Set(posts.map((p) => p.authorId))];
    const authors = await prisma.tradesCompanyMember.findMany({
      where: { userId: { in: authorIds } },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        avatar: true,
        tradeType: true,
        companyName: true,
      },
    });

    const authorMap = new Map(authors.map((a) => [a.userId, a]));

    const postsWithAuthors = posts.map((p) => ({
      ...p,
      author: authorMap.get(p.authorId) || null,
    }));

    return NextResponse.json({
      posts: postsWithAuthors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/trades/groups/posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST - Create a post in a group
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, content, images } = body;

    if (!groupId || !content) {
      return NextResponse.json({ error: "Group ID and content are required" }, { status: 400 });
    }

    // Check membership
    const membership = await prisma.tradesGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership || membership.status !== "active") {
      return NextResponse.json({ error: "Must be a member to post" }, { status: 403 });
    }

    if ((membership.status as string) === "muted") {
      return NextResponse.json({ error: "You are muted in this group" }, { status: 403 });
    }

    // Create post
    const post = await prisma.tradesGroupPost.create({
      data: {
        groupId,
        authorId: userId,
        content,
        images: images || [],
      },
    });

    // Increment post count
    await prisma.tradesGroup.update({
      where: { id: groupId },
      data: { postCount: { increment: 1 } },
    });

    // Get author profile
    const author = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        avatar: true,
        tradeType: true,
        companyName: true,
      },
    });

    return NextResponse.json({ post: { ...post, author } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/trades/groups/posts error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

// PATCH - Update a post (edit or pin)
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { postId, content, isPinned } = body;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await prisma.tradesGroupPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check permissions
    const membership = await prisma.tradesGroupMember.findUnique({
      where: { groupId_userId: { groupId: post.groupId, userId } },
    });

    const isAuthor = post.authorId === userId;
    const isAdminOrMod = membership && ["admin", "moderator"].includes(membership.role);

    // Only author can edit content, only admin/mod can pin
    if (content !== undefined && !isAuthor) {
      return NextResponse.json({ error: "Only the author can edit this post" }, { status: 403 });
    }

    if (isPinned !== undefined && !isAdminOrMod) {
      return NextResponse.json(
        { error: "Only admins or moderators can pin posts" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (isPinned !== undefined) updateData.isPinned = isPinned;

    const updated = await prisma.tradesGroupPost.update({
      where: { id: postId },
      data: updateData,
    });

    return NextResponse.json({ post: updated });
  } catch (error) {
    console.error("PATCH /api/trades/groups/posts error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE - Delete a post
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await prisma.tradesGroupPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check permissions
    const membership = await prisma.tradesGroupMember.findUnique({
      where: { groupId_userId: { groupId: post.groupId, userId } },
    });

    const isAuthor = post.authorId === userId;
    const isAdminOrMod = membership && ["admin", "moderator"].includes(membership.role);

    if (!isAuthor && !isAdminOrMod) {
      return NextResponse.json({ error: "Not authorized to delete this post" }, { status: 403 });
    }

    // Soft delete
    await prisma.tradesGroupPost.update({
      where: { id: postId },
      data: { isActive: false },
    });

    // Decrement post count
    await prisma.tradesGroup.update({
      where: { id: post.groupId },
      data: { postCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/trades/groups/posts error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
