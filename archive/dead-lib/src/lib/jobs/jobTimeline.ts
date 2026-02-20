/**
 * Job Timeline & Milestones
 *
 * Visual timeline with milestones, scheduled tasks, and progress tracking
 * Gantt-style job management
 */

import { logActivity } from "@/lib/activity/activityFeed";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { notifyMilestone } from "@/lib/websocket/pipelineSync";

export interface Milestone {
  id: string;
  jobId: string;
  orgId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completedAt?: Date;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  order: number;
  createdBy: string;
}

export interface TimelineEvent {
  id: string;
  jobId: string;
  type: "MILESTONE" | "STATUS_CHANGE" | "PAYMENT" | "DOCUMENT" | "NOTE" | "MESSAGE";
  title: string;
  description?: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Add milestone to job
 */
export async function addMilestone(
  orgId: string,
  jobId: string,
  data: {
    title: string;
    description?: string;
    dueDate?: Date;
    order?: number;
  },
  userId: string
): Promise<Milestone> {
  const milestone = await prisma.jobMilestones
    .create({
      data: {
        jobId,
        orgId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        status: "PENDING",
        order: data.order || 0,
        createdBy: userId,
      },
    })
    .catch(() => {
      throw new Error("Failed to add milestone");
    });

  // Log activity
  await logActivity(orgId, {
    type: "MILESTONE_REACHED",
    userId,
    resourceType: "JOB",
    resourceId: jobId,
    action: "Milestone Added",
    description: data.title,
  });

  return milestone as Milestone;
}

/**
 * Complete milestone
 */
export async function completeMilestone(
  milestoneId: string,
  orgId: string,
  userId: string
): Promise<void> {
  const milestone = await prisma.jobMilestones.findFirst({
    where: { id: milestoneId, orgId },
  });

  if (!milestone) {
    throw new Error("Milestone not found");
  }

  await prisma.jobMilestones.update({
    where: { id: milestoneId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  // Notify real-time
  await notifyMilestone(orgId, "CLAIMS", milestone.jobId, milestone.title, userId);

  // Log activity
  await logActivity(orgId, {
    type: "MILESTONE_REACHED",
    userId,
    resourceType: "JOB",
    resourceId: milestone.jobId,
    action: "Milestone Completed",
    description: milestone.title,
  });
}

/**
 * Get job timeline
 */
export async function getJobTimeline(jobId: string, orgId: string): Promise<TimelineEvent[]> {
  try {
    const [milestones, activities] = await Promise.all([
      prisma.jobMilestones.findMany({
        where: { jobId, orgId },
        orderBy: { order: "asc" },
      }),
      prisma.activityFeed
        .findMany({
          where: {
            orgId,
            resourceType: "JOB",
            resourceId: jobId,
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        })
        .catch(() => []),
    ]);

    const events: TimelineEvent[] = [];

    // Add milestones
    for (const milestone of milestones) {
      events.push({
        id: milestone.id,
        jobId,
        type: "MILESTONE",
        title: milestone.title,
        description: milestone.description || undefined,
        timestamp: milestone.completedAt || milestone.dueDate || milestone.createdAt,
        metadata: {
          status: milestone.status,
          dueDate: milestone.dueDate,
        },
      });
    }

    // Add activity events
    for (const activity of activities) {
      events.push({
        id: activity.id,
        jobId,
        type: mapActivityType(activity.type),
        title: activity.action,
        description: activity.description || undefined,
        timestamp: activity.createdAt,
        userId: activity.userId || undefined,
      });
    }

    // Sort by timestamp
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return events;
  } catch (error) {
    logger.error("Failed to get job timeline:", error);
    return [];
  }
}

/**
 * Get job milestones
 */
export async function getJobMilestones(jobId: string, orgId: string): Promise<Milestone[]> {
  try {
    return (await prisma.jobMilestones.findMany({
      where: { jobId, orgId },
      orderBy: { order: "asc" },
    })) as Milestone[];
  } catch {
    return [];
  }
}

/**
 * Update milestone order
 */
export async function reorderMilestones(
  orgId: string,
  milestoneOrders: Array<{ id: string; order: number }>
): Promise<void> {
  try {
    await prisma.$transaction(
      milestoneOrders.map(({ id, order }) =>
        prisma.jobMilestones.update({
          where: { id },
          data: { order },
        })
      )
    );
  } catch (error) {
    logger.error("Failed to reorder milestones:", error);
    throw error;
  }
}

/**
 * Delete milestone
 */
export async function deleteMilestone(
  milestoneId: string,
  orgId: string,
  userId: string
): Promise<void> {
  const milestone = await prisma.jobMilestones.findFirst({
    where: { id: milestoneId, orgId },
  });

  if (!milestone) {
    throw new Error("Milestone not found");
  }

  await prisma.jobMilestones.delete({
    where: { id: milestoneId },
  });

  // Log activity
  await logActivity(orgId, {
    type: "DELETED",
    userId,
    resourceType: "JOB",
    resourceId: milestone.jobId,
    action: "Milestone Deleted",
    description: milestone.title,
  });
}

/**
 * Check overdue milestones
 */
export async function checkOverdueMilestones(orgId: string): Promise<Milestone[]> {
  try {
    const now = new Date();

    const overdue = await prisma.jobMilestones.findMany({
      where: {
        orgId,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueDate: { lt: now },
      },
    });

    // Update status to OVERDUE
    for (const milestone of overdue) {
      await prisma.jobMilestones.update({
        where: { id: milestone.id },
        data: { status: "OVERDUE" },
      });
    }

    return overdue as Milestone[];
  } catch {
    return [];
  }
}

/**
 * Get milestone progress stats
 */
export async function getMilestoneProgress(
  jobId: string,
  orgId: string
): Promise<{
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  percentComplete: number;
}> {
  try {
    const milestones = await prisma.jobMilestones.findMany({
      where: { jobId, orgId },
    });

    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === "COMPLETED").length;
    const pending = milestones.filter((m) => m.status === "PENDING").length;
    const overdue = milestones.filter((m) => m.status === "OVERDUE").length;
    const percentComplete = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      percentComplete,
    };
  } catch {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      percentComplete: 0,
    };
  }
}

/**
 * Map activity type to timeline event type
 */
function mapActivityType(activityType: string): TimelineEvent["type"] {
  switch (activityType) {
    case "STATUS_CHANGE":
      return "STATUS_CHANGE";
    case "PAYMENT_RECEIVED":
      return "PAYMENT";
    case "NEW_DOCUMENT":
      return "DOCUMENT";
    case "NEW_MESSAGE":
      return "MESSAGE";
    default:
      return "NOTE";
  }
}
