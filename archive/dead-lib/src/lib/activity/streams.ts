/**
 * TASK 145: ACTIVITY STREAMS
 *
 * Real-time activity feeds with filtering.
 */

import prisma from "@/lib/prisma";

export type ActivityType =
  | "CLAIM_CREATED"
  | "JOB_UPDATED"
  | "TASK_COMPLETED"
  | "COMMENT_ADDED"
  | "FILE_UPLOADED";

export interface Activity {
  id: string;
  tenantId: string;
  userId: string;
  type: ActivityType;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export async function recordActivity(data: {
  tenantId: string;
  userId: string;
  type: ActivityType;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  await prisma.activity.create({
    data: {
      ...data,
      metadata: (data.metadata || {}) as any,
      timestamp: new Date(),
    } as any,
  });
}

export async function getActivityFeed(
  tenantId: string,
  filters?: {
    userId?: string;
    types?: ActivityType[];
    limit?: number;
    before?: Date;
  }
): Promise<Activity[]> {
  const where: any = { tenantId };

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  if (filters?.types) {
    where.type = { in: filters.types };
  }

  if (filters?.before) {
    where.timestamp = { lt: filters.before };
  }

  const activities = await prisma.activity.findMany({
    where,
    include: { user: true },
    orderBy: { timestamp: "desc" },
    take: filters?.limit || 50,
  });

  return activities as any;
}

export async function getUserActivity(userId: string, limit: number = 20): Promise<Activity[]> {
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  return activities as any;
}

export async function getResourceActivity(
  resourceType: string,
  resourceId: string
): Promise<Activity[]> {
  const activities = await prisma.activity.findMany({
    where: {
      resourceType,
      resourceId,
    },
    include: { user: true },
    orderBy: { timestamp: "desc" },
  });

  return activities as any;
}
