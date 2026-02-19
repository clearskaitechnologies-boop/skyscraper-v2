export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { getOrgQuotaStatus } from "../../../../lib/plan";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quotaStatus = await getOrgQuotaStatus();
    if (!quotaStatus) {
      return NextResponse.json({ error: "No plan found" }, { status: 404 });
    }

    return NextResponse.json(quotaStatus);
  } catch (error) {
    logger.error("Failed to fetch quota status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
