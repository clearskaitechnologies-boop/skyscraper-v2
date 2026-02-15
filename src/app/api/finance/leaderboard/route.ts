import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

/**
 * GET /api/finance/leaderboard — Company leaderboard
 * Hybrid: Uses team_performance table first, then falls back to
 * computing real-time stats from claims + leads + scopes data.
 *
 * Supports ?period=month|3month|6month|year (default: month)
 */
export async function GET(req: Request) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";

    // Calculate date range based on period
    const now = new Date();
    let periodStart: Date;
    switch (period) {
      case "3month":
        periodStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "6month":
        periodStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "year":
        periodStart = new Date(now.getFullYear(), 0, 1);
        break;
      case "month":
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Strategy 1: Try team_performance table first
    const perfRecords = await prisma.team_performance.findMany({
      where: {
        orgId: ctx.orgId,
        periodStart: { gte: periodStart },
      },
      orderBy: { totalRevenueGenerated: "desc" },
      take: 25,
    });

    if (perfRecords.length > 0) {
      // Use team_performance data (existing path)
      const userIds = [...new Set(perfRecords.map((r) => r.userId))];
      const users = await prisma.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true, headshot_url: true },
      });
      const usersMap = new Map(users.map((u) => [u.id, u]));

      const byRevenue = [...perfRecords].sort(
        (a, b) => Number(b.totalRevenueGenerated) - Number(a.totalRevenueGenerated)
      );
      const byClaims = [...perfRecords].sort((a, b) => b.claimsSigned - a.claimsSigned);
      const byDoors = [...perfRecords].sort((a, b) => b.doorsKnocked - a.doorsKnocked);

      const leaderboard = perfRecords.map((r) => {
        const user = usersMap.get(r.userId);
        return {
          userId: r.userId,
          name: user?.name || r.userId.slice(0, 12),
          email: user?.email || "",
          avatar: user?.headshot_url || null,
          revenue: Number(r.totalRevenueGenerated),
          claimsSigned: r.claimsSigned,
          claimsApproved: r.claimsApproved,
          doorsKnocked: r.doorsKnocked,
          closeRate: Number(r.closeRate),
          commissionEarned:
            Number(r.commissionPaid) + Number(r.commissionOwed) + Number(r.commissionPending),
          commissionPaid: Number(r.commissionPaid),
          rankRevenue: byRevenue.findIndex((x) => x.userId === r.userId) + 1,
          rankClaims: byClaims.findIndex((x) => x.userId === r.userId) + 1,
          rankDoors: byDoors.findIndex((x) => x.userId === r.userId) + 1,
        };
      });

      const totalRevenue = perfRecords.reduce((s, r) => s + Number(r.totalRevenueGenerated), 0);
      const totalClaims = perfRecords.reduce((s, r) => s + r.claimsSigned, 0);
      const totalDoors = perfRecords.reduce((s, r) => s + r.doorsKnocked, 0);

      return NextResponse.json({
        success: true,
        data: {
          leaderboard,
          summary: {
            totalRevenue,
            totalClaims,
            totalDoors,
            repCount: perfRecords.length,
            avgCloseRate:
              perfRecords.length > 0
                ? perfRecords.reduce((s, r) => s + Number(r.closeRate), 0) / perfRecords.length
                : 0,
          },
          period,
          source: "team_performance",
        },
      });
    }

    // Strategy 2: Compute leaderboard from real claims/leads/scopes data
    // Get all org members
    const memberships = await prisma.user_organizations.findMany({
      where: { organizationId: ctx.orgId },
      select: { userId: true },
    });

    const memberIds = memberships.map((m) => m.userId);
    if (memberIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          leaderboard: [],
          summary: { totalRevenue: 0, totalClaims: 0, totalDoors: 0, repCount: 0, avgCloseRate: 0 },
          period,
          source: "computed",
        },
      });
    }

    const users = await prisma.users.findMany({
      where: { clerkUserId: { in: memberIds } },
      select: { id: true, clerkUserId: true, name: true, email: true, headshot_url: true },
    });

    // Get claims per user (claims signed in period)
    const claims = await prisma.claims.findMany({
      where: {
        orgId: ctx.orgId,
        createdAt: { gte: periodStart },
      },
      select: { id: true, estimatedValue: true, status: true, createdAt: true, createdBy: true },
    });

    // Get leads per user (leads created in period)
    const leads = await prisma.leads.findMany({
      where: {
        orgId: ctx.orgId,
        createdAt: { gte: periodStart },
      },
      select: {
        id: true,
        value: true,
        stage: true,
        jobCategory: true,
        createdAt: true,
        assignedTo: true,
      },
    });

    // Build leaderboard entries for each user — per-user attribution
    const leaderboard = users.map((user) => {
      // Attribute claims by createdBy, fallback to splitting evenly if no createdBy
      const userClaims = claims.filter(
        (c) => c.createdBy === user.clerkUserId || c.createdBy === user.id
      );
      // If no claims have createdBy set, split evenly among members
      const claimsWithCreator = claims.filter((c) => c.createdBy);
      const effectiveClaims =
        claimsWithCreator.length > 0 ? userClaims : users.length === 1 ? claims : [];

      // Attribute leads by assignedTo
      const userLeads = leads.filter(
        (l) => l.assignedTo === user.clerkUserId || l.assignedTo === user.id
      );
      const leadsWithAssigned = leads.filter((l) => l.assignedTo);
      const effectiveLeads =
        leadsWithAssigned.length > 0 ? userLeads : users.length === 1 ? leads : [];

      const approvedClaims = effectiveClaims.filter(
        (c) => c.status === "approved" || c.status === "completed"
      ).length;
      const claimsRevenue =
        effectiveClaims.reduce((sum, c) => sum + (c.estimatedValue || 0), 0) / 100;
      const leadsRevenue = effectiveLeads.reduce((sum, l) => sum + (l.value || 0), 0) / 100;
      const totalRevenue = claimsRevenue + leadsRevenue;
      const closeRate =
        effectiveClaims.length > 0 ? (approvedClaims / effectiveClaims.length) * 100 : 0;

      return {
        userId: user.clerkUserId || user.id,
        name: user.name || user.email || "Team Member",
        email: user.email || "",
        avatar: user.headshot_url || null,
        revenue: totalRevenue,
        claimsSigned: effectiveClaims.length,
        claimsApproved: approvedClaims,
        doorsKnocked: effectiveLeads.length,
        closeRate,
        commissionEarned: totalRevenue * 0.1, // 10% default commission estimate
        commissionPaid: 0,
        rankRevenue: 0,
        rankClaims: 0,
        rankDoors: 0,
      };
    });

    // Compute rankings
    const byRevenue = [...leaderboard].sort((a, b) => b.revenue - a.revenue);
    const byClaims = [...leaderboard].sort((a, b) => b.claimsSigned - a.claimsSigned);
    const byDoors = [...leaderboard].sort((a, b) => b.doorsKnocked - a.doorsKnocked);

    leaderboard.forEach((entry) => {
      entry.rankRevenue = byRevenue.findIndex((x) => x.userId === entry.userId) + 1;
      entry.rankClaims = byClaims.findIndex((x) => x.userId === entry.userId) + 1;
      entry.rankDoors = byDoors.findIndex((x) => x.userId === entry.userId) + 1;
    });

    const totalRevenue = leaderboard.reduce((s, r) => s + r.revenue, 0);
    const totalClaims = leaderboard.reduce((s, r) => s + r.claimsSigned, 0);
    const totalDoors = leaderboard.reduce((s, r) => s + r.doorsKnocked, 0);

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: byRevenue,
        summary: {
          totalRevenue,
          totalClaims,
          totalDoors,
          repCount: leaderboard.length,
          avgCloseRate:
            leaderboard.length > 0
              ? leaderboard.reduce((s, r) => s + r.closeRate, 0) / leaderboard.length
              : 0,
        },
        period,
        source: "computed",
      },
    });
  } catch (err: any) {
    console.error("[API] leaderboard error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
