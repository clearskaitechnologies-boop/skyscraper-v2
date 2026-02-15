/**
 * Organization Suspension & Deactivation
 *
 * Allows admins to suspend orgs for non-payment, violations, or deactivation
 * Gracefully blocks access while preserving data
 */

import prisma from "@/lib/prisma";

export type SuspensionReason =
  | "NON_PAYMENT"
  | "TERMS_VIOLATION"
  | "SECURITY_CONCERN"
  | "USER_REQUESTED"
  | "ADMIN_ACTION"
  | "OTHER";

export interface OrgStatus {
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: SuspensionReason;
  suspendedAt?: Date;
  suspendedBy?: string;
  suspensionNote?: string;
  canReactivate: boolean;
}

/**
 * Suspend organization
 */
export async function suspendOrg(
  orgId: string,
  reason: SuspensionReason,
  suspendedBy: string,
  note?: string
): Promise<void> {
  try {
    await prisma.org
      .update({
        where: { id: orgId },
        data: {
          status: "SUSPENDED",
          suspensionReason: reason,
          suspendedAt: new Date(),
          suspendedBy,
          suspensionNote: note,
        },
      })
      .catch(() => {
        // Fallback if columns don't exist
        console.warn("⚠️ Org suspension columns not found - using metadata");
        return prisma.org.update({
          where: { id: orgId },
          data: {
            metadata: {
              suspended: true,
              suspensionReason: reason,
              suspendedAt: new Date().toISOString(),
              suspendedBy,
              suspensionNote: note,
            },
          },
        });
      });

    // Log suspension event
    console.log(`🚫 Organization suspended: ${orgId} (Reason: ${reason})`);
  } catch (error) {
    console.error("Failed to suspend org:", error);
    throw new Error("Failed to suspend organization");
  }
}

/**
 * Reactivate organization
 */
export async function reactivateOrg(orgId: string, reactivatedBy: string): Promise<void> {
  try {
    await prisma.org
      .update({
        where: { id: orgId },
        data: {
          status: "ACTIVE",
          suspensionReason: null,
          suspendedAt: null,
          suspendedBy: null,
          suspensionNote: null,
          reactivatedAt: new Date(),
          reactivatedBy,
        },
      })
      .catch(() => {
        // Fallback
        return prisma.org.update({
          where: { id: orgId },
          data: {
            metadata: {
              suspended: false,
              reactivatedAt: new Date().toISOString(),
              reactivatedBy,
            },
          },
        });
      });

    console.log(`✅ Organization reactivated: ${orgId}`);
  } catch (error) {
    console.error("Failed to reactivate org:", error);
    throw new Error("Failed to reactivate organization");
  }
}

/**
 * Check if org is suspended
 */
export async function isOrgSuspended(orgId: string): Promise<boolean> {
  try {
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: {
        status: true,
        metadata: true,
      },
    });

    if (!org) return false;

    // Check status field
    if (org.status === "SUSPENDED") return true;

    // Check metadata fallback
    const metadata = org.metadata as any;
    return metadata?.suspended === true;
  } catch {
    return false;
  }
}

/**
 * Get org status
 */
export async function getOrgStatus(orgId: string): Promise<OrgStatus> {
  try {
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: {
        status: true,
        suspensionReason: true,
        suspendedAt: true,
        suspendedBy: true,
        suspensionNote: true,
        metadata: true,
      },
    });

    if (!org) {
      return {
        isActive: false,
        isSuspended: false,
        canReactivate: false,
      };
    }

    const isSuspended = org.status === "SUSPENDED" || (org.metadata as any)?.suspended === true;

    return {
      isActive: !isSuspended,
      isSuspended,
      suspensionReason: org.suspensionReason as SuspensionReason,
      suspendedAt: org.suspendedAt || undefined,
      suspendedBy: org.suspendedBy || undefined,
      suspensionNote: org.suspensionNote || undefined,
      canReactivate: isSuspended && org.suspensionReason !== "TERMS_VIOLATION",
    };
  } catch (error) {
    console.error("Failed to get org status:", error);
    return {
      isActive: true,
      isSuspended: false,
      canReactivate: false,
    };
  }
}

/**
 * Middleware to enforce org suspension
 */
export async function enforceOrgActive(orgId: string): Promise<void> {
  const status = await getOrgStatus(orgId);

  if (status.isSuspended) {
    throw new Error(
      `Organization suspended: ${status.suspensionReason || "UNKNOWN"}. ` +
        `Please contact support for assistance.`
    );
  }
}

/**
 * Deactivate org (soft delete with data retention)
 */
export async function deactivateOrg(
  orgId: string,
  deactivatedBy: string,
  retentionDays: number = 90
): Promise<void> {
  try {
    const deleteAt = new Date();
    deleteAt.setDate(deleteAt.getDate() + retentionDays);

    await prisma.org
      .update({
        where: { id: orgId },
        data: {
          status: "DEACTIVATED",
          deactivatedAt: new Date(),
          deactivatedBy,
          scheduledDeletionAt: deleteAt,
        },
      })
      .catch(() => {
        // Fallback
        return prisma.org.update({
          where: { id: orgId },
          data: {
            metadata: {
              deactivated: true,
              deactivatedAt: new Date().toISOString(),
              deactivatedBy,
              scheduledDeletionAt: deleteAt.toISOString(),
            },
          },
        });
      });

    console.log(`🗑️ Organization deactivated: ${orgId} (Delete on: ${deleteAt.toISOString()})`);
  } catch (error) {
    console.error("Failed to deactivate org:", error);
    throw new Error("Failed to deactivate organization");
  }
}

/**
 * Permanently delete org data
 */
export async function permanentlyDeleteOrg(orgId: string): Promise<void> {
  console.warn(`⚠️ PERMANENT DELETION: ${orgId}`);

  try {
    // Delete all org data (cascade)
    await prisma.$transaction([
      prisma.claims.deleteMany({ where: { orgId } }),
      prisma.leads.deleteMany({ where: { orgId } }),
      prisma.contacts.deleteMany({ where: { orgId } }),
      prisma.user_organizations.deleteMany({ where: { organizationId } }),
      prisma.org.delete({ where: { id: orgId } }),
    ]);

    console.log(`🗑️ Organization permanently deleted: ${orgId}`);
  } catch (error) {
    console.error("Failed to permanently delete org:", error);
    throw new Error("Failed to permanently delete organization");
  }
}

/**
 * Get orgs scheduled for deletion
 */
export async function getOrgsScheduledForDeletion(): Promise<any[]> {
  try {
    const now = new Date();

    return await prisma.org
      .findMany({
        where: {
          status: "DEACTIVATED",
          scheduledDeletionAt: {
            lte: now,
          },
        },
        select: {
          id: true,
          name: true,
          deactivatedAt: true,
          scheduledDeletionAt: true,
        },
      })
      .catch(() => []);
  } catch {
    return [];
  }
}

/**
 * Cleanup deleted orgs (run daily)
 */
export async function cleanupDeletedOrgs(): Promise<number> {
  const orgsToDelete = await getOrgsScheduledForDeletion();

  let deleted = 0;
  for (const org of orgsToDelete) {
    try {
      await permanentlyDeleteOrg(org.id);
      deleted++;
    } catch (error) {
      console.error(`Failed to delete org ${org.id}:`, error);
    }
  }

  return deleted;
}
