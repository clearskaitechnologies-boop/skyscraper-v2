/**
 * TASK 97: ACTIVITY FEED
 *
 * Real-time activity feed with pagination, filters, and user tracking.
 */

import { prismaMaybeModel } from "@/lib/db/prismaModel";
import prisma from "@/lib/prisma";

export type ActivityType =
  | "CLAIM_CREATED"
  | "CLAIM_UPDATED"
  | "CLAIM_STATUS_CHANGED"
  | "JOB_CREATED"
  | "JOB_UPDATED"
  | "JOB_PHASE_CHANGED"
  | "TASK_CREATED"
  | "TASK_ASSIGNED"
  | "TASK_COMPLETED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_DELETED"
  | "COMMENT_ADDED"
  | "USER_JOINED"
  | "USER_LEFT"
  | "INVOICE_SENT"
  | "PAYMENT_RECEIVED"
  | "MESSAGE_SENT";

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  organizationId: string;
  title: string;
  description?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

/** Dynamic Prisma delegate for activity model */
interface ActivityModelDelegate {
  create(args: Record<string, unknown>): Promise<Activity>;
  findMany(args?: Record<string, unknown>): Promise<Activity[]>;
  findUnique(args: Record<string, unknown>): Promise<Activity | null>;
  count(args?: Record<string, unknown>): Promise<number>;
  deleteMany(args: Record<string, unknown>): Promise<{ count: number }>;
}

/** Where clause for activity queries */
interface ActivityWhereClause {
  organizationId: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  type?: { in: ActivityType[] };
  createdAt?: { gte?: Date; lt?: Date };
  OR?: Array<Record<string, unknown>>;
}

const Activity: ActivityModelDelegate | null =
  prismaMaybeModel("activityLog") ??
  prismaMaybeModel("activity_logs") ??
  prismaMaybeModel("activityLogs") ??
  prismaMaybeModel("claim_activities") ??
  prismaMaybeModel("claimActivities") ??
  prismaMaybeModel("ClaimActivity") ??
  prismaMaybeModel("claimActivity") ??
  null;

/**
 * Log activity
 */
export async function logActivity(
  organizationId: string,
  userId: string,
  data: {
    type: ActivityType;
    title: string;
    description?: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<string> {
  if (!Activity) return "";

  const activity = await Activity.create({
    data: {
      organizationId,
      userId,
      type: data.type,
      title: data.title,
      description: data.description,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata,
    },
  }).catch(() => null);

  return activity?.id ?? "";
}

/**
 * Get activity feed
 */
export async function getActivityFeed(
  organizationId: string,
  options?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    types?: ActivityType[];
    page?: number;
    limit?: number;
  }
): Promise<{
  activities: Activity[];
  total: number;
  page: number;
  pages: number;
}> {
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const skip = (page - 1) * limit;

  const whereClause: ActivityWhereClause = { organizationId };

  if (options?.userId) {
    whereClause.userId = options.userId;
  }

  if (options?.entityType) {
    whereClause.entityType = options.entityType;
  }

  if (options?.entityId) {
    whereClause.entityId = options.entityId;
  }

  if (options?.types && options.types.length > 0) {
    whereClause.type = { in: options.types };
  }

  if (!Activity) {
    return {
      activities: [],
      total: 0,
      page,
      pages: 0,
    };
  }

  const [activities, total] = await Promise.all([
    Activity.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }).catch(() => [] as Activity[]),
    Activity.count({ where: whereClause }).catch(() => 0),
  ]);

  return {
    activities,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get user activity timeline
 */
export async function getUserActivityTimeline(
  userId: string,
  limit: number = 100
): Promise<Activity[]> {
  if (!Activity) return [];

  const activities = await Activity.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return activities;
}

/**
 * Get entity activity history
 */
export async function getEntityActivityHistory(
  entityType: string,
  entityId: string
): Promise<Activity[]> {
  if (!Activity) return [];

  const activities = await Activity.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return activities;
}

/**
 * Get recent activities (last 24 hours)
 */
export async function getRecentActivities(
  organizationId: string,
  limit: number = 10
): Promise<Activity[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (!Activity) return [];

  const activities = await Activity.findMany({
    where: {
      organizationId,
      createdAt: { gte: yesterday },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return activities;
}

/**
 * Get activity statistics
 */
export async function getActivityStats(
  organizationId: string,
  period: "day" | "week" | "month" = "week"
): Promise<{
  total: number;
  byType: Record<ActivityType, number>;
  byUser: Record<string, number>;
  trend: { date: string; count: number }[];
}> {
  const periodStart = new Date();

  switch (period) {
    case "day":
      periodStart.setDate(periodStart.getDate() - 1);
      break;
    case "week":
      periodStart.setDate(periodStart.getDate() - 7);
      break;
    case "month":
      periodStart.setMonth(periodStart.getMonth() - 1);
      break;
  }

  if (!Activity)
    return {
      total: 0,
      byType: {} as Record<ActivityType, number>,
      byUser: {},
      trend: [],
    };

  const activities = await Activity.findMany({
    where: {
      organizationId,
      createdAt: { gte: periodStart },
    },
  });

  // Count by type
  const byType: Record<string, number> = {};
  activities.forEach((a) => {
    byType[a.type] = (byType[a.type] || 0) + 1;
  });

  // Count by user
  const byUser: Record<string, number> = {};
  activities.forEach((a) => {
    byUser[a.userId] = (byUser[a.userId] || 0) + 1;
  });

  // Trend data
  const trend: { date: string; count: number }[] = [];
  const dateGroups: Record<string, number> = {};

  activities.forEach((a) => {
    const date = a.createdAt.toISOString().split("T")[0];
    dateGroups[date] = (dateGroups[date] || 0) + 1;
  });

  Object.entries(dateGroups).forEach(([date, count]) => {
    trend.push({ date, count });
  });

  trend.sort((a, b) => a.date.localeCompare(b.date));

  return {
    total: activities.length,
    byType: byType as Record<ActivityType, number>,
    byUser,
    trend,
  };
}

/**
 * Delete old activities
 */
export async function cleanupOldActivities(
  organizationId: string,
  daysToKeep: number = 90
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  if (!Activity) return 0;

  const result = await Activity.deleteMany({
    where: {
      organizationId,
      createdAt: { lt: cutoffDate },
    },
  });

  return result.count;
}

/**
 * Search activities
 */
export async function searchActivities(
  organizationId: string,
  query: string,
  limit: number = 50
): Promise<Activity[]> {
  if (!Activity) return [];

  const activities = await Activity.findMany({
    where: {
      organizationId,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return activities;
}

/**
 * Get activity by ID
 */
export async function getActivity(activityId: string): Promise<Activity | null> {
  if (!Activity) return null;

  const activity = await Activity.findUnique({
    where: { id: activityId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return activity;
}

/**
 * Get activities grouped by date
 */
export async function getActivitiesGroupedByDate(
  organizationId: string,
  limit: number = 50
): Promise<Record<string, Activity[]>> {
  if (!Activity) return {};

  const activities = await Activity.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const grouped: Record<string, Activity[]> = {};

  activities.forEach((activity: Activity) => {
    const date = activity.createdAt.toISOString().split("T")[0];

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push(activity);
  });

  return grouped;
}

/**
 * Export activity feed
 */
export async function exportActivityFeed(
  organizationId: string,
  format: "json" | "csv" = "json"
): Promise<string> {
  if (!Activity) return format === "json" ? "[]" : "";

  const activities = await Activity.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (format === "json") {
    return JSON.stringify(activities, null, 2);
  }

  // CSV format
  const headers = ["Date", "User", "Type", "Title", "Description"];
  const rows = activities.map((a: Activity) => [
    a.createdAt.toISOString(),
    a.user.name,
    a.type,
    a.title,
    a.description || "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return csv;
}

/**
 * Get activity type label
 */
export function getActivityTypeLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    CLAIM_CREATED: "Claim Created",
    CLAIM_UPDATED: "Claim Updated",
    CLAIM_STATUS_CHANGED: "Claim Status Changed",
    JOB_CREATED: "Job Created",
    JOB_UPDATED: "Job Updated",
    JOB_PHASE_CHANGED: "Job Phase Changed",
    TASK_CREATED: "Task Created",
    TASK_ASSIGNED: "Task Assigned",
    TASK_COMPLETED: "Task Completed",
    DOCUMENT_UPLOADED: "Document Uploaded",
    DOCUMENT_DELETED: "Document Deleted",
    COMMENT_ADDED: "Comment Added",
    USER_JOINED: "User Joined",
    USER_LEFT: "User Left",
    INVOICE_SENT: "Invoice Sent",
    PAYMENT_RECEIVED: "Payment Received",
    MESSAGE_SENT: "Message Sent",
  };

  return labels[type] || type;
}

/**
 * Get activity icon
 */
export function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    CLAIM_CREATED: "file-plus",
    CLAIM_UPDATED: "file-edit",
    CLAIM_STATUS_CHANGED: "activity",
    JOB_CREATED: "briefcase",
    JOB_UPDATED: "edit",
    JOB_PHASE_CHANGED: "trending-up",
    TASK_CREATED: "plus-square",
    TASK_ASSIGNED: "user-plus",
    TASK_COMPLETED: "check-square",
    DOCUMENT_UPLOADED: "upload",
    DOCUMENT_DELETED: "trash",
    COMMENT_ADDED: "message-square",
    USER_JOINED: "user-check",
    USER_LEFT: "user-x",
    INVOICE_SENT: "send",
    PAYMENT_RECEIVED: "dollar-sign",
    MESSAGE_SENT: "mail",
  };

  return icons[type] || "activity";
}
