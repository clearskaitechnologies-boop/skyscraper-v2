/**
 * Featured Work API
 * Handles CRUD operations for featured work items on profiles
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// GET - Get featured work for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");
    const { userId: currentUserId } = await auth();

    const userId = targetUserId || currentUserId;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const featuredWork = await prisma.tradesFeaturedWork.findMany({
      where: { userId, isFeatured: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    });

    return NextResponse.json({ featuredWork });
  } catch (error) {
    console.error("GET /api/trades/featured-work error:", error);
    return NextResponse.json({ error: "Failed to fetch featured work" }, { status: 500 });
  }
}

// POST - Add new featured work item
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, imageUrl, projectDate, category } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and image are required" }, { status: 400 });
    }

    // Get current max sort order
    const maxOrder = await prisma.tradesFeaturedWork.aggregate({
      where: { userId },
      _max: { sortOrder: true },
    });

    const featuredWork = await prisma.tradesFeaturedWork.create({
      data: {
        userId,
        title,
        description: description || null,
        imageUrl,
        projectDate: projectDate ? new Date(projectDate) : null,
        category: category || null,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json({ featuredWork }, { status: 201 });
  } catch (error) {
    console.error("POST /api/trades/featured-work error:", error);
    return NextResponse.json({ error: "Failed to create featured work" }, { status: 500 });
  }
}

// PATCH - Update featured work item
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, description, imageUrl, projectDate, category, isFeatured, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: "Work item ID required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.tradesFeaturedWork.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (projectDate !== undefined)
      updateData.projectDate = projectDate ? new Date(projectDate) : null;
    if (category !== undefined) updateData.category = category;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const featuredWork = await prisma.tradesFeaturedWork.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ featuredWork });
  } catch (error) {
    console.error("PATCH /api/trades/featured-work error:", error);
    return NextResponse.json({ error: "Failed to update featured work" }, { status: 500 });
  }
}

// DELETE - Remove featured work item
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Work item ID required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.tradesFeaturedWork.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
    }

    await prisma.tradesFeaturedWork.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/trades/featured-work error:", error);
    return NextResponse.json({ error: "Failed to delete featured work" }, { status: 500 });
  }
}
