import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { subDays } from "date-fns";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // Calculate start date
    const startDate = subDays(new Date(), days);

    // Get count of leads by source within date range
    const leadSourceCounts = await prisma.leads.groupBy({
      by: ["source"],
      where: {
        orgId,
        createdAt: { gte: startDate },
      },
      _count: { id: true },
    });

    // Calculate total for percentages
    const total = leadSourceCounts.reduce((sum, item) => sum + item._count.id, 0);

    // Format response with percentages
    const data = leadSourceCounts.map((item) => ({
      source: item.source || "Unknown",
      count: item._count.id,
      percentage: total > 0 ? Math.round((item._count.id / total) * 100) : 0,
    }));

    // Sort by count descending
    data.sort((a, b) => b.count - a.count);

    // If no real data, return demo data for display purposes
    if (data.length === 0) {
      const demoData = [
        { source: "Website", count: 45, percentage: 38 },
        { source: "Referral", count: 32, percentage: 27 },
        { source: "Door Knock", count: 18, percentage: 15 },
        { source: "Storm Chaser", count: 12, percentage: 10 },
        { source: "Social Media", count: 8, percentage: 7 },
        { source: "Other", count: 4, percentage: 3 },
      ];
      return NextResponse.json({
        data: demoData,
        total: 119,
        dateRange: { startDate, endDate: new Date(), days },
        isDemo: true,
      });
    }

    return NextResponse.json({
      data,
      total,
      dateRange: { startDate, endDate: new Date(), days },
    });
  } catch (error) {
    logger.error("Analytics API error (lead-sources):", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
