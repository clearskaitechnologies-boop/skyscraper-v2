/**
 * Presence Heartbeat API
 * POST /api/presence/heartbeat
 * Called on page load / periodically to update lastSeenAt
 * Also returns the user's current presence state
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  // Try pro member first, then client — update whichever exists
  const [member, client] = await Promise.allSettled([
    prisma.tradesCompanyMember.update({
      where: { userId },
      data: { lastSeenAt: now },
      select: { id: true, lastSeenAt: true, customStatus: true, statusEmoji: true },
    }),
    prisma.client.update({
      where: { userId },
      data: { lastActiveAt: now },
      select: { id: true, lastActiveAt: true, customStatus: true, statusEmoji: true },
    }),
  ]);

  const memberData = member.status === "fulfilled" ? member.value : null;
  const clientData = client.status === "fulfilled" ? client.value : null;

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    pro: memberData,
    client: clientData,
  });
}
