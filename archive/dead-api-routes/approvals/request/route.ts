// MODULE 4: Approvals - Request approval from client
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const requestApprovalSchema = z.object({
  claimId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Pro user only
    const proUser = await prisma.users.findFirst({
      where: { clerkUserId: userId },
      select: { id: true, orgId: true },
    });

    if (!proUser) {
      return NextResponse.json({ error: "Forbidden - Pro only" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = requestApprovalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { claimId, title, description } = parsed.data;

    // carrier_approvals model requires job_id, line_item_set, scope_totals
    // This simplified approval request flow is not compatible with the current schema
    // Return deprecation notice
    return NextResponse.json(
      {
        ok: false,
        error: "Feature not implemented",
        deprecated: true,
        message:
          "carrier_approvals model requires job_id and line_item_set - simple approval requests not supported",
        received: { claimId, title },
      },
      { status: 501 }
    );
  } catch (error) {
    logger.error("[APPROVAL_REQUEST]", error);
    return NextResponse.json({ error: "Failed to create approval request" }, { status: 500 });
  }
}
