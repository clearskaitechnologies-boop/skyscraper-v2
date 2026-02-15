import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, orgId: authOrgId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const { claimId, orgId, message, visibleToClient } = data;
    if (!claimId || !orgId || !message)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (authOrgId && orgId !== authOrgId)
      return NextResponse.json({ error: "Org mismatch" }, { status: 403 });
    const update = await prisma.claim_timeline_events.create({
      data: {
        id: randomUUID(),
        claim_id: claimId,
        org_id: orgId,
        type: "update",
        description: message,
        actor_id: userId,
        actor_type: "user",
        visible_to_client: visibleToClient ?? true,
      },
    });
    return NextResponse.json({ ok: true, update });
  } catch (e: any) {
    console.error("[claims:update]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
