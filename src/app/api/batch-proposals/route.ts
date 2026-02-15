import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.export_jobs.findMany({
      where: { org_id: orgId },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("[BatchProposal List Error]", error);
    return NextResponse.json({ error: "Failed to fetch batch jobs" }, { status: 500 });
  }
}
