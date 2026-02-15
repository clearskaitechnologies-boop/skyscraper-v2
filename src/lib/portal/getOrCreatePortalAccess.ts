/**
 * Phase 3: Portal Helper - Auto-link users to claims
 * Demo behavior: First visit creates ClientPortalAccess to first claim in org
 */

import prisma from "@/lib/prisma";

export interface PortalAccessResult {
  id: string;
  userId: string;
  orgId: string;
  claimId: string;
  createdAt: Date;
}

/**
 * Get or create portal access for a user
 * Auto-links to the first claim in the org on first visit (demo mode)
 *
 * @param userId - Clerk user ID
 * @param orgId - Organization ID from safeOrgContext
 * @returns PortalAccessResult or null if no claims exist
 */
export async function getOrCreatePortalAccess(
  userId: string,
  orgId: string
): Promise<PortalAccessResult | null> {
  // Check for existing access
  const existing = await prisma.client_access.findFirst({
    where: {
      userId,
      orgId,
    },
    select: {
      id: true,
      userId: true,
      orgId: true,
      claimId: true,
      createdAt: true,
    },
  });

  if (existing && existing.userId && existing.orgId) {
    return {
      id: existing.id,
      userId: existing.userId,
      orgId: existing.orgId,
      claimId: existing.claimId,
      createdAt: existing.createdAt,
    };
  }

  // No existing access - find first claim in org
  const firstClaim = await prisma.claims.findFirst({
    where: { orgId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!firstClaim) {
    console.log(`[getOrCreatePortalAccess] No claims found for org ${orgId}`);
    return null;
  }

  // Create access record (demo auto-link behavior)
  // Note: This updates the existing ClientPortalAccess model which requires clientId
  // For demo, we'll create a temporary Client record or use a placeholder

  // Check if there's a default client for this org
  let client = await prisma.client.findFirst({
    where: { orgId },
  });

  // If no client exists, create a placeholder (this is demo mode)
  if (!client) {
    client = await prisma.client.create({
      data: {
        orgId,
        name: "Portal User",
        email: `portal-${userId.slice(0, 8)}@placeholder.local`,
        phone: null,
      },
    });
  }

  // Create portal access
  const access = await prisma.client_access.create({
    data: {
      clientId: client.id,
      userId,
      orgId,
      claimId: firstClaim.id,
      token: `portal-${Date.now()}-${crypto.randomUUID()}`,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });

  console.log(
    `[getOrCreatePortalAccess] Created access for user ${userId} to claim ${firstClaim.id}`
  );

  return {
    id: access.id,
    userId,
    orgId,
    claimId: access.claimId,
    createdAt: access.createdAt,
  };
}
