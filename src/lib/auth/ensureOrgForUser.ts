/**
 * PHASE F: Auto-Org Verification
 * Ensures every user has a valid org + membership on every login
 * NO MORE "Initialize Account" loops
 *
 * Lookup chain:
 *   1. user_organizations table (by Clerk userId)
 *   2. users.orgId column (by Clerk userId)
 *   3. users table email fallback (find user row by email, then check orgId)
 *   4. Create new org (last resort, rate-limited by dedup key)
 */

import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface EnsureOrgParams {
  userId: string;
  email?: string | null;
  name?: string | null;
}

/**
 * In-memory dedup: prevent creating multiple orgs for the same user
 * within the same serverless invocation (edge-case double-fires).
 */
const pendingCreations = new Map<string, Promise<unknown>>();

export async function ensureOrgForUser(params: EnsureOrgParams) {
  const { userId, email, name } = params;

  // 1) Check for existing membership with active org
  const membership = await prisma.user_organizations.findFirst({
    where: { userId },
    include: { Org: true },
  });

  if (membership?.Org) {
    return membership.Org;
  }

  // Clean up orphaned membership (membership exists but org was deleted)
  if (membership && !membership.Org) {
    console.warn("[ensureOrgForUser/auth] Cleaning up orphaned membership:", {
      userId,
      orphanedOrgId: membership.organizationId,
    });
    await prisma.user_organizations.delete({
      where: { id: membership.id },
    });
  }

  // 2) Fallback: check if user has orgId column directly (legacy data)
  // NOTE: Users table 'id' is often a UUID, but Clerk userId is 'user_xxx'
  // so we search by clerkUserId instead of id
  const user = await prisma.users.findFirst({
    where: {
      OR: [{ id: userId }, { clerkUserId: userId }],
    },
  });

  if (user?.orgId) {
    const org = await prisma.org.findUnique({
      where: { id: user.orgId },
    });

    if (org) {
      // Normalize: create membership row if missing
      await prisma.user_organizations.upsert({
        where: {
          userId_organizationId: {
            userId,
            organizationId: org.id,
          },
        },
        update: {},
        create: {
          userId,
          organizationId: org.id,
          role: "owner",
        },
      });
      return org;
    }
  }

  // 3) Email fallback: user row might exist with a different id (e.g. UUID vs Clerk id)
  if (email) {
    const userByEmail = await prisma.users.findFirst({
      where: { email },
    });

    if (userByEmail?.orgId && userByEmail.id !== userId) {
      const org = await prisma.org.findUnique({
        where: { id: userByEmail.orgId },
      });

      if (org) {
        console.log(
          `[ensureOrgForUser] Email fallback matched: ${email} → org ${org.id} (${org.name})`
        );
        // Create membership for the Clerk userId
        await prisma.user_organizations.upsert({
          where: {
            userId_organizationId: {
              userId,
              organizationId: org.id,
            },
          },
          update: {},
          create: {
            userId,
            organizationId: org.id,
            role: "owner",
          },
        });
        return org;
      }
    }
  }

  // 4) No valid org found → create a fresh one (with dedup guard)
  if (pendingCreations.has(userId)) {
    await pendingCreations.get(userId);
    // Re-check after dedup wait
    const retryMembership = await prisma.user_organizations.findFirst({
      where: { userId },
      include: { Org: true },
    });
    if (retryMembership?.Org) return retryMembership.Org;
  }

  const orgName = name || (email ? email.split("@")[0] : "New Workspace");

  // DETERMINISTIC clerkOrgId — prevents duplicate orgs across concurrent requests
  // Must match the pattern used by lib/org/ensureOrgForUser.ts
  const clerkOrgId = `org_${userId}`;

  const createPromise = prisma.org
    .upsert({
      where: { clerkOrgId },
      update: {},
      create: {
        id: crypto.randomUUID(),
        clerkOrgId,
        name: orgName,
        updatedAt: new Date(),
      },
    })
    .then(async (newOrg) => {
      await prisma.user_organizations.create({
        data: {
          userId,
          organizationId: newOrg.id,
          role: "owner",
        },
      });
      logger.debug(`✅ Auto-created org for user ${email || userId}: ${newOrg.id}`);
      pendingCreations.delete(userId);
      return newOrg;
    })
    .catch((err) => {
      pendingCreations.delete(userId);
      throw err;
    });

  pendingCreations.set(userId, createPromise);
  return createPromise;
}
