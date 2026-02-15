import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

const crypto = require("crypto");

// GET /api/trades/posts - Get feed posts with filters
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const search = searchParams.get("search");
  const companyId = searchParams.get("companyId");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: any = { active: true };

  if (companyId) where.companyId = companyId;
  if (type) where.type = type;
  if (city) where.city = city;
  if (state) where.state = state;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
      { tags: { has: search } },
    ];
  }

  const posts = await prisma.tradesPost.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    skip: offset,
  });

  return NextResponse.json({ posts });
}

// POST /api/trades/posts - Create new post
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's trades company member profile
  const member = await prisma.tradesCompanyMember.findUnique({
    where: { userId },
  });

  if (!member) {
    return NextResponse.json(
      { error: "Create your trades profile first at /trades/profile" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const {
    type,
    title,
    content,
    location,
    city,
    state,
    tags,
    images,
    startDate,
    endDate,
    payRate,
    requirements,
    contactEmail,
    contactPhone,
    visibility,
  } = body;

  if (!type || !content) {
    return NextResponse.json({ error: "Missing required fields: type, content" }, { status: 400 });
  }

  // Get user's profile for profileId
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
      profileId: profile.id,
      authorId: userId,
      type: type,
      title: title || "",
      content,
      tags: tags || [],
      images: images || [],
      visibility: visibility || "public",
      active: true,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}

// DELETE /api/trades/posts?postId=xxx
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }

  // Verify ownership
  const post = await prisma.tradesPost.findUnique({
    where: { id: postId },
  });

  if (!post || post.authorId !== userId) {
    return NextResponse.json({ error: "Not authorized to delete this post" }, { status: 403 });
  }

  await prisma.tradesPost.update({
    where: { id: postId },
    data: { active: false, updatedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
