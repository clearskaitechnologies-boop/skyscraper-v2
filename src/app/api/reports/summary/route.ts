// TODO: This route has 0 frontend callers. Dashboard aggregation that was never wired.
import { NextResponse } from "next/server";

import { getTenant } from "@/lib/auth/tenant";
import prisma from "@/lib/prisma";

// Cache reports summary for 1 hour (3600 seconds)
export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    const orgId = await getTenant();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get URL params for date filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // Include entire end date
      dateFilter.lte = endDateTime;
    }

    const whereClause: any = { orgId };
    if (Object.keys(dateFilter).length > 0) {
      whereClause.dateOfLoss = dateFilter;
    }

    // Initialize with default values
    let totalClaims = 0;
    let totalExposureCents = 0;
    let stageCount: Record<string, number> = {};
    let damageTypeCount: Record<string, number> = {};
    let recentClaimsCount = 0;
    let claimsData: any[] = [];

    try {
      // Query 1: Get basic count and sum (lightweight)
      const claimsCount = await prisma.claims.count({
        where: whereClause,
      });
      totalClaims = claimsCount;

      // Query 2: Get exposure data separately
      if (totalClaims > 0) {
        try {
          const exposureData = await prisma.claims.aggregate({
            where: whereClause,
            _sum: {
              exposure_cents: true,
            },
          });
          totalExposureCents = exposureData._sum?.exposure_cents || 0;
        } catch (error) {
          console.error("[Reports API] Exposure aggregation failed:", error);
        }
      }

      // Query 3: Get grouped data for stages and types (simplified)
      if (totalClaims > 0 && totalClaims < 500) {
        // Only run if reasonable count
        try {
          const claims = await prisma.claims.findMany({
            where: whereClause,
            select: {
              id: true,
              exposure_cents: true,
              lifecycle_stage: true,
              dateOfLoss: true,
              damageType: true,
              status: true,
            },
            take: 500,
          });

          // Count by lifecycle stage
          claims.forEach((claim) => {
            const stage = claim.lifecycle_stage || "UNASSIGNED";
            stageCount[stage] = (stageCount[stage] || 0) + 1;
          });

          // Count by damage type
          claims.forEach((claim) => {
            const type = claim.damageType || "Unknown";
            damageTypeCount[type] = (damageTypeCount[type] || 0) + 1;
          });

          // Get recent claims (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          recentClaimsCount = claims.filter(
            (c) => c.dateOfLoss && new Date(c.dateOfLoss) >= thirtyDaysAgo
          ).length;

          // Serialize dates to ISO strings
          claimsData = claims.map((c) => ({
            id: c.id,
            stage: c.lifecycle_stage,
            exposure: c.exposure_cents,
            date: c.dateOfLoss ? c.dateOfLoss.toISOString() : null,
            damageType: c.damageType,
          }));
        } catch (error) {
          console.error("[Reports API] Claims detail query failed:", error);
        }
      }
    } catch (error) {
      console.error("[Reports API] Database query failed:", error);
      // Continue with zeroed data
    }

    // Calculate average exposure
    const avgExposureCents = totalClaims > 0 ? totalExposureCents / totalClaims : 0;

    // Find most common damage type
    const mostCommonDamageType =
      Object.entries(damageTypeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return NextResponse.json(
      {
        totalClaims,
        totalExposureCents,
        totalExposureFormatted: `$${(totalExposureCents / 100).toLocaleString("en-US")}`,
        avgExposureCents,
        avgExposureFormatted: `$${(avgExposureCents / 100).toLocaleString("en-US")}`,
        claimsByStage: stageCount,
        claimsByDamageType: damageTypeCount,
        mostCommonDamageType,
        recentClaimsCount,
        claimsData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Reports API] Critical error:", error);
    // Return zeroed data with 200 status to prevent UI crash
    return NextResponse.json(
      {
        totalClaims: 0,
        totalExposureCents: 0,
        totalExposureFormatted: "$0",
        avgExposureCents: 0,
        avgExposureFormatted: "$0",
        claimsByStage: {},
        claimsByDamageType: {},
        mostCommonDamageType: "N/A",
        recentClaimsCount: 0,
        claimsData: [],
      },
      { status: 200 }
    );
  }
}
