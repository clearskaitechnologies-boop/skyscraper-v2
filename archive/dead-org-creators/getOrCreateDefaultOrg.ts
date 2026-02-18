import { currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

import prisma from "@/lib/prisma";

/**
 * Auto-onboard helper: Get or create a default Org + UserOrganization for the current user.
 *
 * This ensures new Clerk users always have an organization context when accessing the app.
 * Safe and idempotent - can be called multiple times without creating duplicates.
 *
 * @returns The user's organization (existing or newly created)
 * @throws Error if user is not authenticated
 */
export async function getOrCreateDefaultOrg() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // 1) Check if user already has an Org membership with valid org
  const existingMembership = await prisma.user_organizations.findFirst({
    where: { userId: user.id },
    include: { Org: { select: { id: true, name: true, clerkOrgId: true } } },
  });

  if (existingMembership) {
    if (existingMembership.Org) {
      return existingMembership.Org;
    }
    // Orphaned membership - clean it up
    console.warn("[getOrCreateDefaultOrg] Cleaning up orphaned membership:", {
      userId: user.id,
      orphanedOrgId: existingMembership.organizationId,
    });
    await prisma.user_organizations.delete({
      where: { id: existingMembership.id },
    });
  }

  // 2) Fallback: Check legacy users table for existing orgId
  const legacyUser = await prisma.users.findUnique({
    where: { clerkUserId: user.id },
    select: { orgId: true },
  });

  if (legacyUser?.orgId) {
    // User has legacy Org linkage, fetch it
    const legacyOrg = await prisma.org.findUnique({
      where: { id: legacyUser.orgId },
    });

    if (legacyOrg) {
      // Create UserOrganization entry for future lookups
      await prisma.user_organizations.create({
        data: {
          id: `uo_${legacyOrg.id}_${user.id}`,
          userId: user.id,
          organizationId: legacyOrg.id,
          role: "owner",
          created_at: new Date(),
        },
      });

      logger.debug(`[Auto-Onboard] Linked existing Org ${legacyOrg.id} to user ${user.id}`);
      return legacyOrg;
    }
  }

  // 3) Create new Org + membership for new user
  const orgName =
    user.firstName ||
    user.username ||
    user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "My Workspace";

  const Org = await prisma.org.upsert({
    where: { clerkOrgId: user.id },
    create: {
      clerkOrgId: user.id, // Use userId as clerkOrgId for personal orgs
      name: `${orgName}'s Organization`,
      planKey: "FREE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    update: {
      updatedAt: new Date(),
    },
  });

  await prisma.user_organizations.upsert({
    where: {
      id: `uo_${Org.id}_${user.id}`,
    },
    create: {
      id: `uo_${Org.id}_${user.id}`,
      userId: user.id,
      organization: {
        connect: { id: Org.id },
      },
      role: "owner",
      createdAt: new Date(),
    },
    update: {
      createdAt: new Date(),
    },
  });

  logger.debug(`[Auto-Onboard] Created Org ${Org.id} for user ${user.id}`);
  return Org;
}
