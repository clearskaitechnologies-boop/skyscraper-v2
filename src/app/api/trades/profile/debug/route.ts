import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/trades/profile/debug
 * Returns a comprehensive diagnostic of the current user's trades profile state.
 * Checks all possible data sources and identifies mismatches.
 * Protected: only works for the authenticated user.
 */
export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();

  // Parallel lookups across all profile-related tables
  const [member, legacyProfile, internalUser, membersByName, allMembers] = await Promise.all([
    // 1. Primary: tradesCompanyMember by userId
    prisma.tradesCompanyMember
      .findUnique({
        where: { userId },
        include: { company: true },
      })
      .catch((e: Error) => ({ error: e.message })),

    // 2. Legacy: tradesProfile by userId
    prisma.tradesProfile
      .findUnique({ where: { userId } })
      .catch((e: Error) => ({ error: e.message })),

    // 3. Internal users table
    prisma.users
      .findFirst({
        where: { clerkUserId: userId },
        select: { id: true, orgId: true, clerkUserId: true, email: true, role: true },
      })
      .catch((e: Error) => ({ error: e.message })),

    // 4. Name-based search (catch ghost records)
    user?.firstName
      ? prisma.tradesCompanyMember
          .findMany({
            where: {
              OR: [
                { firstName: user.firstName, lastName: user.lastName || "" },
                { email: user.emailAddresses?.[0]?.emailAddress || "no-email" },
              ],
            },
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              companyName: true,
            },
          })
          .catch((e: Error) => ({ error: e.message }))
      : [],

    // 5. Total member count (sanity check)
    prisma.tradesCompanyMember.count().catch(() => 0),
  ]);

  // Message readiness check
  const messageReadiness = {
    hasModernProfile: member && !("error" in member),
    hasLegacyProfile: legacyProfile && !("error" in legacyProfile),
    modernThreadCount: 0 as number | string,
    legacyMessageCount: 0 as number | string,
  };

  if (member && !("error" in member)) {
    messageReadiness.modernThreadCount = await prisma.messageThread
      .count({
        where: {
          OR: [{ tradePartnerId: member.id }, { participants: { has: userId } }],
        },
      })
      .catch(() => "query-failed");
  }

  if (legacyProfile && !("error" in legacyProfile)) {
    messageReadiness.legacyMessageCount = await prisma.tradesMessage
      .count({
        where: {
          OR: [
            { fromProfileId: (legacyProfile as { id: string }).id },
            { toProfileId: (legacyProfile as { id: string }).id },
          ],
        },
      })
      .catch(() => "query-failed");
  }

  // Compute diagnosis
  const issues: string[] = [];
  const fixes: string[] = [];

  if (!member || "error" in member) {
    issues.push(
      "❌ No tradesCompanyMember record for your userId — profile page shows 'Create profile' CTA"
    );
    fixes.push("Visit /trades/profile — self-healing will auto-create your record");
  }
  if (!legacyProfile || "error" in legacyProfile) {
    issues.push("⚠️ No legacy tradesProfile — some older messaging features may not work");
  }
  if (
    membersByName &&
    !("error" in membersByName) &&
    Array.isArray(membersByName) &&
    membersByName.length > 0 &&
    membersByName.some((m) => m.userId !== userId)
  ) {
    issues.push(
      "🔴 GHOST RECORD: Found member(s) matching your name/email but with DIFFERENT userId"
    );
    fixes.push("Ghost records need manual DB cleanup — contact admin");
  }
  if (issues.length === 0) {
    issues.push("✅ All clear — profile and messaging should work");
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    clerk: {
      userId,
      orgId,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.emailAddresses?.[0]?.emailAddress,
    },
    tradesCompanyMember: member,
    legacyTradesProfile: legacyProfile,
    internalUser,
    ghostCheck: membersByName,
    totalMembersInDB: allMembers,
    messageReadiness,
    diagnosis: { issues, fixes },
  });
}
