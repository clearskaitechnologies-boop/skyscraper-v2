/**
 * Audit Trail System
 *
 * Complete audit logging with search, filtering, compliance reports
 * Track all user actions for security, compliance, and debugging
 */

import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string;
  orgId: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "LOGIN"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "EXPORT"
  | "IMPORT"
  | "SHARE"
  | "APPROVE"
  | "REJECT"
  | "ASSIGN";

export type ResourceType =
  | "CLAIM"
  | "JOB"
  | "TASK"
  | "DOCUMENT"
  | "USER"
  | "ORGANIZATION"
  | "PAYMENT"
  | "REPORT"
  | "SETTINGS";

/** Where-clause filter for searching audit logs */
interface AuditLogFilter {
  orgId: string;
  action?: AuditAction | { in: AuditAction[] };
  resourceType?: ResourceType | { in: ResourceType[] };
  resourceId?: string;
  userId?: string;
  timestamp?: { gte?: Date; lte?: Date };
  OR?: Array<{ resourceId?: { contains: string } }>;
}

/** Prisma audit log result with joined user data */
interface AuditLogWithUser {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string;
  orgId: string;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
  user: { id: string; firstName: string; lastName: string; email?: string };
}

/**
 * Log audit event
 */
export async function logAuditEvent(params: {
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  userId: string;
  orgId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuditLog> {
  try {
    const log = await prisma.auditLogs.create({
      data: {
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        userId: params.userId,
        orgId: params.orgId,
        metadata: params.metadata || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date(),
      },
    });

    return log as unknown as AuditLog;
  } catch (error) {
    logger.error("Failed to log audit event:", error);
    throw error;
  }
}

/**
 * Search audit logs
 */
export async function searchAuditLogs(params: {
  orgId: string;
  action?: AuditAction | AuditAction[];
  resourceType?: ResourceType | ResourceType[];
  resourceId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: AuditLogFilter = {
      orgId: params.orgId,
    };

    if (params.action) {
      where.action = Array.isArray(params.action) ? { in: params.action } : params.action;
    }

    if (params.resourceType) {
      where.resourceType = Array.isArray(params.resourceType)
        ? { in: params.resourceType }
        : params.resourceType;
    }

    if (params.resourceId) {
      where.resourceId = params.resourceId;
    }

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.startDate || params.endDate) {
      where.timestamp = {};
      if (params.startDate) {
        where.timestamp.gte = params.startDate;
      }
      if (params.endDate) {
        where.timestamp.lte = params.endDate;
      }
    }

    // Search in metadata if provided
    if (params.search) {
      where.OR = [
        { resourceId: { contains: params.search } },
        // Add metadata search if supported by DB
      ];
    }

    // Execute queries
    const [logs, total] = await Promise.all([
      prisma.auditLogs.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLogs.count({ where }),
    ]);

    return {
      logs: logs as unknown as AuditLog[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error("Failed to search audit logs:", error);
    return {
      logs: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

/**
 * Get resource audit history
 */
export async function getResourceHistory(
  orgId: string,
  resourceType: ResourceType,
  resourceId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  try {
    const logs = await prisma.auditLogs.findMany({
      where: {
        orgId,
        resourceType,
        resourceId,
      },
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return logs as unknown as AuditLog[];
  } catch {
    return [];
  }
}

/**
 * Get user activity
 */
export async function getUserActivity(
  orgId: string,
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalActions: number;
  actionBreakdown: Record<AuditAction, number>;
  recentActions: AuditLog[];
}> {
  try {
    const where: { orgId: string; userId: string; timestamp?: { gte?: Date; lte?: Date } } = {
      orgId,
      userId,
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const logs = await prisma.auditLogs.findMany({
      where,
      orderBy: { timestamp: "desc" },
    });

    // Count actions
    const actionBreakdown: Record<string, number> = {};
    for (const log of logs) {
      actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
    }

    return {
      totalActions: logs.length,
      actionBreakdown: actionBreakdown as Record<AuditAction, number>,
      recentActions: logs.slice(0, 20) as unknown as AuditLog[],
    };
  } catch {
    return {
      totalActions: 0,
      actionBreakdown: {} as Record<AuditAction, number>,
      recentActions: [],
    };
  }
}

/**
 * Generate compliance report
 */
export async function generateComplianceReport(
  orgId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalActions: number;
  actionsByType: Record<AuditAction, number>;
  actionsByUser: Array<{ userId: string; count: number }>;
  actionsByResource: Record<ResourceType, number>;
  dataAccessEvents: number;
  dataExportEvents: number;
  securityEvents: number;
  highRiskActions: AuditLog[];
}> {
  try {
    const logs = await prisma.auditLogs.findMany({
      where: {
        orgId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Calculate statistics
    const actionsByType: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const resourceCounts: Record<string, number> = {};
    let dataAccessCount = 0;
    let dataExportCount = 0;
    let securityEventCount = 0;

    const highRiskActions: AuditLog[] = [];
    const highRiskActionTypes = ["DELETE", "EXPORT", "PASSWORD_CHANGE", "SHARE"];

    for (const log of logs) {
      // Action type counts
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;

      // User counts
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;

      // Resource counts
      resourceCounts[log.resourceType] = (resourceCounts[log.resourceType] || 0) + 1;

      // Data access
      if (log.action === "VIEW" || log.action === "EXPORT") {
        dataAccessCount++;
      }

      // Data export
      if (log.action === "EXPORT") {
        dataExportCount++;
      }

      // Security events
      if (["LOGIN", "LOGOUT", "PASSWORD_CHANGE"].includes(log.action)) {
        securityEventCount++;
      }

      // High risk actions
      if (highRiskActionTypes.includes(log.action)) {
        highRiskActions.push(log as unknown as AuditLog);
      }
    }

    // Sort user counts
    const actionsByUser = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalActions: logs.length,
      actionsByType: actionsByType as Record<AuditAction, number>,
      actionsByUser,
      actionsByResource: resourceCounts as Record<ResourceType, number>,
      dataAccessEvents: dataAccessCount,
      dataExportEvents: dataExportCount,
      securityEvents: securityEventCount,
      highRiskActions: highRiskActions.slice(0, 50),
    };
  } catch (error) {
    logger.error("Failed to generate compliance report:", error);
    throw error;
  }
}

/**
 * Detect suspicious activity
 */
export async function detectSuspiciousActivity(
  orgId: string,
  lookbackHours: number = 24
): Promise<{
  suspiciousEvents: Array<{
    type: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    description: string;
    logs: AuditLog[];
  }>;
}> {
  try {
    const startDate = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

    const logs = await prisma.auditLogs.findMany({
      where: {
        orgId,
        timestamp: { gte: startDate },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const suspiciousEvents: Array<{
      type: string;
      severity: "LOW" | "MEDIUM" | "HIGH";
      description: string;
      logs: AuditLog[];
    }> = [];

    // Detect rapid deletions (>5 in 1 hour)
    const deletions = logs.filter((l) => l.action === "DELETE");
    const userDeletions: Record<string, AuditLog[]> = {};

    for (const log of deletions) {
      if (!userDeletions[log.userId]) {
        userDeletions[log.userId] = [];
      }
      userDeletions[log.userId].push(log as unknown as AuditLog);
    }

    for (const [userId, userLogs] of Object.entries(userDeletions)) {
      if (userLogs.length >= 5) {
        suspiciousEvents.push({
          type: "RAPID_DELETIONS",
          severity: "HIGH",
          description: `User deleted ${userLogs.length} items in ${lookbackHours} hours`,
          logs: userLogs,
        });
      }
    }

    // Detect bulk exports
    const exports = logs.filter((l) => l.action === "EXPORT");
    if (exports.length >= 3) {
      suspiciousEvents.push({
        type: "BULK_EXPORT",
        severity: "MEDIUM",
        description: `${exports.length} export operations detected`,
        logs: exports,
      });
    }

    // Detect access from multiple IPs
    const userIPs: Record<string, Set<string>> = {};
    for (const log of logs) {
      if (log.ipAddress) {
        if (!userIPs[log.userId]) {
          userIPs[log.userId] = new Set();
        }
        userIPs[log.userId].add(log.ipAddress);
      }
    }

    for (const [userId, ips] of Object.entries(userIPs)) {
      if (ips.size >= 3) {
        const userLogs = logs.filter((l) => l.userId === userId);
        suspiciousEvents.push({
          type: "MULTIPLE_IP_ADDRESSES",
          severity: "MEDIUM",
          description: `User accessed from ${ips.size} different IP addresses`,
          logs: userLogs as unknown as AuditLog[],
        });
      }
    }

    return { suspiciousEvents };
  } catch (error) {
    logger.error("Failed to detect suspicious activity:", error);
    return { suspiciousEvents: [] };
  }
}

/**
 * Export audit logs
 */
export async function exportAuditLogs(
  orgId: string,
  startDate: Date,
  endDate: Date,
  format: "csv" | "json" = "csv"
): Promise<string> {
  try {
    const logs = await prisma.auditLogs.findMany({
      where: {
        orgId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (format === "json") {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = [
      "Timestamp",
      "Action",
      "Resource Type",
      "Resource ID",
      "User",
      "IP Address",
      "User Agent",
    ];

    const rows = (logs as unknown as AuditLogWithUser[]).map((log) => [
      log.timestamp.toISOString(),
      log.action,
      log.resourceType,
      log.resourceId,
      `${log.user.firstName} ${log.user.lastName}`,
      log.ipAddress || "",
      log.userAgent || "",
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  } catch (error) {
    logger.error("Failed to export audit logs:", error);
    throw error;
  }
}

/**
 * Cleanup old audit logs
 */
export async function cleanupOldAuditLogs(
  orgId: string,
  retentionDays: number = 365
): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const result = await prisma.auditLogs.deleteMany({
      where: {
        orgId,
        timestamp: { lt: cutoffDate },
      },
    });

    return result.count;
  } catch {
    return 0;
  }
}
