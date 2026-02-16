/**
 * Trades Profile Actions - Unified handler for profile management
 *
 * POST /api/trades/profile/actions
 * Actions: update, update_portfolio, add_featured_work, remove_featured_work
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update"),
    businessName: z.string().optional(),
    about: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().optional(),
    primaryTrade: z.string().optional(),
    serviceAreas: z.array(z.string()).optional(),
    logoUrl: z.string().optional(),
    coverPhotoUrl: z.string().optional(),
  }),
  z.object({
    action: z.literal("update_portfolio"),
    items: z.array(
      z.object({
        id: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        imageUrl: z.string(),
        category: z.string().optional(),
      })
    ),
  }),
  z.object({
    action: z.literal("add_featured_work"),
    title: z.string(),
    description: z.string().optional(),
    imageUrl: z.string(),
    projectValue: z.number().optional(),
    completedAt: z.string().optional(),
  }),
  z.object({
    action: z.literal("remove_featured_work"),
    workId: z.string(),
  }),
  z.object({
    action: z.literal("request_verification"),
    documents: z.array(z.string()).optional(),
  }),
]);

type ActionInput = z.infer<typeof ActionSchema>;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // Get user's profile
    const profile = await prisma.tradesProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Trades profile not found" }, { status: 404 });
    }

    switch (input.action) {
      case "update":
        return handleUpdate(profile.id, input);

      case "update_portfolio":
        return handleUpdatePortfolio(profile.id, input);

      case "add_featured_work":
        return handleAddFeaturedWork(profile.id, input);

      case "remove_featured_work":
        return handleRemoveFeaturedWork(profile.id, input);

      case "request_verification":
        return handleRequestVerification(profile.id, input);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Trades Profile Actions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleUpdate(profileId: string, input: Extract<ActionInput, { action: "update" }>) {
  const { action, ...updateData } = input;

  const updated = await prisma.tradesProfile.update({
    where: { id: profileId },
    data: updateData,
  });

  return NextResponse.json({ success: true, profile: updated });
}

async function handleUpdatePortfolio(
  profileId: string,
  input: Extract<ActionInput, { action: "update_portfolio" }>
) {
  // Delete existing portfolio items
  await prisma.portfolioItem.deleteMany({
    where: { profileId },
  });

  // Create new items
  const items = await prisma.portfolioItem.createMany({
    data: input.items.map((item) => ({
      profileId,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      category: item.category,
    })),
  });

  return NextResponse.json({ success: true, count: items.count });
}

async function handleAddFeaturedWork(
  profileId: string,
  input: Extract<ActionInput, { action: "add_featured_work" }>
) {
  const work = await prisma.featuredWork.create({
    data: {
      profileId,
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      projectValue: input.projectValue,
      completedAt: input.completedAt ? new Date(input.completedAt) : null,
    },
  });

  return NextResponse.json({ success: true, work });
}

async function handleRemoveFeaturedWork(
  profileId: string,
  input: Extract<ActionInput, { action: "remove_featured_work" }>
) {
  await prisma.featuredWork.delete({
    where: {
      id: input.workId,
      profileId,
    },
  });

  return NextResponse.json({ success: true });
}

async function handleRequestVerification(
  profileId: string,
  input: Extract<ActionInput, { action: "request_verification" }>
) {
  await prisma.verificationRequest.create({
    data: {
      profileId,
      documents: input.documents || [],
      status: "pending",
    },
  });

  return NextResponse.json({ success: true, message: "Verification request submitted" });
}
