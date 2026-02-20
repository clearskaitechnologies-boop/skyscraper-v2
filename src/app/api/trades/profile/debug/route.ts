/**
 * DEBUG ENDPOINT — Temporary diagnostic for profile loading issues
 * Visit /api/trades/profile/debug while logged in to see exactly what resolves
 * DELETE AFTER RESOLVED
 */
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ensureUserOrgContext } from "@/lib/auth/ensureUserOrgContext";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const steps: Record<string, unknown> = {};
  try {
    // Step 1: auth()
    const { userId } = await auth();
    steps["1_auth_userId"] = userId || "NULL — not logged in";
    if (!userId) {
      return NextResponse.json(steps, { status: 401 });
    }

    // Step 2: currentUser()
    const user = await currentUser();
    steps["2_clerk_email"] = user?.emailAddresses?.[0]?.emailAddress || "no email";
    steps["2_clerk_firstName"] = user?.firstName;
    steps["2_clerk_lastName"] = user?.lastName;
    steps["2_clerk_orgId_metadata"] = user?.publicMetadata?.orgId || "none";

    // Step 3: ensureUserOrgContext
    try {
      const ctx = await ensureUserOrgContext(userId);
      steps["3_orgContext"] = ctx;
    } catch (err) {
      steps["3_orgContext_ERROR"] = (err as Error).message;
    }

    // Step 4: Direct findUnique by userId
    try {
      const member = await prisma.tradesCompanyMember.findUnique({
        where: { userId },
        select: {
          id: true,
          userId: true,
          email: true,
          firstName: true,
          lastName: true,
          companyId: true,
          orgId: true,
          isOwner: true,
          isActive: true,
          status: true,
        },
      });
      steps["4_findUnique_by_userId"] = member || "NULL — no record found";
    } catch (err) {
      steps["4_findUnique_ERROR"] = (err as Error).message;
    }

    // Step 5: Check company exists
    try {
      const member = await prisma.tradesCompanyMember.findUnique({
        where: { userId },
        include: { company: { select: { id: true, name: true, slug: true } } },
      });
      steps["5_company_included"] = member?.company || "NULL — no company linked";
    } catch (err) {
      steps["5_company_ERROR"] = (err as Error).message;
    }

    // Step 6: Check email-based lookup
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (email) {
      const byEmail = await prisma.tradesCompanyMember
        .findFirst({
          where: { email },
          select: { id: true, userId: true, email: true, companyId: true },
        })
        .catch(() => null);
      steps["6_findFirst_by_email"] = byEmail || "NULL";
    }

    // Step 7: user_organizations for this user
    const memberships = await prisma.user_organizations.findMany({
      where: { userId },
      include: { Org: { select: { id: true, name: true } } },
    });
    steps["7_org_memberships"] = memberships.map((m) => ({
      orgId: m.organizationId,
      orgName: m.Org?.name,
      role: m.role,
    }));

    // Step 8: users table row
    const usersRow = await prisma.users
      .findFirst({
        where: { clerkUserId: userId },
        select: { id: true, email: true, name: true, orgId: true },
      })
      .catch(() => null);
    steps["8_users_table"] = usersRow || "NOT FOUND";

    return NextResponse.json(steps, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    steps["FATAL_ERROR"] = (err as Error).message;
    steps["FATAL_STACK"] = (err as Error).stack?.split("\n").slice(0, 5);
    return NextResponse.json(steps, { status: 500 });
  }
}
