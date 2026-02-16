export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

/**
 * GET /api/weather/analytics
 *
 * Aggregates weather data the user has already generated:
 *  - weather_reports (DOL pulls, claims weather, full verification)
 *  - weather_events (hail, wind, tornado, etc.)
 *  - Correlates with claims for impact analysis
 *
 * Returns analytics breakdown by peril type, region, monthly trend, etc.
 */
export async function GET(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status === "unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = ctx.userId as string;
    const orgId = ctx.orgId;

    // ── Weather Reports Summary ──
    const reports = await prisma.weather_reports.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        address: true,
        mode: true,
        primaryPeril: true,
        overallAssessment: true,
        confidence: true,
        dol: true,
        periodFrom: true,
        periodTo: true,
        createdAt: true,
        claimId: true,
        leadId: true,
        candidateDates: true,
        events: true,
      },
    });

    // ── Weather Events Summary ──
    let totalEvents = 0;
    let hailEvents = 0;
    let windEvents = 0;
    let tornadoEvents = 0;
    let floodEvents = 0;
    try {
      [totalEvents, hailEvents, windEvents, tornadoEvents, floodEvents] = await Promise.all([
        prisma.weather_events.count(),
        prisma.weather_events.count({ where: { type: { in: ["hail", "HAIL"] } } }),
        prisma.weather_events.count({
          where: { type: { in: ["wind", "WIND", "thunderstorm_wind"] } },
        }),
        prisma.weather_events.count({ where: { type: { in: ["tornado", "TORNADO"] } } }),
        prisma.weather_events.count({ where: { type: { in: ["flood", "FLOOD", "flash_flood"] } } }),
      ]);
    } catch {
      // Events table may be empty
    }

    // ── Peril Breakdown from reports ──
    const perilCounts: Record<string, number> = {};
    const assessmentCounts: Record<string, number> = {};
    const monthlyTrend: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    const confidenceScores: number[] = [];

    for (const r of reports) {
      // Peril breakdown
      const peril = r.primaryPeril || "unknown";
      perilCounts[peril] = (perilCounts[peril] || 0) + 1;

      // Assessment breakdown
      const assessment = r.overallAssessment || "unknown";
      assessmentCounts[assessment] = (assessmentCounts[assessment] || 0) + 1;

      // Monthly trend
      if (r.createdAt) {
        const month = new Date(r.createdAt).toISOString().slice(0, 7); // YYYY-MM
        monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
      }

      // Region from address
      if (r.address) {
        // Extract state or city from address
        const parts = r.address.split(",").map((p: string) => p.trim());
        const region = parts.length >= 2 ? parts[parts.length - 1] : parts[0];
        if (region) {
          regionCounts[region] = (regionCounts[region] || 0) + 1;
        }
      }

      // Confidence tracking
      if (r.confidence != null) {
        confidenceScores.push(Number(r.confidence));
      }
    }

    const avgConfidence =
      confidenceScores.length > 0
        ? Math.round(
            (confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) * 100
          ) / 100
        : null;

    // Sort monthly trend by date
    const sortedMonthly = Object.entries(monthlyTrend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    // Top regions (sorted by count)
    const topRegions = Object.entries(regionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([region, count]) => ({ region, count }));

    // ── Claims with weather data ──
    let claimsWithWeather = 0;
    if (orgId) {
      try {
        const claimIdsWithWeather = reports
          .filter((r) => r.claimId)
          .map((r) => r.claimId as string);
        claimsWithWeather = new Set(claimIdsWithWeather).size;
      } catch {
        // Non-critical
      }
    }

    // Recent reports for the feed
    const recentReports = reports.slice(0, 10).map((r) => ({
      id: r.id,
      address: r.address,
      mode: r.mode,
      peril: r.primaryPeril,
      assessment: r.overallAssessment,
      confidence: r.confidence,
      date: r.dol || r.createdAt,
      claimId: r.claimId,
    }));

    return NextResponse.json({
      summary: {
        totalReports: reports.length,
        claimsWithWeather,
        avgConfidence,
        totalEvents,
      },
      events: {
        total: totalEvents,
        hail: hailEvents,
        wind: windEvents,
        tornado: tornadoEvents,
        flood: floodEvents,
      },
      perils: perilCounts,
      assessments: assessmentCounts,
      monthlyTrend: sortedMonthly,
      topRegions,
      recentReports,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
