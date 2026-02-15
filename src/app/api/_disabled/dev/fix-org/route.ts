// src/app/api/dev/fix-Org/route.ts
// Development-only Org/user repair endpoint.
// Ensures a single Org exists and the target Clerk user has a Users row + membership.
// Safe idempotent operations; cleans orphan UserOrganization links.

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Avoid executing repair logic during static/production build phase to prevent Prisma writes at build time.
// Also allows the route to exist without triggering validation errors while Next.js attempts to evaluate routes.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

// Target Clerk user for repair operations
const TARGET_CLERK_USER_ID = "user_35Lks8c1cQpyxGpsXEO2cmBZNvb";

// Allow execution in any environment (prod use is intentional for one-time repair)
export async function GET() {
  // Skip during build to prevent unintended user/Org creation when pre-rendering.
  if (isBuildPhase) {
    return NextResponse.json({ ok: false, skipped: true, reason: "build-phase" });
  }

  try {
    // 1. Clean orphan memberships (organizationId points to missing Org)
    const allMemberships = await prisma.user_organizations.findMany({
      select: { id: true, organizationId: true },
    });
    const orgIds = new Set((await prisma.org.findMany({ select: { id: true } })).map((o) => o.id));
    for (const m of allMemberships) {
      if (!orgIds.has(m.organizationId)) {
        await prisma.user_organizations.delete({ where: { id: m.id } });
      }
    }

    // 2. Existing membership for target Clerk user?
    let membership = await prisma.user_organizations.findFirst({
      where: { userId: TARGET_CLERK_USER_ID },
      include: { Org: true },
    });

    let Org = membership?.Org || null;

    // 3. If no Org, create one and membership
    if (!Org) {
      Org = await prisma.org.create({
        data: {
          id: crypto.randomUUID(),
          name: "SkaiScraper HQ",
          clerkOrgId: `auto_${TARGET_CLERK_USER_ID}`,
          updatedAt: new Date(),
        },
      });
      membership = await prisma.user_organizations.create({
        data: {
          userId: TARGET_CLERK_USER_ID,
          organizationId: Org.id,
          role: "owner",
        },
        include: { Org: true },
      });
    }

    // 4. Ensure Users row exists with the resolved Org id
    let user = await prisma.users.findUnique({ where: { clerkUserId: TARGET_CLERK_USER_ID } });
    if (!user) {
      user = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          clerkUserId: TARGET_CLERK_USER_ID,
          email: `repair+${TARGET_CLERK_USER_ID}@placeholder.local`,
          orgId: Org.id,
        },
      });
    } else if (user.orgId !== Org.id) {
      user = await prisma.users.update({ where: { id: user.id }, data: { orgId: Org.id } });
    }

    return NextResponse.json({
      ok: true,
      userId: user.id,
      clerkUserId: TARGET_CLERK_USER_ID,
      orgId: Org.id,
      membershipId: membership?.id,
    });
  } catch (err: any) {
    console.error("[fix-Org] error", err);
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
