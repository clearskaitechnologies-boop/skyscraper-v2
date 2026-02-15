// src/lib/org/getActiveOrgContext.ts
/**
 * MASTER ORG RESOLVER - Single source of truth for org context
 * Uses Clerk orgId as primary source, falls back to user_organizations
 *
 * IMPORTANT: This resolver AUTO-REPAIRS org invariants when required=true
 * - Creates org if missing
 * - Creates membership if missing
 * - Creates BillingSettings if missing
 */

import { auth } from "@clerk/nextjs/server";

import { isBetaMode } from "@/lib/beta";
import prisma from "@/lib/prisma";

export type OrgContextResult =
  | {
      ok: true;
      userId: string;
      orgId: string; // DB UUID
      clerkOrgId: string | null;
      role: string;
      membership: any;
    }
  | {
      ok: false;
      reason: "unauthenticated" | "no-org" | "error";
      error?: string;
    };

export type OrgContextOptions = {
  /** If true, returns ok:false instead of auto-creating org */
  optional?: boolean;
  /** If true, auto-creates org when missing (default for required contexts) */
  required?: boolean;
};

/**
 * Ensure org workspace primitives exist (BillingSettings, etc.)
 * Called after org is found/created to ensure invariants
 */
async function ensureOrgPrimitives(orgId: string, userId: string): Promise<void> {
  try {
    // Ensure BillingSettings exists
    const billing = await prisma.billingSettings.findUnique({
      where: { orgId },
    });

    if (!billing) {
      await prisma.billingSettings.create({
        data: {
          id: `billing_${orgId}`,
          orgId,
          updatedAt: new Date(),
        },
      });
      console.log("[getActiveOrgContext] Created BillingSettings for org:", orgId);
    }

    // Ensure org_branding exists (raw query since it's not in Prisma schema)
    try {
      const branding = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM org_branding WHERE "orgId" = ${orgId} LIMIT 1
      `;

      if (!branding || branding.length === 0) {
        await prisma.org_branding.upsert({
          where: { orgId },
          update: {},
          create: {
            id: crypto.randomUUID(),
            orgId,
            ownerId: userId ?? orgId,
            updatedAt: new Date(),
          },
        });
        console.log("[getActiveOrgContext] Created org_branding for org:", orgId);
      }
    } catch (brandingErr: any) {
      // Non-fatal - table may not exist in all environments
      console.warn("[getActiveOrgContext] Branding setup skipped:", brandingErr.message);
    }
  } catch (err: any) {
    // Non-fatal - log but don't fail
    console.error("[getActiveOrgContext] ensureOrgPrimitives failed (non-fatal):", err.message);
  }
}

/**
 * Get active org context for the current user
 * PRIORITY ORDER:
 * 1. Clerk organization ID (if user is in a Clerk org)
 * 2. user_organizations table (personal/legacy orgs)
 * 3. Auto-create if required=true
 */
export async function getActiveOrgContext(
  options: OrgContextOptions = {}
): Promise<OrgContextResult> {
  const { optional = false, required = false } = options;

  // Get authenticated user
  let userId: string | null = null;
  let clerkOrgId: string | null = null;

  try {
    const a = await auth();
    userId = a.userId ?? null;
    clerkOrgId = a.orgId ?? null;

    console.log("[getActiveOrgContext] Clerk context:", { userId, clerkOrgId });
  } catch (err) {
    console.error("[getActiveOrgContext] Clerk auth error:", err);
    userId = null;
  }

  if (!userId) {
    return { ok: false, reason: "unauthenticated" };
  }

  // Test bypass for synthetic contexts
  if (
    process.env.TEST_AUTH_BYPASS === "1" &&
    process.env.TEST_AUTH_USER_ID &&
    process.env.TEST_AUTH_ORG_ID
  ) {
    return {
      ok: true,
      userId: process.env.TEST_AUTH_USER_ID,
      orgId: process.env.TEST_AUTH_ORG_ID,
      clerkOrgId: null,
      role: "owner",
      membership: {
        id: `test_${process.env.TEST_AUTH_ORG_ID}`,
        userId: process.env.TEST_AUTH_USER_ID,
        organizationId: process.env.TEST_AUTH_ORG_ID,
        role: "owner",
      },
    };
  }

  try {
    // PATH 1: Clerk organization exists - use it as primary source
    if (clerkOrgId) {
      console.log("[getActiveOrgContext] Using Clerk orgId:", clerkOrgId);

      // Find or create organization by clerkOrgId
      let org = await prisma.org.findUnique({
        where: { clerkOrgId },
      });

      if (!org) {
        console.log("[getActiveOrgContext] Creating new org for clerkOrgId:", clerkOrgId);

        const orgName = "My Organization";

        org = await prisma.org.upsert({
          where: { clerkOrgId },
          update: {},
          create: {
            id: crypto.randomUUID(),
            clerkOrgId,
            name: orgName,
            updatedAt: new Date(),
          },
        });
        console.log("[getActiveOrgContext] Upserted org:", org.id);
      }

      // Ensure user_organizations membership exists
      const membership = await prisma.user_organizations.upsert({
        where: {
          userId_organizationId: {
            userId,
            organizationId: org.id,
          },
        },
        create: {
          userId,
          organizationId: org.id,
          role: "owner",
        },
        update: {},
      });

      console.log("[getActiveOrgContext] Resolved org:", { dbOrgId: org.id, clerkOrgId });
      console.log("[ORG RESOLUTION]", { userId, clerkOrgId, resolvedOrgId: org.id });

      // Ensure workspace primitives exist
      await ensureOrgPrimitives(org.id, userId);

      return {
        ok: true,
        userId,
        orgId: org.id,
        clerkOrgId: org.clerkOrgId,
        role: membership.role ?? "owner",
        membership,
      };
    }

    // PATH 2: No Clerk org - check user_organizations table (personal org)
    console.log("[getActiveOrgContext] No Clerk org, checking user_organizations...");

    const memberships = await prisma.user_organizations.findMany({
      where: { userId },
      include: { Org: true },
      orderBy: { createdAt: "asc" },
    });

    // Find first membership where the org actually exists
    const validMembership = memberships.find((m) => m.organizationId && m.Org);

    if (validMembership) {
      console.log(
        "[getActiveOrgContext] Found user_organizations membership:",
        validMembership.organizationId
      );
      console.log("[ORG RESOLUTION]", {
        userId,
        clerkOrgId: validMembership.Org?.clerkOrgId ?? null,
        resolvedOrgId: validMembership.organizationId,
      });

      // Ensure workspace primitives exist
      await ensureOrgPrimitives(validMembership.organizationId, userId);

      return {
        ok: true,
        userId,
        orgId: validMembership.organizationId,
        clerkOrgId: validMembership.Org?.clerkOrgId ?? null,
        role: validMembership.role ?? "member",
        membership: validMembership,
      };
    }

    // Clean up orphaned memberships (membership exists but org was deleted)
    const orphanedMemberships = memberships.filter((m) => m.organizationId && !m.Org);
    if (orphanedMemberships.length > 0) {
      console.warn("[getActiveOrgContext] Cleaning up orphaned memberships:", {
        userId,
        orphanedCount: orphanedMemberships.length,
        orphanedOrgIds: orphanedMemberships.map((m) => m.organizationId),
      });
      await prisma.user_organizations.deleteMany({
        where: {
          userId,
          organizationId: { in: orphanedMemberships.map((m) => m.organizationId) },
        },
      });
    }

    // PATH 3: No org found - handle based on mode
    if (optional) {
      console.log("[getActiveOrgContext] Optional mode, returning no-org");
      return { ok: false, reason: "no-org" };
    }

    if (required) {
      // BETA: if user has no org, bind them to the shared demo org (if configured).
      // This prevents the "signed-in but no org" whiplash during demos.
      if (isBetaMode()) {
        const demoOrgId = process.env.DEMO_ORG_ID || process.env.BETA_DEMO_ORG_ID;
        const demoClerkOrgId =
          process.env.DEMO_ORG_CLERK_ORG_ID || process.env.BETA_DEMO_ORG_CLERK_ORG_ID;

        if (demoOrgId || demoClerkOrgId) {
          const demoOrg = await prisma.org.findUnique({
            where: demoOrgId ? { id: demoOrgId } : { clerkOrgId: demoClerkOrgId! },
          });

          if (demoOrg) {
            const demoMembership = await prisma.user_organizations.upsert({
              where: {
                userId_organizationId: {
                  userId,
                  organizationId: demoOrg.id,
                },
              },
              create: {
                userId,
                organizationId: demoOrg.id,
                role: "member",
              },
              update: {},
            });

            console.log("[getActiveOrgContext] Beta demo org bound:", {
              userId,
              demoOrgId: demoOrg.id,
              demoClerkOrgId: demoOrg.clerkOrgId,
            });
            console.log("[ORG RESOLUTION]", {
              userId,
              clerkOrgId: null,
              resolvedOrgId: demoOrg.id,
              mode: "beta-demo-bind",
            });

            // Ensure workspace primitives exist
            await ensureOrgPrimitives(demoOrg.id, userId);

            return {
              ok: true,
              userId,
              orgId: demoOrg.id,
              clerkOrgId: demoOrg.clerkOrgId,
              role: demoMembership.role ?? "member",
              membership: demoMembership,
            };
          }
        }
      }

      // Auto-create personal org for user (DETERMINISTIC key prevents duplicates)
      console.log("[getActiveOrgContext] Required mode, creating personal org for user:", userId);

      const fallbackClerkOrgId = `org_${userId}`;

      const newOrg = await prisma.org.upsert({
        where: { clerkOrgId: fallbackClerkOrgId },
        update: {},
        create: {
          id: crypto.randomUUID(),
          name: "My Organization",
          clerkOrgId: fallbackClerkOrgId,
          demoMode: true, // New personal orgs start in demo mode
          updatedAt: new Date(),
        },
      });

      const newMembership = await prisma.user_organizations.create({
        data: {
          userId,
          organizationId: newOrg.id,
          role: "owner",
        },
      });

      // Ensure workspace primitives exist
      await ensureOrgPrimitives(newOrg.id, userId);

      console.log("[getActiveOrgContext] Created personal org:", newOrg.id);

      console.log("[ORG RESOLUTION]", { userId, clerkOrgId: null, resolvedOrgId: newOrg.id });
      return {
        ok: true,
        userId,
        orgId: newOrg.id,
        clerkOrgId: null,
        role: "owner",
        membership: newMembership,
      };
    }

    return { ok: false, reason: "no-org" };
  } catch (error) {
    console.error("[getActiveOrgContext] Error:", error);
    return {
      ok: false,
      reason: "error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Default fallback config for global tools when no org exists
 */
export const GLOBAL_TOOL_DEFAULTS = {
  location: { lat: 33.4484, lng: -112.074, city: "Phoenix", state: "AZ" },
  timezone: "America/Phoenix",
  preferences: {},
};
