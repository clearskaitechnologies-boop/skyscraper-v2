/**
 * UNIFIED ORG CONTEXT - THE ONLY ORG RESOLVER PAGES SHOULD USE
 *
 * This is the SINGLE SOURCE OF TRUTH for org context.
 * It calls /api/org/repair internally to ensure org invariants.
 *
 * USAGE:
 * ```ts
 * const { org, userId } = await getOrgOrRepair();
 * // org is GUARANTEED to exist and be valid
 * ```
 *
 * RULES:
 * 1. NEVER use getOrgContext, getActiveOrgContext, safeOrgContext directly
 * 2. This function ALWAYS returns a valid org or redirects
 * 3. Call this at the TOP of every protected page
 */

import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

export interface OrgContext {
  org: {
    id: string;
    name: string;
    clerkOrgId: string | null;
    demoMode: boolean;
  };
  userId: string;
}

/**
 * Get org context, repairing if necessary.
 * NEVER throws - redirects to sign-in or org-error if unrecoverable.
 */
export async function getOrgOrRepair(): Promise<OrgContext> {
  const { userId, orgId: clerkOrgId } = await auth();

  // No session -> sign in
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  // Try fast path: find org directly
  let org = await findOrgFast(userId, clerkOrgId);

  if (org) {
    return {
      org: {
        id: org.id,
        name: org.name || "My Organization",
        clerkOrgId: org.clerkOrgId,
        demoMode: org.demoMode ?? false,
      },
      userId,
    };
  }

  // Slow path: repair org
  logger.debug("[getOrgOrRepair] No org found, initiating repair...");

  try {
    org = await repairOrgInline(userId, clerkOrgId);

    if (org) {
      return {
        org: {
          id: org.id,
          name: org.name || "My Organization",
          clerkOrgId: org.clerkOrgId,
          demoMode: org.demoMode ?? false,
        },
        userId,
      };
    }
  } catch (error: any) {
    console.error("[getOrgOrRepair] Repair failed:", error.message);
  }

  // Unrecoverable - go to error page
  redirect("/org-error?reason=repair_failed");
}

/**
 * Fast path: Try to find org without repair
 */
async function findOrgFast(
  userId: string,
  clerkOrgId: string | null
): Promise<{
  id: string;
  name: string | null;
  clerkOrgId: string | null;
  demoMode: boolean | null;
} | null> {
  // Strategy 1: Clerk orgId
  if (clerkOrgId) {
    const org = await prisma.org.findUnique({
      where: { clerkOrgId },
      select: { id: true, name: true, clerkOrgId: true, demoMode: true },
    });

    if (org) return org;
  }

  // Strategy 2: Membership
  const membership = await prisma.user_organizations.findFirst({
    where: { userId },
    include: {
      Org: {
        select: { id: true, name: true, clerkOrgId: true, demoMode: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (membership?.Org) {
    return membership.Org;
  }

  // Strategy 3: users.orgId
  const userRecord = await prisma.users.findFirst({
    where: { clerkUserId: userId },
    select: { orgId: true },
  });

  if (userRecord?.orgId) {
    const org = await prisma.org.findUnique({
      where: { id: userRecord.orgId },
      select: { id: true, name: true, clerkOrgId: true, demoMode: true },
    });

    if (org) return org;
  }

  return null;
}

/**
 * Inline repair (same logic as /api/org/repair but without HTTP call)
 */
async function repairOrgInline(
  userId: string,
  clerkOrgId: string | null
): Promise<{
  id: string;
  name: string | null;
  clerkOrgId: string | null;
  demoMode: boolean | null;
} | null> {
  return await prisma.$transaction(async (tx) => {
    // Create org
    const newOrgId = crypto.randomUUID();
    const effectiveClerkOrgId = clerkOrgId || `personal_${userId.slice(-8)}_${Date.now()}`;

    const org = await tx.org.create({
      data: {
        id: newOrgId,
        clerkOrgId: effectiveClerkOrgId,
        name: "My Organization",
        demoMode: false, // Enterprise orgs start in production mode
        updatedAt: new Date(),
      },
      select: { id: true, name: true, clerkOrgId: true, demoMode: true },
    });

    // Create membership
    await tx.user_organizations.create({
      data: {
        userId,
        organizationId: org.id,
        role: "ADMIN",
      },
    });

    // Create BillingSettings
    await tx.billingSettings.create({
      data: {
        id: `billing_${org.id}`,
        orgId: org.id,
        updatedAt: new Date(),
      },
    });

    logger.debug("[getOrgOrRepair] Repaired org inline:", org.id);

    return org;
  });
}

/**
 * Lightweight check - does org exist without repair?
 * Use for conditional rendering, not for guards.
 */
export async function hasValidOrg(): Promise<boolean> {
  const { userId, orgId: clerkOrgId } = await auth();

  if (!userId) return false;

  const org = await findOrgFast(userId, clerkOrgId);
  return !!org;
}
