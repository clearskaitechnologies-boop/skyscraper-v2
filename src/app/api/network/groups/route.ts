import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/network/groups
 *
 * Fetches community groups from the TradesGroup table
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category") || "";

    // Fetch groups (tradesGroup uses privacy field, not isPublic)
    // NOTE: tradesGroup has no orgId — intentionally cross-org community groups
    const groups = await prisma.tradesGroup
      .findMany({
        where: {
          privacy: "public",
          ...(category ? { category } : {}),
        },
        orderBy: [{ memberCount: "desc" }, { createdAt: "desc" }],
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          memberCount: true,
          coverImage: true,
          createdAt: true,
        },
      })
      .catch(() => []);

    // Transform to expected format
    const formattedGroups = groups.map((group: any) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      category: group.category || "General",
      memberCount: group.memberCount || 0,
      image: group.coverImage,
      createdAt: group.createdAt?.toISOString(),
    }));

    // If no groups exist, return some suggested groups
    if (formattedGroups.length === 0) {
      return NextResponse.json({
        groups: [
          {
            id: "suggested-1",
            name: "Northern Arizona Homeowners",
            description:
              "Connect with fellow homeowners in Northern Arizona. Share tips, get recommendations, and discuss local contractors.",
            category: "Regional",
            memberCount: 0,
            image: null,
            isSuggested: true,
          },
          {
            id: "suggested-2",
            name: "Storm Damage Support",
            description:
              "A community for homeowners dealing with storm damage. Get advice on insurance claims, find contractors, and share experiences.",
            category: "Support",
            memberCount: 0,
            image: null,
            isSuggested: true,
          },
          {
            id: "suggested-3",
            name: "Home Renovation Ideas",
            description:
              "Share and discover home renovation ideas. Post before/after photos, discuss projects, and get inspired.",
            category: "Ideas",
            memberCount: 0,
            image: null,
            isSuggested: true,
          },
        ],
        total: 0,
        suggested: true,
      });
    }

    return NextResponse.json({
      groups: formattedGroups,
      total: formattedGroups.length,
    });
  } catch (error) {
    logger.error("[Network Groups] Error:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

/**
 * POST /api/network/groups
 *
 * Create a new community group
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, isPublic = true } = body;

    if (!name) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    // Generate a URL-safe slug from name
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();

    const group = await prisma.tradesGroup.create({
      data: {
        name,
        slug,
        description: description || "",
        category: category || "General",
        privacy: isPublic ? "public" : "private",
        memberCount: 1,
        createdById: userId,
      },
    });

    // Add creator as first member
    await prisma.tradesGroupMember
      .create({
        data: {
          groupId: group.id,
          userId,
          role: "ADMIN",
        },
      })
      .catch(() => null); // Ignore if member table doesn't exist

    return NextResponse.json({
      success: true,
      group,
    });
  } catch (error) {
    logger.error("[Create Group] Error:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
