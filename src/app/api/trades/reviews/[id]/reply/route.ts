/**
 * POST /api/trades/reviews/[id]/reply
 * Pro replies to a client review
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const ReplySchema = z.object({
  reply: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = ReplySchema.parse(body);

    // Find the review
    const review = (await prisma.trade_reviews.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        contractorId: true,
        reply: true,
      } as unknown as Record<string, boolean>,
    })) as unknown as { id: string; contractorId: string; reply: string | null } | null;

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Verify the user is the contractor being reviewed
    const member = await prisma.tradesCompanyMember.findFirst({
      where: { id: review.contractorId, userId },
    });

    if (!member) {
      return NextResponse.json(
        { error: "You can only reply to reviews about you" },
        { status: 403 }
      );
    }

    // Update the review with the reply
    const updated = await prisma.trade_reviews.update({
      where: { id: params.id },
      data: {
        reply: data.reply,
        replyAt: new Date(),
      } as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("[API] POST /api/trades/reviews/[id]/reply error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
