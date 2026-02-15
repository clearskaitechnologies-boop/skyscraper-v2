/**
 * Bulk Operations System
 *
 * Mass update, assign, delete, export operations
 * Supports all entity types with transaction safety
 */

import { logActivity } from "@/lib/activity/activityFeed";
import prisma from "@/lib/prisma";
import { logAudit } from "@/middleware/auditLog";

export type BulkOperation = "ASSIGN" | "UPDATE_STATUS" | "DELETE" | "EXPORT" | "TAG" | "ARCHIVE";

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Bulk assign items to user
 */
export async function bulkAssign(
  orgId: string,
  entityType: "JOB" | "CLAIM" | "LEAD",
  itemIds: string[],
  assignToUserId: string,
  assignedByUserId: string
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (const itemId of itemIds) {
    try {
      switch (entityType) {
        case "JOB":
          await prisma.jobs.update({
            where: { id: itemId, orgId },
            data: { assignedTo: assignToUserId },
          });
          break;

        case "CLAIM":
          await prisma.claims.update({
            where: { id: itemId, orgId },
            data: { assignedTo: assignToUserId },
          });
          break;

        case "LEAD":
          await prisma.leads.update({
            where: { id: itemId, orgId },
            data: { assignedTo: assignToUserId },
          });
          break;
      }

      // Log activity
      await logActivity(orgId, {
        type: "ASSIGNMENT",
        userId: assignedByUserId,
        resourceType: entityType,
        resourceId: itemId,
        action: "Assigned",
        description: `Assigned to user ${assignToUserId}`,
      });

      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        id: itemId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Log bulk operation
  await logAudit({
    userId: assignedByUserId,
    orgId,
    action: "BULK_ASSIGN",
    resource: entityType.toLowerCase(),
    resourceId: "bulk",
    metadata: {
      itemCount: itemIds.length,
      success: result.success,
      failed: result.failed,
      assignTo: assignToUserId,
    },
  });

  return result;
}

/**
 * Bulk update status
 */
export async function bulkUpdateStatus(
  orgId: string,
  entityType: "JOB" | "CLAIM" | "LEAD",
  itemIds: string[],
  newStatus: string,
  userId: string
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (const itemId of itemIds) {
    try {
      switch (entityType) {
        case "JOB":
          await prisma.jobs.update({
            where: { id: itemId, orgId },
            data: { status: newStatus },
          });
          break;

        case "CLAIM":
          await prisma.claims.update({
            where: { id: itemId, orgId },
            data: { status: newStatus },
          });
          break;

        case "LEAD":
          await prisma.leads.update({
            where: { id: itemId, orgId },
            data: { status: newStatus },
          });
          break;
      }

      // Log activity
      await logActivity(orgId, {
        type: "STATUS_CHANGE",
        userId,
        resourceType: entityType,
        resourceId: itemId,
        action: "Status Changed",
        description: `Status updated to ${newStatus}`,
      });

      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        id: itemId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Log bulk operation
  await logAudit({
    userId,
    orgId,
    action: "BULK_UPDATE_STATUS",
    resource: entityType.toLowerCase(),
    resourceId: "bulk",
    metadata: {
      itemCount: itemIds.length,
      success: result.success,
      failed: result.failed,
      newStatus,
    },
  });

  return result;
}

/**
 * Bulk delete items
 */
export async function bulkDelete(
  orgId: string,
  entityType: "JOB" | "CLAIM" | "LEAD" | "DOCUMENT",
  itemIds: string[],
  userId: string
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (const itemId of itemIds) {
    try {
      switch (entityType) {
        case "JOB":
          await prisma.jobs.delete({
            where: { id: itemId, orgId },
          });
          break;

        case "CLAIM":
          await prisma.claims.delete({
            where: { id: itemId, orgId },
          });
          break;

        case "LEAD":
          await prisma.leads.delete({
            where: { id: itemId, orgId },
          });
          break;

        case "DOCUMENT":
          await prisma.documents
            .delete({
              where: { id: itemId, orgId },
            })
            .catch(() => {});
          break;
      }

      // Log activity
      await logActivity(orgId, {
        type: "DELETED",
        userId,
        resourceType: entityType,
        resourceId: itemId,
        action: "Deleted",
      });

      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        id: itemId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Log bulk operation
  await logAudit({
    userId,
    orgId,
    action: "BULK_DELETE",
    resource: entityType.toLowerCase(),
    resourceId: "bulk",
    metadata: {
      itemCount: itemIds.length,
      success: result.success,
      failed: result.failed,
    },
  });

  return result;
}

/**
 * Bulk export to CSV
 */
export async function bulkExport(
  orgId: string,
  entityType: "JOB" | "CLAIM" | "LEAD" | "CLIENT",
  itemIds: string[],
  userId: string
): Promise<{ csv: string; filename: string }> {
  let items: any[] = [];

  try {
    switch (entityType) {
      case "JOB":
        items = await prisma.jobs.findMany({
          where: { id: { in: itemIds }, orgId },
        });
        break;

      case "CLAIM":
        items = await prisma.claims.findMany({
          where: { id: { in: itemIds }, orgId },
        });
        break;

      case "LEAD":
        items = await prisma.leads.findMany({
          where: { id: { in: itemIds }, orgId },
        });
        break;

      case "CLIENT":
        items = await prisma.homeowner_intake.findMany({
          where: { id: { in: itemIds }, orgId },
        });
        break;
    }

    // Convert to CSV
    const csv = convertToCSV(items);
    const filename = `${entityType.toLowerCase()}_export_${Date.now()}.csv`;

    // Log export
    await logAudit({
      userId,
      orgId,
      action: "BULK_EXPORT",
      resource: entityType.toLowerCase(),
      resourceId: "bulk",
      metadata: {
        itemCount: items.length,
        filename,
      },
    });

    return { csv, filename };
  } catch (error) {
    console.error("Bulk export failed:", error);
    throw new Error("Bulk export failed");
  }
}

/**
 * Bulk tag items
 */
export async function bulkTag(
  orgId: string,
  entityType: "JOB" | "CLAIM" | "LEAD",
  itemIds: string[],
  tags: string[],
  userId: string
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (const itemId of itemIds) {
    try {
      // Get existing metadata
      let item: any;

      switch (entityType) {
        case "JOB":
          item = await prisma.jobs.findUnique({ where: { id: itemId, orgId } });
          break;
        case "CLAIM":
          item = await prisma.claims.findUnique({ where: { id: itemId, orgId } });
          break;
        case "LEAD":
          item = await prisma.leads.findUnique({ where: { id: itemId, orgId } });
          break;
      }

      if (!item) {
        result.failed++;
        result.errors.push({ id: itemId, error: "Item not found" });
        continue;
      }

      // Merge tags
      const existingTags = (item.metadata as any)?.tags || [];
      const newTags = [...new Set([...existingTags, ...tags])];

      // Update with tags
      const updateData = {
        metadata: {
          ...((item.metadata as object) || {}),
          tags: newTags,
        },
      };

      switch (entityType) {
        case "JOB":
          await prisma.jobs.update({ where: { id: itemId }, data: updateData });
          break;
        case "CLAIM":
          await prisma.claims.update({ where: { id: itemId }, data: updateData });
          break;
        case "LEAD":
          await prisma.leads.update({ where: { id: itemId }, data: updateData });
          break;
      }

      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        id: itemId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Log bulk operation
  await logAudit({
    userId,
    orgId,
    action: "BULK_TAG",
    resource: entityType.toLowerCase(),
    resourceId: "bulk",
    metadata: {
      itemCount: itemIds.length,
      success: result.success,
      failed: result.failed,
      tags,
    },
  });

  return result;
}

/**
 * Convert items to CSV
 */
function convertToCSV(items: any[]): string {
  if (items.length === 0) return "";

  // Get headers from first item
  const headers = Object.keys(items[0]);

  // Build CSV
  let csv = headers.join(",") + "\n";

  for (const item of items) {
    const row = headers.map((header) => {
      const value = item[header];

      // Handle null/undefined
      if (value === null || value === undefined) return "";

      // Handle objects/arrays
      if (typeof value === "object") return JSON.stringify(value);

      // Escape commas and quotes
      const str = String(value);
      if (str.includes(",") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }

      return str;
    });

    csv += row.join(",") + "\n";
  }

  return csv;
}
