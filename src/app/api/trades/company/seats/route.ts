/**
 * Company Seats API
 * GET /api/trades/company/seats - Get seat info for current user's company
 * POST /api/trades/company/seats/invite - Invite a new team member
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ensureUserOrgContext } from "@/lib/auth/ensureUserOrgContext";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Seat limits by plan
// Solo: $29.99/mo - 1 seat (can add up to 2 at $9.99/seat)
// Business: $139.99/mo - 10 seats
// Enterprise: $399.99/mo - 25 seats
const SEAT_LIMITS: Record<string, number> = {
  free: 1,
  solo: 1,
  solo_plus: 3, // Solo + 2 addon seats at $9.99 each
  business: 10,
  enterprise: 25,
  // Legacy plan mappings
  starter: 3,
  pro: 10,
  pro_plus: 10,
  team: 10,
  unlimited: 25,
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's trade profile
    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      include: {
        company: {
          include: {
            members: {
              where: { isActive: true },
              select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                role: true,
                isOwner: true,
                isAdmin: true,
                title: true,
                tradeType: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Trade profile not found" }, { status: 404 });
    }

    // Get org subscription info
    const { orgId } = await ensureUserOrgContext(userId);
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: {
        planKey: true,
        subscriptionStatus: true,
      },
    });

    const planKey = org?.planKey || "solo";
    const seatLimit = SEAT_LIMITS[planKey] || 1;
    const usedSeats = member.company?.members?.length || 1;
    const availableSeats = Math.max(0, seatLimit - usedSeats);

    // Get pending invites
    const pendingInvites = await prisma.tradesCompanyMember.findMany({
      where: {
        companyId: member.companyId,
        status: "pending",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      company: member.company
        ? {
            id: member.company.id,
            name: member.company.name,
            slug: member.company.slug,
          }
        : null,
      seats: {
        total: seatLimit,
        used: usedSeats,
        available: availableSeats,
        canAddMore: availableSeats > 0,
      },
      plan: {
        key: planKey,
        seatLimit,
        requiresUpgrade: availableSeats <= 0,
        upgradePlan: availableSeats <= 0 ? getUpgradePlan(planKey) : null,
      },
      members: member.company?.members || [],
      pendingInvites,
      isOwner: member.isOwner,
      isAdmin: member.isAdmin,
      canManageSeats: member.isOwner || member.isAdmin,
    });
  } catch (error) {
    console.error("[company/seats] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getUpgradePlan(currentPlan: string): string | null {
  const upgradePath: Record<string, string> = {
    free: "solo_plus",
    solo: "solo_plus",
    solo_plus: "team",
    starter: "pro",
    pro: "team",
    team: "enterprise",
  };
  return upgradePath[currentPlan] || null;
}
