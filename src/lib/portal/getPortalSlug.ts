/**
 * Portal Slug Resolver
 *
 * GUARANTEES a slug exists for every user accessing the client portal.
 * NEVER returns null. Auto-creates client if missing.
 *
 * This is the foundation that makes the portal unbreakable.
 */

import { createId } from "@paralleldrive/cuid2";

import prisma from "@/lib/prisma";

interface PortalSlugResult {
  slug: string;
  clientId: string;
  orgId: string | null;
}

/**
 * Get or create a portal slug for the given user
 *
 * @param userId - Clerk userId
 * @param email - User email (fallback if userId not found)
 * @param orgId - Optional org context (for multi-org scenarios)
 * @returns PortalSlugResult with guaranteed slug
 */
export async function getPortalSlug(
  userId: string,
  email?: string,
  orgId?: string
): Promise<PortalSlugResult> {
  // Try to find existing client by userId (use findFirst since userId is not unique)
  let client = await prisma.client.findFirst({
    where: { userId },
    select: { id: true, slug: true, orgId: true },
  });

  // If not found by userId, try by email
  if (!client && email) {
    client = await prisma.client.findFirst({
      where: { email },
      select: { id: true, slug: true, orgId: true },
    });

    // If found by email, link the userId
    if (client) {
      client = await prisma.client.update({
        where: { id: client.id },
        data: { userId },
        select: { id: true, slug: true, orgId: true },
      });
    }
  }

  // If still not found, create a new client
  if (!client) {
    // Generate slug with "c-" prefix
    const slug = `c-${createId()}`;

    // Determine orgId - use provided orgId, or find/create a default org for self-service clients
    let finalOrgId: string = orgId || "";

    if (!finalOrgId) {
      // Look for existing default self-service org, or create one
      // Use a unique clerkOrgId that won't conflict
      const selfServiceClerkOrgId = "clerk_self_service_clients";

      const defaultOrg = await prisma.org.findFirst({
        where: {
          OR: [{ id: "self-service-clients" }, { clerkOrgId: selfServiceClerkOrgId }],
        },
      });

      if (defaultOrg) {
        finalOrgId = defaultOrg.id;
      } else {
        // Create default org for self-service clients
        try {
          const newOrg = await prisma.org.create({
            data: {
              id: "self-service-clients",
              name: "Self-Service Clients",
              clerkOrgId: selfServiceClerkOrgId,
              updatedAt: new Date(),
            },
          });
          finalOrgId = newOrg.id;
        } catch (createError: any) {
          // If org creation fails due to unique constraint, find it
          if (createError.code === "P2002") {
            const existingOrg = await prisma.org.findFirst({
              where: { id: "self-service-clients" },
            });
            if (existingOrg) {
              finalOrgId = existingOrg.id;
            } else {
              throw new Error("Failed to create or find self-service org");
            }
          } else {
            throw createError;
          }
        }
      }
    }

    client = await prisma.client.create({
      data: {
        slug,
        userId,
        email: email || `user-${userId}@example.com`, // Fallback email
        name: email?.split("@")[0] || "Client",
        orgId: finalOrgId,
        category: "Homeowner", // Default category
      },
      select: { id: true, slug: true, orgId: true },
    });
  }

  // Ensure slug exists (for legacy clients without slugs)
  if (!client.slug) {
    const slug = `c-${createId()}`;
    client = await prisma.client.update({
      where: { id: client.id },
      data: { slug },
      select: { id: true, slug: true, orgId: true },
    });
  }

  return {
    slug: client.slug!,
    clientId: client.id,
    orgId: client.orgId,
  };
}

/**
 * Get client by slug
 *
 * @param slug - Client portal slug (e.g., "c-xxxxx")
 * @returns Client or null if not found
 */
export async function getClientBySlug(slug: string) {
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) return null;

  let org = null;
  if (client.orgId && client.orgId !== "self-service-clients") {
    try {
      org = await prisma.org.findUnique({
        where: { id: client.orgId },
        select: { id: true, name: true, brandLogoUrl: true },
      });
    } catch (error) {
      console.log("[getClientBySlug] Org fetch failed (non-critical):", error);
    }
  }

  return { ...client, org };
}

/**
 * Validate that a slug belongs to the current user
 *
 * @param slug - Client portal slug
 * @param userId - Clerk userId
 * @returns true if slug belongs to user, false otherwise
 */
export async function validateSlugOwnership(slug: string, userId: string): Promise<boolean> {
  const client = await prisma.client.findUnique({
    where: { slug },
    select: { userId: true },
  });

  return client?.userId === userId;
}
