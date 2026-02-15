// app/api/automation/alert/dismiss/route.ts
/**
 * POST /api/automation/alert/dismiss
 * 
 * Dismisses an alert
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getDelegate } from '@/lib/db/modelAliases';
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json({ error: "Missing alertId" }, { status: 400 });
    }

    await getDelegate('automationAlert').update({
      where: { id: alertId, orgId },
      data: { isDismissed: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ALERT DISMISS] Error:", error);
    return NextResponse.json(
      { error: "Failed to dismiss alert", details: String(error) },
      { status: 500 }
    );
  }
}
