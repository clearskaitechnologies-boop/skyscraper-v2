import { auth } from "@clerk/nextjs/server";
import { endOfMonth, format,startOfMonth, subMonths } from "date-fns";
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
    const months = parseInt(searchParams.get("months") || "12");
    const groupBy = searchParams.get("groupBy") || "month"; // month, quarter, year

    // Calculate start date
    const endDate = new Date();
    const startDate = subMonths(endDate, months);

    // Get all claims in the date range
    const claims = await prisma.claims.findMany({
      where: {
        orgId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group claims by time period
    const timeSeriesMap = new Map<
      string,
      { date: string; count: number; byStatus: Record<string, number> }
    >();

    claims.forEach((claim) => {
      const monthStart = startOfMonth(claim.createdAt);
      const key = format(monthStart, "yyyy-MM");
      const label = format(monthStart, "MMM yyyy");

      if (!timeSeriesMap.has(key)) {
        timeSeriesMap.set(key, { date: label, count: 0, byStatus: {} });
      }

      const entry = timeSeriesMap.get(key)!;
      entry.count += 1;
      entry.byStatus[claim.status] = (entry.byStatus[claim.status] || 0) + 1;
    });

    // Convert to array and sort chronologically
    const data = Array.from(timeSeriesMap.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Calculate summary statistics
    const totalClaims = claims.length;
    const avgPerMonth = data.length > 0 ? Math.round(totalClaims / data.length) : 0;

    return NextResponse.json({
      data,
      summary: {
        totalClaims,
        avgPerMonth,
        months: data.length,
      },
      dateRange: { startDate, endDate, months },
    });
  } catch (error) {
    console.error("Analytics API error (claims-timeline):", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
