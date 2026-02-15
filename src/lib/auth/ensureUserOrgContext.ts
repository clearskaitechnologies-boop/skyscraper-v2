/**
 * ============================================================================
 * UNIFIED ORG CONTEXT HELPER
 * ============================================================================
 *
 * THE SINGLE SOURCE OF TRUTH for orgId resolution.
 *
 * This function GUARANTEES that any authenticated user has:
 * 1. A valid organization record
 * 2. A user_organizations membership linking them
 * 3. A stable orgId that never changes
 *
 * REPLACES ALL INCONSISTENT ORG LOGIC:
 * - ❌ `user.publicMetadata.orgId || userId` (unsafe fallback)
 * - ❌ `body.orgId` (trusting client input)
 * - ❌ Custom org creation in individual APIs
 *
 * USE THIS EVERYWHERE:
 * - All write APIs (claims, leads, branding, trades, etc.)
 * - App layout (ensure org exists on first load)
 * - safeOrgContext (internal helper)
 *
 * ============================================================================
 */

import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import { ensureOrgForUser } from "./ensureOrgForUser";

export interface UserOrgContext {
  userId: string;
  orgId: string;
  role: string;
  organizationName: string;
  isNewOrg: boolean;
}

/**
 * Ensure user has valid org context - THE CANONICAL HELPER
 *
 * @param forceUserId - Optional userId override (for server components)
 * @returns UserOrgContext with guaranteed valid orgId
 * @throws Error if user is not authenticated
 */
export async function ensureUserOrgContext(forceUserId?: string): Promise<UserOrgContext> {
  // Get userId from Clerk auth
  let userId: string | null = forceUserId || null;

  if (!userId) {
    const { userId: authUserId } = await auth();
    userId = authUserId;
  }

  if (!userId) {
    throw new Error("[ensureUserOrgContext] User not authenticated");
  }

  // Use ensureOrgForUser helper to guarantee valid org + membership
  const org = await ensureOrgForUser({ userId });

  // Check for user_organizations membership to get role
  const membership = await prisma.user_organizations.findFirst({
    where: {
      userId,
      organizationId: org.id,
    },
  });

  return {
    userId,
    orgId: org.id,
    role: membership?.role || "owner",
    organizationName: org.name || "My Organization",
    isNewOrg: false, // ensureOrgForUser handles creation internally
  };
}

/**
 * Get org context without auto-creating (read-only check)
 * Use when you need to check if user has org but don't want to create one
 */
export async function getUserOrgContextReadOnly(userId: string): Promise<UserOrgContext | null> {
  const membership = await prisma.user_organizations.findFirst({
    where: { userId },
    include: {
      Org: true,
    },
  });

  if (!membership?.Org) {
    return null;
  }

  return {
    userId,
    orgId: membership.organizationId,
    role: membership.role || "member",
    organizationName: membership.Org.name || "My Organization",
    isNewOrg: false,
  };
}

/**
 * Get orgId quickly (throws if none exists)
 * Use in APIs where you KNOW user should have org
 */
export async function requireOrgId(userId?: string): Promise<string> {
  const ctx = await ensureUserOrgContext(userId);
  return ctx.orgId;
}
