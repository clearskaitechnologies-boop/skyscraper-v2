export const dynamic = "force-dynamic";
export const revalidate = 0;
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const report = await prisma.weather_reports.findFirst({
      where: {
        id,
        // Verify access through claim relationship
        claims: {
          orgId,
        },
      },
      include: {
        claims: {
          select: {
            id: true,
            claimNumber: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Weather report not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err) {
    logger.error("WEATHER GET ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch weather report" },
      { status: 500 }
    );
  }
}
