/**
 * 🚑 AUTO-HEALING ORGANIZATION MIDDLEWARE
 *
 * Self-repairing system that automatically fixes user/org issues:
 * - Missing users → Creates them
 * - No orgs → Creates new org + membership
 * - Multiple orgs → Removes duplicates
 * - Orphaned memberships → Cleans up
 * - Broken references → Repairs
 *
 * This runs on EVERY request and ensures org context is ALWAYS valid.
 */

import { ensureOrgForUser } from "@/lib/auth/ensureOrgForUser";
import { logger } from "@/lib/logger";
import { inspectOrgContext, type OrgContextReport } from "@/lib/auth/inspectOrgContext";
import prisma from "@/lib/prisma";

export interface HealResult {
  healed: boolean;
  actions: string[];
  finalOrgId?: string;
  report: OrgContextReport;
}

/**
 * Auto-heal organization context
 * Runs inspector, detects issues, fixes them automatically
 * Returns final healthy state
 */
export async function autoHealOrg(): Promise<HealResult> {
  const actions: string[] = [];
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    const report = await inspectOrgContext();

    // Already healthy - no action needed
    if (report.status === "healthy") {
      console.log("[AutoHeal] ✅ Org context healthy:", {
        userId: report.userId,
        orgId: report.orgId,
        email: report.email,
      });
      return {
        healed: actions.length > 0,
        actions,
        finalOrgId: report.orgId,
        report,
      };
    }

    // Handle each issue type
    switch (report.status) {
      case "no-clerk-user":
        // Can't heal - user needs to sign in
        logger.debug("[AutoHeal] ⚠️ No Clerk user - cannot heal");
        return {
          healed: false,
          actions,
          report,
        };

      case "db-user-missing":
        logger.debug("[AutoHeal] 🔧 Creating missing database user...");

        if (!report.email || !report.userId) {
          throw new Error("Cannot create user without email/userId");
        }

        // 🔒 ORG-FIRST: ensure we have a real org before creating the user
        const orgForNewUser = await ensureOrgForUser({
          userId: report.userId,
          email: report.email,
        });

        await prisma.users.create({
          data: {
            id: report.userId,
            clerkUserId: report.userId,
            email: report.email,
            name: report.email.split("@")[0],
            role: "USER",
            orgId: orgForNewUser.id,
          },
        });

        actions.push("created-db-user");
        continue; // Re-run inspection

      case "no-org":
        logger.debug("[AutoHeal] 🏢 No org found - creating new organization...");

        if (!report.userId) {
          throw new Error("Cannot create org without userId");
        }

        // Use ensureOrgForUser to create org + membership atomically
        const org = await ensureOrgForUser(report.userId);

        actions.push("created-org");
        actions.push("created-membership");
        logger.debug("[AutoHeal] ✅ Created org:", org.id);
        continue; // Re-run inspection

      case "membership-broken":
        logger.debug("[AutoHeal] 🔗 Fixing broken membership (legacy orgId)...");

        if (!report.userId || !report.orgId) {
          throw new Error("Cannot fix membership without userId/orgId");
        }

        // Check if org exists
        const legacyOrg = await prisma.org.findUnique({
          where: { id: report.orgId },
        });

        if (legacyOrg) {
          // Create membership for existing org
          await prisma.user_organizations.create({
            data: {
              id: `uo_${report.orgId}_${report.userId}_${Date.now()}`,
              userId: report.userId,
              organizationId: report.orgId,
              role: "owner",
              createdAt: new Date(),
            },
          });
          actions.push("migrated-legacy-membership");
        } else {
          // Legacy org doesn't exist - create new
          const newOrg = await ensureOrgForUser(report.userId);
          actions.push("created-org-for-broken-legacy");
        }

        continue; // Re-run inspection

      case "multiple-orgs":
        logger.debug("[AutoHeal] 🧹 Cleaning duplicate org memberships...");

        if (!report.orgIds || report.orgIds.length < 2) {
          throw new Error("multiple-orgs status but no orgIds");
        }

        // Keep the first org, delete the rest
        const keepOrgId = report.orgIds[0];
        const deleteOrgIds = report.orgIds.slice(1);

        await prisma.user_organizations.deleteMany({
          where: {
            userId: report.userId,
            organizationId: { in: deleteOrgIds },
          },
        });

        actions.push(`removed-${deleteOrgIds.length}-duplicate-memberships`);
        logger.debug("[AutoHeal] ✅ Kept org:", keepOrgId, "Removed:", deleteOrgIds.length);
        continue; // Re-run inspection

      case "org-missing":
        logger.debug("[AutoHeal] 🗑️ Cleaning orphaned membership...");

        // Delete the broken membership
        await prisma.user_organizations.deleteMany({
          where: {
            userId: report.userId,
            organizationId: report.orgId,
          },
        });

        actions.push("deleted-orphaned-membership");
        continue; // Re-run inspection (will trigger no-org, which creates new)

      default:
        console.error("[AutoHeal] ❌ Unknown status:", report.status);
        return {
          healed: false,
          actions,
          report,
        };
    }
  }

  // Max attempts reached
  logger.error("[AutoHeal] ❌ Max heal attempts reached");
  const finalReport = await inspectOrgContext();
  return {
    healed: false,
    actions,
    report: finalReport,
  };
}

/**
 * Get org ID after auto-healing
 * Guarantees valid orgId or throws error
 */
export async function getHealedOrgId(): Promise<string> {
  const result = await autoHealOrg();

  if (result.finalOrgId) {
    return result.finalOrgId;
  }

  throw new Error(
    `Cannot get orgId - healing failed. Status: ${result.report.status}, Actions: ${result.actions.join(", ")}`
  );
}
