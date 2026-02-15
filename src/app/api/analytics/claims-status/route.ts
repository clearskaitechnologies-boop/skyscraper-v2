import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get count of claims by status
    const statusCounts = await prisma.claims.groupBy({
      by: ["status"],
      where: { orgId },
      _count: { id: true },
    });

    // Calculate total for percentages
    const total = statusCounts.reduce((sum, item) => sum + item._count.id, 0);

    // Format response with percentages
    const data = statusCounts.map((item) => ({
      status: item.status,
      count: item._count.id,
      percentage: total > 0 ? Math.round((item._count.id / total) * 100) : 0,
    }));

    // Sort by count descending
    data.sort((a, b) => b.count - a.count);

    // If no real data, return demo data for display purposes
    if (data.length === 0) {
      const demoData = [
        { status: "new", count: 24, percentage: 20 },
        { status: "inspection_scheduled", count: 18, percentage: 15 },
        { status: "estimate_sent", count: 30, percentage: 25 },
        { status: "approved", count: 22, percentage: 18 },
        { status: "in_progress", count: 14, percentage: 12 },
        { status: "completed", count: 8, percentage: 7 },
        { status: "closed", count: 4, percentage: 3 },
      ];
      return NextResponse.json({ data: demoData, total: 120, isDemo: true });
    }

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error("Analytics API error (claims-status):", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
