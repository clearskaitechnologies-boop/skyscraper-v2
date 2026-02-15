import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const AddTimelineEventSchema = z.object({
  claimId: z.string().min(1),
  type: z.string().min(1).max(100),
  description: z.string().max(5000).nullish(),
  visibleToClient: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const parsed = AddTimelineEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 422 }
      );
    }
    const { claimId, type, description, visibleToClient } = parsed.data;
    const ev = await prisma.claim_timeline_events.create({
      data: {
        claim_id: claimId,
        type,
        description: description ?? null,
        visible_to_client: !!visibleToClient,
      } as any,
    });
    return NextResponse.json({ ok: true, event: ev });
  } catch (e: any) {
    console.error("[claims:timeline:add]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
