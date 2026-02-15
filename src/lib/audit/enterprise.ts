/**
 * TASK 128: ENTERPRISE AUDIT TRAILS
 *
 * Comprehensive audit logging with compliance and forensics.
 */

import prisma from "@/lib/prisma";

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "PERMISSION_GRANTED"
  | "PERMISSION_REVOKED"
  | "DATA_ACCESSED"
  | "DATA_MODIFIED"
  | "DATA_DELETED"
  | "CONFIG_CHANGED"
  | "SECURITY_EVENT"
  | "COMPLIANCE_EVENT";

export type AuditSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface AuditEntry {
  id: string;
  tenantId: string;
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  severity: AuditSeverity;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface AuditFilter {
  tenantId: string;
  userId?: string;
  actions?: AuditAction[];
  severities?: AuditSeverity[];
  resources?: string[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: {
  tenantId: string;
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  severity?: AuditSeverity;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<string> {
  const entry = await prisma.auditLog.create({
    data: {
      tenantId: data.tenantId,
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      severity: data.severity || "INFO",
      details: (data.details || {}) as any,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: new Date(),
    } as any,
  });

  // Check for security alerts
  if (data.severity === "CRITICAL" || data.action === "SECURITY_EVENT") {
    await triggerSecurityAlert(entry.id);
  }

  return entry.id;
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filter: AuditFilter): Promise<{
  entries: AuditEntry[];
  total: number;
}> {
  const where: any = {
    tenantId: filter.tenantId,
  };

  if (filter.userId) {
    where.userId = filter.userId;
  }

  if (filter.actions && filter.actions.length > 0) {
    where.action = { in: filter.actions };
  }

  if (filter.severities && filter.severities.length > 0) {
    where.severity = { in: filter.severities };
  }

  if (filter.resources && filter.resources.length > 0) {
    where.resource = { in: filter.resources };
  }

  if (filter.startDate || filter.endDate) {
    where.timestamp = {};
    if (filter.startDate) where.timestamp.gte = filter.startDate;
    if (filter.endDate) where.timestamp.lte = filter.endDate;
  }

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: filter.limit || 100,
      skip: filter.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    entries: entries as any,
    total,
  };
}

/**
 * Get audit statistics
 */
export async function getAuditStats(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalEvents: number;
  byAction: Record<string, number>;
  bySeverity: Record<string, number>;
  byUser: { userId: string; count: number }[];
  securityEvents: number;
}> {
  const entries = await prisma.auditLog.findMany({
    where: {
      tenantId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const byAction: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const userCounts: Record<string, number> = {};
  let securityEvents = 0;

  for (const entry of entries) {
    // Count by action
    byAction[entry.action] = (byAction[entry.action] || 0) + 1;

    // Count by severity
    bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1;

    // Count by user
    if (entry.userId) {
      userCounts[entry.userId] = (userCounts[entry.userId] || 0) + 1;
    }

    // Count security events
    if (entry.action === "SECURITY_EVENT" || entry.severity === "CRITICAL") {
      securityEvents++;
    }
  }

  const byUser = Object.entries(userCounts)
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEvents: entries.length,
    byAction,
    bySeverity,
    byUser,
    securityEvents,
  };
}

/**
 * Export audit logs
 */
export async function exportAuditLogs(
  filter: AuditFilter,
  format: "JSON" | "CSV" | "PDF" = "JSON"
): Promise<string> {
  const { entries } = await getAuditLogs({ ...filter, limit: 10000 });

  switch (format) {
    case "JSON":
      return JSON.stringify(entries, null, 2);

    case "CSV":
      return convertToCSV(entries);

    case "PDF":
      return await generatePDFReport(entries);

    default:
      return JSON.stringify(entries);
  }
}

/**
 * Convert to CSV
 */
function convertToCSV(entries: AuditEntry[]): string {
  const headers = [
    "Timestamp",
    "User ID",
    "Action",
    "Resource",
    "Resource ID",
    "Severity",
    "IP Address",
  ];

  const rows = entries.map((e) => [
    e.timestamp.toISOString(),
    e.userId || "",
    e.action,
    e.resource,
    e.resourceId || "",
    e.severity,
    e.ipAddress || "",
  ]);

  return [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join(
    "\n"
  );
}

/**
 * Generate PDF report
 */
async function generatePDFReport(entries: AuditEntry[]): Promise<string> {
  // TODO: Implement PDF generation
  return "PDF report placeholder";
}

/**
 * Trigger security alert
 */
async function triggerSecurityAlert(auditLogId: string): Promise<void> {
  const entry = await prisma.auditLog.findUnique({
    where: { id: auditLogId },
  });

  if (!entry) return;

  // TODO: Send alert via email/SMS/webhook
  console.log("Security alert triggered:", entry);
}

/**
 * Get user activity timeline
 */
export async function getUserActivityTimeline(
  userId: string,
  tenantId: string,
  hours: number = 24
): Promise<AuditEntry[]> {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hours);

  const entries = await prisma.auditLog.findMany({
    where: {
      tenantId,
      userId,
      timestamp: { gte: startDate },
    },
    orderBy: { timestamp: "desc" },
  });

  return entries as any;
}

/**
 * Get resource access history
 */
export async function getResourceAccessHistory(
  tenantId: string,
  resource: string,
  resourceId: string
): Promise<AuditEntry[]> {
  const entries = await prisma.auditLog.findMany({
    where: {
      tenantId,
      resource,
      resourceId,
    },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return entries as any;
}

/**
 * Detect anomalies
 */
export async function detectAnomalies(tenantId: string): Promise<{
  anomalies: AuditEntry[];
  suspiciousUsers: string[];
}> {
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);

  const entries = await prisma.auditLog.findMany({
    where: {
      tenantId,
      timestamp: { gte: last24Hours },
    },
  });

  const userActivity: Record<string, number> = {};
  const anomalies: AuditEntry[] = [];

  for (const entry of entries) {
    if (entry.userId) {
      userActivity[entry.userId] = (userActivity[entry.userId] || 0) + 1;
    }

    // Detect suspicious patterns
    if (entry.action === "DATA_DELETED" && entry.severity === "CRITICAL") {
      anomalies.push(entry as any);
    }

    // Multiple failed login attempts
    if (entry.action === "USER_LOGIN" && entry.details.success === false) {
      anomalies.push(entry as any);
    }
  }

  // Find users with unusually high activity
  const avgActivity =
    Object.values(userActivity).reduce((sum, count) => sum + count, 0) /
    Object.keys(userActivity).length;

  const suspiciousUsers = Object.entries(userActivity)
    .filter(([_, count]) => count > avgActivity * 3)
    .map(([userId]) => userId);

  return {
    anomalies,
    suspiciousUsers,
  };
}

/**
 * Get compliance report
 */
export async function getComplianceReport(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalEvents: number;
  criticalEvents: number;
  dataAccess: number;
  dataModifications: number;
  securityEvents: number;
  complianceScore: number;
}> {
  const entries = await prisma.auditLog.findMany({
    where: {
      tenantId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const criticalEvents = entries.filter((e) => e.severity === "CRITICAL").length;
  const dataAccess = entries.filter((e) => e.action === "DATA_ACCESSED").length;
  const dataModifications = entries.filter((e) => e.action === "DATA_MODIFIED").length;
  const securityEvents = entries.filter((e) => e.action === "SECURITY_EVENT").length;

  // Calculate compliance score (100 - deductions for issues)
  let complianceScore = 100;
  complianceScore -= criticalEvents * 2;
  complianceScore -= securityEvents * 5;
  complianceScore = Math.max(0, complianceScore);

  return {
    totalEvents: entries.length,
    criticalEvents,
    dataAccess,
    dataModifications,
    securityEvents,
    complianceScore,
  };
}

/**
 * Archive old audit logs
 */
export async function archiveAuditLogs(tenantId: string, olderThanDays: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await prisma.auditLog.deleteMany({
    where: {
      tenantId,
      timestamp: { lt: cutoffDate },
    },
  });

  return result.count;
}

/**
 * Search audit logs
 */
export async function searchAuditLogs(tenantId: string, query: string): Promise<AuditEntry[]> {
  const entries = await prisma.auditLog.findMany({
    where: {
      tenantId,
      OR: [
        { action: { contains: query, mode: "insensitive" } },
        { resource: { contains: query, mode: "insensitive" } },
        { userId: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return entries as any;
}
