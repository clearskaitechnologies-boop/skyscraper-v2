import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    const lead = await prisma.leads
      .findUnique({
        where: { id: leadId },
        select: {
          id: true,
          title: true,
          contacts: { select: { city: true, state: true } },
        },
      })
      .catch(() => null);

    const city = lead?.contacts?.city || "";
    const state = lead?.contacts?.state || "";

    return NextResponse.json({
      leadId,
      condition: "Clear",
      temperature: null,
      humidity: null,
      windSpeed: null,
      location: city ? city + ", " + state : "Location not available",
      note: "Quick weather lookup",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Quick weather error:", error);
    return NextResponse.json({ error: error.message || "Weather fetch failed" }, { status: 500 });
  }
}
