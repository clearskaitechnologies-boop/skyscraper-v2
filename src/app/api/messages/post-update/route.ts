import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// contractor -> client message
export async function POST(req: Request) {
  try {
    const { userId, orgId: authOrgId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const { claimId, orgId, body } = data;
    if (!claimId || !orgId || !body)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (authOrgId && orgId !== authOrgId)
      return NextResponse.json({ error: "Org mismatch" }, { status: 403 });

    // Find or create a portal thread for this claim
    let thread = await prisma.messageThread.findFirst({
      where: { claimId, isPortalThread: true },
    });

    if (!thread) {
      thread = await prisma.messageThread.create({
        data: {
          id: crypto.randomUUID(),
          orgId,
          claimId,
          isPortalThread: true,
          subject: "Status Update",
        },
      });
    }

    const msg = await prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        threadId: thread.id,
        senderUserId: userId,
        senderType: "contractor",
        body,
        fromPortal: false,
      },
    });

    // Update thread timestamp
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true, message: msg });
  } catch (e) {
    logger.error("[Message:post-update]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
