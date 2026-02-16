import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const job = await (prisma.export_jobs as any).findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: { createdAt: "asc" },
        },
        reports: true,
      },
    });

    if (!job || job.org_id !== orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    logger.error("[BatchProposal Get Error]", error);
    return NextResponse.json({ error: "Failed to fetch batch job" }, { status: 500 });
  }
}
