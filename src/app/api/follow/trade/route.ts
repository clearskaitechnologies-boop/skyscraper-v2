// MODULE 8: Follow System - Follow/unfollow trade partner
// Uses tradesConnection model to create connections between trade professionals
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const followSchema = z.object({
  tradePartnerId: z.string(),
  action: z.enum(["follow", "unfollow"]),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = followSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { tradePartnerId, action } = parsed.data;

    if (action === "follow") {
      // Create a connection request to the trade partner
      await prisma.tradesConnection.upsert({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: tradePartnerId,
          },
        },
        update: {
          createdAt: new Date(),
        },
        create: {
          id: crypto.randomUUID(),
          followerId: userId,
          followingId: tradePartnerId,
        },
      });
      return NextResponse.json({ followed: true });
    } else {
      // Remove the connection
      await prisma.tradesConnection.deleteMany({
        where: {
          followerId: userId,
          followingId: tradePartnerId,
        },
      });
      return NextResponse.json({ followed: false });
    }
  } catch (error) {
    console.error("[FOLLOW_TRADE]", error);
    return NextResponse.json({ error: "Failed to update follow status" }, { status: 500 });
  }
}
