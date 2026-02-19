import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { autoRefill, refillThreshold } = body;

    if (typeof autoRefill !== "boolean") {
      return NextResponse.json({ error: "autoRefill must be a boolean" }, { status: 400 });
    }

    if (orgId) {
      await prisma.org
        .update({ where: { clerkOrgId: orgId }, data: { updatedAt: new Date() } })
        .catch(() => logger.warn("Could not update org for auto-refill toggle"));
    }

    logger.info("Auto-refill toggled: " + autoRefill + " for org " + orgId);

    return NextResponse.json({ success: true, autoRefill, refillThreshold: refillThreshold || 100 });
  } catch (error) {
    logger.error("Auto-refill toggle error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update auto-refill" },
      { status: 500 }
    );
  }
}
