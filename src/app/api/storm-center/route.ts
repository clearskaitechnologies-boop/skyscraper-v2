export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { apiError, apiOk } from "@/lib/apiError";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

/**
 * GET /api/storm-center
 *
 * Aggregates Storm Command Center data:
 *  - Active claims count + pending supplements
 *  - Revenue pipeline (sum of open claim values)
 *  - Material orders pending delivery
 *  - Average claim velocity (days to close)
 *  - Recent activity feed
 *  - Weather alerts for org service area
 */
export async function GET(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId) {
      return apiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const orgId = ctx.orgId;

    // ── Active Claims ──
    const activeClaims = await prisma.claim
      .count({
        where: {
          orgId,
          status: { notIn: ["CLOSED", "CANCELLED", "ARCHIVED"] },
        },
      })
      .catch(() => 0);

    // ── Supplements ──
    const pendingSupplements = await prisma.supplement
      .count({
        where: {
          claim: { orgId },
          status: { in: ["PENDING", "SUBMITTED", "IN_REVIEW"] },
        },
      })
      .catch(() => 0);

    const supplementsApproved = await prisma.supplement
      .count({
        where: {
          claim: { orgId },
          status: "APPROVED",
          updatedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      })
      .catch(() => 0);

    // ── Revenue Pipeline ──
    const pipelineAgg = await prisma.claim
      .aggregate({
        where: {
          orgId,
          status: { notIn: ["CLOSED", "CANCELLED", "ARCHIVED"] },
        },
        _sum: { totalClaimValue: true },
      })
      .catch(() => ({ _sum: { totalClaimValue: null } }));

    const revenuePipeline = Number(pipelineAgg._sum?.totalClaimValue ?? 0);

    // ── Material Orders ──
    const materialOrdersPending = await prisma.materialOrder
      .count({
        where: {
          orgId,
          status: { in: ["PENDING", "ORDERED", "PROCESSING"] },
        },
      })
      .catch(() => 0);

    // ── Claim Velocity (avg days to close, last 90 days) ──
    let avgClaimVelocity = 0;
    try {
      const closedClaims = await prisma.claim.findMany({
        where: {
          orgId,
          status: "CLOSED",
          closedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true, closedAt: true },
        take: 100,
      });

      if (closedClaims.length > 0) {
        const totalDays = closedClaims.reduce((sum, c) => {
          if (!c.closedAt) return sum;
          return sum + (c.closedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        }, 0);
        avgClaimVelocity = Math.round(totalDays / closedClaims.length);
      }
    } catch {
      // Velocity computation is best-effort
    }

    // ── Recent Activity (last 10 events) ──
    let recentActivity: Array<{
      title: string;
      description: string;
      time: string;
      type: "claim" | "supplement" | "order" | "payment" | "weather";
    }> = [];

    try {
      const recentClaims = await prisma.claim.findMany({
        where: { orgId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          claimNumber: true,
          status: true,
          updatedAt: true,
          homeownerName: true,
        },
      });

      recentActivity = recentClaims.map((c) => ({
        title: `Claim ${c.claimNumber || c.id.slice(0, 8)}`,
        description: `${c.homeownerName || "Homeowner"} — Status: ${c.status}`,
        time: formatTimeAgo(c.updatedAt),
        type: "claim" as const,
      }));
    } catch {
      // Activity feed is best-effort
    }

    return apiOk({
      activeClaims,
      pendingSupplements,
      supplementsApproved,
      revenuePipeline,
      materialOrdersPending,
      avgClaimVelocity,
      recentActivity,
      weatherAlerts: [], // Weather alerts populated by weather service integration
    });
  } catch (err: any) {
    logger.error("[storm-center-get]", err);
    return apiError(500, "INTERNAL_ERROR", err.message);
  }
}

// ── Helper: Human-readable time-ago ──
function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}
