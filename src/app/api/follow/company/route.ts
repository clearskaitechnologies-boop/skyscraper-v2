// MODULE 8: Follow System - Follow/unfollow company (tradesCompany)
// Uses ClientSavedPro model to save/unsave trade companies
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const followSchema = z.object({
  companyId: z.string(), // tradesCompany UUID
  action: z.enum(["follow", "unfollow"]),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find client by Clerk userId
    const client = await prisma.client.findFirst({
      where: { userId: userId },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = followSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { companyId, action, category, notes } = parsed.data;

    if (action === "follow") {
      // Use upsert to handle duplicate follows gracefully
      await prisma.clientSavedPro.upsert({
        where: {
          clientId_companyId: {
            clientId: client.id,
            companyId,
          },
        },
        update: {
          category: category ?? undefined,
          notes: notes ?? undefined,
        },
        create: {
          id: crypto.randomUUID(),
          clientId: client.id,
          companyId,
          category,
          notes,
        },
      });
      return NextResponse.json({ followed: true });
    } else {
      await prisma.clientSavedPro.deleteMany({
        where: {
          clientId: client.id,
          companyId,
        },
      });
      return NextResponse.json({ followed: false });
    }
  } catch (error) {
    console.error("[FOLLOW_COMPANY]", error);
    return NextResponse.json({ error: "Failed to update follow status" }, { status: 500 });
  }
}
