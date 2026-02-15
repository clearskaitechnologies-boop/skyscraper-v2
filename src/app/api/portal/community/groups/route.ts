/**
 * Community Groups API
 * GET: List groups
 * POST: Create a group
 */

import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");

    // For now, return empty array until CommunityGroup model is created
    // Groups will be stored in the database once the model exists
    const groups: any[] = [];

    return NextResponse.json({
      groups,
      total: groups.length,
    });
  } catch (error) {
    console.error("[CommunityGroups GET] Error:", error);
    return NextResponse.json({ groups: [], total: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, category, isPrivate } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    // Find client
    const client = await prisma.client.findUnique({
      where: { userId: user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client profile required" }, { status: 400 });
    }

    // For now, return a mock group until CommunityGroup model is created
    const group = {
      id: `group-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || "",
      category: category || "General",
      memberCount: 1,
      isPrivate: isPrivate || false,
      creatorId: client.id,
      image: null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("[CommunityGroups POST] Error:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
