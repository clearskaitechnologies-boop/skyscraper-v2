/**
 * Error Tracking System
 *
 * Sentry-style error grouping, stack traces, user context
 * Intelligent error tracking with automatic grouping and alerts
 */

import crypto from "crypto";
import { logger } from "@/lib/logger";

import prisma from "@/lib/prisma";

export interface ErrorEvent {
  id: string;
  message: string;
  stack?: string;
  fingerprint: string;
  groupId: string;
  level: ErrorLevel;
  timestamp: Date;
  userId?: string;
  orgId?: string;
  url?: string;
  userAgent?: string;
  context?: Record<string, unknown>;
}

export type ErrorLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "FATAL";

export interface ErrorGroup {
  id: string;
  fingerprint: string;
  message: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  status: "UNRESOLVED" | "RESOLVED" | "IGNORED";
  assignedTo?: string;
}

/**
 * Capture error event
 */
export async function captureError(params: {
  error: Error | string;
  level?: ErrorLevel;
  userId?: string;
  orgId?: string;
  url?: string;
  userAgent?: string;
  context?: Record<string, unknown>;
}): Promise<ErrorEvent> {
  try {
    const errorMessage = typeof params.error === "string" ? params.error : params.error.message;

    const stack = typeof params.error === "string" ? undefined : params.error.stack;

    // Generate fingerprint for grouping
    const fingerprint = generateFingerprint(errorMessage, stack);

    // Find or create error group
    let group = await prisma.errorGroups.findUnique({
      where: { fingerprint },
    });

    if (!group) {
      group = await prisma.errorGroups.create({
        data: {
          fingerprint,
          message: errorMessage,
          count: 0,
          firstSeen: new Date(),
          lastSeen: new Date(),
          status: "UNRESOLVED",
        },
      });
    }

    // Update group stats
    await prisma.errorGroups.update({
      where: { id: group.id },
      data: {
        count: { increment: 1 },
        lastSeen: new Date(),
      },
    });

    // Create error event
    const event = (await prisma.errorEvents.create({
      data: {
        message: errorMessage,
        stack,
        fingerprint,
        groupId: group.id,
        level: params.level || "ERROR",
        timestamp: new Date(),
        userId: params.userId,
        orgId: params.orgId,
        url: params.url,
        userAgent: params.userAgent,
        context: params.context || {},
      },
    })) as unknown as ErrorEvent;

    // Alert if critical
    if (params.level === "FATAL") {
      await sendErrorAlert(event);
    }

    return event;
  } catch (error) {
    logger.error("Failed to capture error:", error);
    throw error;
  }
}

/**
 * Generate error fingerprint for grouping
 */
function generateFingerprint(message: string, stack?: string): string {
  // Remove dynamic parts from message
  let normalized = message
    .replace(/\d+/g, "N") // Replace numbers
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "UUID") // Replace UUIDs
    .replace(/\/[a-z0-9_-]+\//gi, "/PATH/"); // Replace paths

  // Use first few lines of stack trace
  if (stack) {
    const stackLines = stack.split("\n").slice(0, 3).join("\n");
    normalized +=
      "\n" +
      stackLines
        .replace(/:\d+:\d+/g, ":N:N") // Remove line numbers
        .replace(/\([^)]+\)/g, "(...)"); // Remove file paths
  }

  return crypto.createHash("md5").update(normalized).digest("hex");
}

/**
 * Get error groups
 */
export async function getErrorGroups(params: {
  orgId?: string;
  status?: ErrorGroup["status"];
  level?: ErrorLevel;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<ErrorGroup[]> {
  try {
    const where: Record<string, unknown> = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.startDate || params.endDate) {
      where.lastSeen = {} as Record<string, Date>;
      if (params.startDate) (where.lastSeen as Record<string, Date>).gte = params.startDate;
      if (params.endDate) (where.lastSeen as Record<string, Date>).lte = params.endDate;
    }

    const groups = await prisma.errorGroups.findMany({
      where,
      orderBy: { lastSeen: "desc" },
      take: params.limit || 50,
      include: {
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return groups as unknown as ErrorGroup[];
  } catch {
    return [];
  }
}

/**
 * Get error events for group
 */
export async function getGroupEvents(groupId: string, limit: number = 50): Promise<ErrorEvent[]> {
  try {
    const events = await prisma.errorEvents.findMany({
      where: { groupId },
      orderBy: { timestamp: "desc" },
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
    });

    return events as unknown as ErrorEvent[];
  } catch {
    return [];
  }
}

/**
 * Get error statistics
 */
export async function getErrorStats(
  orgId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalErrors: number;
  errorsByLevel: Record<ErrorLevel, number>;
  errorsByDay: Array<{ date: string; count: number }>;
  topErrors: ErrorGroup[];
  newErrors: number;
}> {
  try {
    const where: Record<string, unknown> = {};

    if (orgId) {
      where.orgId = orgId;
    }

    if (startDate || endDate) {
      where.timestamp = {} as Record<string, Date>;
      if (startDate) (where.timestamp as Record<string, Date>).gte = startDate;
      if (endDate) (where.timestamp as Record<string, Date>).lte = endDate;
    }

    const events = await prisma.errorEvents.findMany({
      where,
      include: {
        group: true,
      },
    });

    // Count by level
    const errorsByLevel: Record<string, number> = {
      DEBUG: 0,
      INFO: 0,
      WARNING: 0,
      ERROR: 0,
      FATAL: 0,
    };

    for (const event of events) {
      errorsByLevel[event.level]++;
    }

    // Group by day
    const errorsByDay: Record<string, number> = {};
    for (const event of events) {
      const date = event.timestamp.toISOString().split("T")[0];
      errorsByDay[date] = (errorsByDay[date] || 0) + 1;
    }

    const errorsByDayArray = Object.entries(errorsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get top errors
    const groups = await getErrorGroups({
      orgId,
      startDate,
      endDate,
      limit: 10,
    });

    const topErrors = groups.sort((a, b) => b.count - a.count);

    // Count new errors (first seen in period)
    const newErrors = groups.filter((g) => (startDate ? g.firstSeen >= startDate : true)).length;

    return {
      totalErrors: events.length,
      errorsByLevel: errorsByLevel as Record<ErrorLevel, number>,
      errorsByDay: errorsByDayArray,
      topErrors,
      newErrors,
    };
  } catch (error) {
    logger.error("Failed to get error stats:", error);
    throw error;
  }
}

/**
 * Resolve error group
 */
export async function resolveErrorGroup(groupId: string, userId: string): Promise<boolean> {
  try {
    await prisma.errorGroups.update({
      where: { id: groupId },
      data: {
        status: "RESOLVED",
        assignedTo: userId,
      },
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Ignore error group
 */
export async function ignoreErrorGroup(groupId: string): Promise<boolean> {
  try {
    await prisma.errorGroups.update({
      where: { id: groupId },
      data: { status: "IGNORED" },
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Assign error group
 */
export async function assignErrorGroup(groupId: string, userId: string): Promise<boolean> {
  try {
    await prisma.errorGroups.update({
      where: { id: groupId },
      data: { assignedTo: userId },
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Search errors
 */
export async function searchErrors(
  query: string,
  orgId?: string,
  limit: number = 50
): Promise<ErrorEvent[]> {
  try {
    const where: Record<string, unknown> = {
      OR: [{ message: { contains: query } }, { stack: { contains: query } }],
    };

    if (orgId) {
      where.orgId = orgId;
    }

    const events = await prisma.errorEvents.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        group: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return events as unknown as ErrorEvent[];
  } catch {
    return [];
  }
}

/**
 * Send error alert
 */
async function sendErrorAlert(event: ErrorEvent): Promise<void> {
  try {
    // TODO: Integrate with notification system
    console.error("CRITICAL ERROR ALERT:", {
      message: event.message,
      userId: event.userId,
      orgId: event.orgId,
      timestamp: event.timestamp,
    });

    // Send to monitoring service (Slack, PagerDuty, etc.)
    // await sendSlackAlert(event);
    // await sendPagerDutyAlert(event);
  } catch (error) {
    logger.error("Failed to send error alert:", error);
  }
}

/**
 * Get error context
 */
export async function getErrorContext(eventId: string): Promise<{
  event: ErrorEvent;
  similarErrors: ErrorEvent[];
  userActivity: Record<string, unknown>[];
}> {
  try {
    const event = await prisma.errorEvents.findUnique({
      where: { id: eventId },
      include: {
        group: true,
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

    if (!event) {
      throw new Error("Error event not found");
    }

    // Get similar errors
    const similarErrors = await prisma.errorEvents.findMany({
      where: {
        groupId: event.groupId,
        id: { not: eventId },
      },
      orderBy: { timestamp: "desc" },
      take: 5,
    });

    // Get user activity around error time
    let userActivity: Record<string, unknown>[] = [];
    if (event.userId && event.orgId) {
      const startTime = new Date(event.timestamp.getTime() - 5 * 60 * 1000);
      const endTime = new Date(event.timestamp.getTime() + 1 * 60 * 1000);

      userActivity = await prisma.auditLogs.findMany({
        where: {
          userId: event.userId,
          orgId: event.orgId,
          timestamp: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: { timestamp: "desc" },
      });
    }

    return {
      event: event as unknown as ErrorEvent,
      similarErrors: similarErrors as unknown as ErrorEvent[],
      userActivity,
    };
  } catch (error) {
    logger.error("Failed to get error context:", error);
    throw error;
  }
}

/**
 * Cleanup old errors
 */
export async function cleanupOldErrors(retentionDays: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    // Delete old events
    const eventsDeleted = await prisma.errorEvents.deleteMany({
      where: { timestamp: { lt: cutoffDate } },
    });

    // Delete groups with no recent events
    const groupsDeleted = await prisma.errorGroups.deleteMany({
      where: {
        lastSeen: { lt: cutoffDate },
        status: { in: ["RESOLVED", "IGNORED"] },
      },
    });

    return eventsDeleted.count + groupsDeleted.count;
  } catch {
    return 0;
  }
}

/**
 * Global error handler
 */
export function setupGlobalErrorHandler(): void {
  // Browser environment
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      captureError({
        error: event.error || event.message,
        level: "ERROR",
        url: window.location.href,
        userAgent: navigator.userAgent,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      }).catch(console.error);
    });

    window.addEventListener("unhandledrejection", (event) => {
      captureError({
        error: event.reason,
        level: "ERROR",
        url: window.location.href,
        userAgent: navigator.userAgent,
        context: {
          type: "unhandledrejection",
        },
      }).catch(console.error);
    });
  }

  // Node.js environment
  if (typeof process !== "undefined") {
    process.on("uncaughtException", (error) => {
      captureError({
        error,
        level: "FATAL",
        context: {
          type: "uncaughtException",
        },
      }).catch(console.error);
    });

    process.on("unhandledRejection", (reason) => {
      captureError({
        error: reason instanceof Error ? reason : String(reason),
        level: "ERROR",
        context: {
          type: "unhandledRejection",
        },
      }).catch(console.error);
    });
  }
}
