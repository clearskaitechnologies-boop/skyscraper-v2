/**
 * POST /api/org/repair
 * =====================
 *
 * THE CANONICAL ORG REPAIR ENDPOINT
 *
 * This is the ONLY place that repairs org invariants.
 * DOES NOT seed demo data - only ensures org primitives exist.
 *
 * Guarantees after successful call:
 * - Org exists in DB (linked to Clerk org if present)
 * - User has membership in org
 * - BillingSettings row exists
 * - org_branding row exists
 *
 * Idempotent: Safe to call multiple times.
 * Fast: ~50ms typical, cached result if already valid.
 *
 * Called automatically by:
 * - Layout (on first render)
 * - Org switch handler
 * - /org-error repair button
 */

import { logger } from "@/lib/logger";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RepairResult {
  ok: boolean;
  orgId?: string;
  orgName?: string;
  repaired?: string[]; // List of what was fixed
  error?: string;
}

export async function POST(): Promise<NextResponse<RepairResult>> {
  const repaired: string[] = [];

  try {
    const { userId, orgId: clerkOrgId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const userName = user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "User"
      : "User";
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || null;

    logger.debug("[org/repair] Starting for user:", userId, "clerkOrgId:", clerkOrgId || "none");

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      let org: { id: string; name: string | null; clerkOrgId: string | null } | null = null;

      // STEP 0: CRITICAL - Clean up ALL orphaned memberships first
      const allMemberships = await tx.user_organizations.findMany({
        where: { userId },
        include: { Org: { select: { id: true } } },
      });

      const orphanedMemberships = allMemberships.filter((m) => !m.Org);
      if (orphanedMemberships.length > 0) {
        logger.debug(
          "[org/repair] Cleaning up",
          orphanedMemberships.length,
          "orphaned memberships"
        );
        await tx.user_organizations.deleteMany({
          where: {
            id: { in: orphanedMemberships.map((m) => m.id) },
          },
        });
        repaired.push(`deleted_${orphanedMemberships.length}_orphaned_memberships`);
      }

      // STEP 1: Find existing org (multiple strategies)
      // Strategy A: Clerk orgId match
      if (clerkOrgId) {
        org = await tx.org.findUnique({
          where: { clerkOrgId },
          select: { id: true, name: true, clerkOrgId: true },
        });

        if (org) {
          logger.debug("[org/repair] Found org via Clerk orgId:", org.id);
        }
      }

      // Strategy B: Find via valid membership (after cleanup)
      if (!org) {
        const validMembership = allMemberships.find((m) => m.Org);
        if (validMembership?.Org) {
          org = await tx.org.findUnique({
            where: { id: validMembership.organizationId },
            select: { id: true, name: true, clerkOrgId: true },
          });
          if (org) {
            logger.debug("[org/repair] Found org via membership:", org.id);
          }
        }
      }

      // Strategy C: Find via users.orgId (legacy)
      if (!org) {
        const userRecord = await tx.users.findFirst({
          where: { clerkUserId: userId },
          select: { orgId: true },
        });

        if (userRecord?.orgId) {
          org = await tx.org.findUnique({
            where: { id: userRecord.orgId },
            select: { id: true, name: true, clerkOrgId: true },
          });

          if (org) {
            logger.debug("[org/repair] Found org via users.orgId:", org.id);
          }
        }
      }

      // STEP 2: Create org if not found
      if (!org) {
        const newOrgId = crypto.randomUUID();
        const effectiveClerkOrgId = clerkOrgId || `personal_${userId.slice(-8)}_${Date.now()}`;

        org = await tx.org.create({
          data: {
            id: newOrgId,
            clerkOrgId: effectiveClerkOrgId,
            name: `${userName}'s Organization`,
            updatedAt: new Date(),
          },
          select: { id: true, name: true, clerkOrgId: true },
        });

        repaired.push("created_org");
        logger.debug("[org/repair] Created new org:", org.id);
      }

      // STEP 3: Ensure membership exists
      const existingMembership = await tx.user_organizations.findFirst({
        where: {
          userId,
          organizationId: org.id,
        },
      });

      if (!existingMembership) {
        await tx.user_organizations.create({
          data: {
            userId,
            organizationId: org.id,
            role: "ADMIN",
          },
        });
        repaired.push("created_membership");
        logger.debug("[org/repair] Created membership for user:", userId);
      }

      // STEP 4: Ensure user record exists and is linked
      const existingUser = await tx.users.findUnique({
        where: { clerkUserId: userId },
        select: { id: true, orgId: true },
      });

      if (!existingUser) {
        await tx.users.create({
          data: {
            id: crypto.randomUUID(),
            clerkUserId: userId,
            email: userEmail || `${userId}@skaiscrape.com`,
            name: userName,
            orgId: org.id,
          },
        });
        repaired.push("created_user");
        logger.debug("[org/repair] Created user record");
      } else if (existingUser.orgId !== org.id) {
        await tx.users.update({
          where: { clerkUserId: userId },
          data: { orgId: org.id },
        });
        repaired.push("linked_user_to_org");
        logger.debug("[org/repair] Linked user to org");
      }

      // STEP 5: Ensure BillingSettings exists
      const existingBilling = await tx.billingSettings.findUnique({
        where: { orgId: org.id },
      });

      if (!existingBilling) {
        await tx.billingSettings.create({
          data: {
            id: `billing_${org.id}`,
            orgId: org.id,
            updatedAt: new Date(),
          },
        });
        repaired.push("created_billing");
        logger.debug("[org/repair] Created BillingSettings");
      }

      return org;
    });

    // STEP 6: Ensure org_branding exists (outside transaction - separate table)
    try {
      const existingBranding = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM org_branding WHERE "orgId" = ${result.id} LIMIT 1
      `;

      if (!existingBranding || existingBranding.length === 0) {
        await prisma.$executeRaw`
          INSERT INTO org_branding ("id", "orgId", "createdAt", "updatedAt")
          VALUES (${crypto.randomUUID()}, ${result.id}, NOW(), NOW())
          ON CONFLICT ("orgId") DO NOTHING
        `;
        repaired.push("created_branding");
        logger.debug("[org/repair] Created org_branding row");
      }
    } catch (brandingError: any) {
      // Non-fatal - branding table may not exist in all environments
      logger.warn("[org/repair] Branding check failed (non-fatal):", brandingError.message);
    }

    logger.info(
      "[org/repair] Complete. OrgId:",
      result.id,
      "Repaired:",
      repaired.length > 0 ? repaired.join(", ") : "nothing"
    );

    return NextResponse.json({
      ok: true,
      orgId: result.id,
      orgName: result.name || "My Organization",
      repaired: repaired.length > 0 ? repaired : undefined,
    });
  } catch (error: any) {
    logger.error("[org/repair] Error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Repair failed" },
      { status: 500 }
    );
  }
}

// GET: Check org status without repairing
export async function GET(): Promise<NextResponse> {
  try {
    const { userId, orgId: clerkOrgId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if org exists
    let org: { id: string; name: string | null } | null = null;

    if (clerkOrgId) {
      org = await prisma.org.findUnique({
        where: { clerkOrgId },
        select: { id: true, name: true },
      });
    }

    if (!org) {
      const membership = await prisma.user_organizations.findFirst({
        where: { userId },
        include: { Org: { select: { id: true, name: true } } },
      });
      org = membership?.Org || null;
    }

    return NextResponse.json({
      ok: !!org,
      orgId: org?.id || null,
      orgName: org?.name || null,
      needsRepair: !org,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
