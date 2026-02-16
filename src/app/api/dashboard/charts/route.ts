export const dynamic = "force-dynamic";
export const revalidate = 0;

import { currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { toPlainJSON } from "@/lib/serialize";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const orgId = (user.publicMetadata?.orgId as string) || user.id;

    // Claims Over Time (last 8 weeks) - build date ranges
    const weekRanges = Array.from({ length: 8 }, (_, idx) => {
      const i = 7 - idx;
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return { label: `W${8 - i}`, weekStart, weekEnd };
    });

    // Parallelize all independent chart queries
    const [claimsByStatus, weekCounts, leadsBySource] = await Promise.all([
      // Claims by Status
      prisma.claims.groupBy({
        by: ["status"],
        where: { orgId },
        _count: { id: true },
      }),
      // Claims Over Time - 8 week counts in parallel
      Promise.all(
        weekRanges.map((w) =>
          prisma.claims.count({
            where: { orgId, createdAt: { gte: w.weekStart, lt: w.weekEnd } },
          })
        )
      ),
      // Lead Source Breakdown
      prisma.leads.groupBy({
        by: ["source"],
        where: { orgId },
        _count: { id: true },
      }),
    ]);

    const claimsStatusData = claimsByStatus.map((item) => ({
      status: item.status || "Unknown",
      count: item._count.id,
    }));

    const claimsOverTime = weekRanges.map((w, idx) => ({
      date: w.label,
      count: weekCounts[idx],
    }));

    const leadsSourceData = leadsBySource.map((item) => ({
      source: item.source || "Unknown",
      count: item._count.id,
    }));

    const payload = toPlainJSON({
      ok: true,
      data: {
        claimsByStatus: claimsStatusData,
        claimsOverTime,
        leadsBySource: leadsSourceData,
      },
    });

    return NextResponse.json(payload);
  } catch (error: any) {
    logger.error("[GET /api/dashboard/charts] error:", error);
    return NextResponse.json(
      { ok: false, error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
