/**
 * Comments & Mentions System
 *
 * Real-time comments with @mentions
 * Attach comments to claims, jobs, tasks
 */

import { logActivity } from "@/lib/activity/activityFeed";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export type CommentableType = "CLAIM" | "JOB" | "TASK" | "INSPECTION";

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  mentions: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  edited: boolean;
}

export interface CreateCommentData {
  content: string;
  authorId: string;
  resourceType: CommentableType;
  resourceId: string;
  mentions?: string[];
  attachments?: string[];
}

/**
 * Create comment
 */
export async function createComment(orgId: string, data: CreateCommentData): Promise<Comment> {
  try {
    // Extract mentions from content
    const mentions = extractMentions(data.content);

    // Create comment
    const comment = (await prisma.comments.create({
      data: {
        orgId,
        content: data.content,
        authorId: data.authorId,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        mentions: mentions,
        attachments: data.attachments || [],
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })) as any;

    // Log activity
    await logActivity(orgId, {
      userId: data.authorId,
      type: "CREATED",
      resourceType: "COMMENT",
      resourceId: comment.id,
      action: "Comment Added",
      description: `Added comment to ${data.resourceType}`,
    });

    // Notify mentioned users
    if (mentions.length > 0) {
      await notifyMentionedUsers(
        mentions,
        comment.author.firstName + " " + comment.author.lastName,
        data.content,
        orgId
      );
    }

    return {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author.id,
        name: `${comment.author.firstName} ${comment.author.lastName}`,
      },
      mentions: mentions,
      attachments: comment.attachments || [],
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      edited: false,
    };
  } catch (error) {
    logger.error("Failed to create comment:", error);
    throw new Error("Failed to create comment");
  }
}

/**
 * Get comments for resource
 */
export async function getComments(
  resourceType: CommentableType,
  resourceId: string,
  limit: number = 50
): Promise<Comment[]> {
  try {
    const comments = await prisma.comments.findMany({
      where: {
        resourceType,
        resourceId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return comments.map((c: any) => ({
      id: c.id,
      content: c.content,
      author: {
        id: c.author.id,
        name: `${c.author.firstName} ${c.author.lastName}`,
      },
      mentions: c.mentions || [],
      attachments: c.attachments || [],
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      edited: c.createdAt.getTime() !== c.updatedAt.getTime(),
    }));
  } catch {
    return [];
  }
}

/**
 * Update comment
 */
export async function updateComment(
  commentId: string,
  content: string,
  userId: string
): Promise<boolean> {
  try {
    const comment = await prisma.comments.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.authorId !== userId) {
      return false;
    }

    // Extract new mentions
    const mentions = extractMentions(content);

    await prisma.comments.update({
      where: { id: commentId },
      data: {
        content,
        mentions,
        updatedAt: new Date(),
      },
    });

    // Notify new mentions
    const oldMentions = comment.mentions || [];
    const newMentions = mentions.filter((m) => !oldMentions.includes(m));

    if (newMentions.length > 0) {
      const authorName = await getUserName(userId);
      await notifyMentionedUsers(newMentions, authorName, content, comment.orgId);
    }

    return true;
  } catch (error) {
    logger.error("Failed to update comment:", error);
    return false;
  }
}

/**
 * Delete comment
 */
export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  try {
    const comment = await prisma.comments.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.authorId !== userId) {
      return false;
    }

    await prisma.comments.delete({
      where: { id: commentId },
    });

    // Log activity
    await logActivity(comment.orgId, {
      userId,
      type: "DELETED",
      resourceType: "COMMENT",
      resourceId: commentId,
      action: "Comment Deleted",
      description: "Deleted comment",
    });

    return true;
  } catch (error) {
    logger.error("Failed to delete comment:", error);
    return false;
  }
}

/**
 * Extract @mentions from content
 */
function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.matchAll(mentionRegex);
  const mentions: string[] = [];

  for (const match of matches) {
    mentions.push(match[1]);
  }

  return [...new Set(mentions)]; // Remove duplicates
}

/**
 * Notify mentioned users
 */
async function notifyMentionedUsers(
  mentions: string[],
  mentionerName: string,
  content: string,
  orgId: string
): Promise<void> {
  const { sendTemplatedNotification } = await import("../notifications/templates");

  // Resolve usernames to user IDs
  const users = await prisma.users.findMany({
    where: {
      // Assume mentions are user IDs for now
      id: { in: mentions },
    },
  });

  for (const user of users) {
    try {
      await sendTemplatedNotification(
        "MENTIONED_IN_COMMENT",
        user.id,
        {
          mentioner: mentionerName,
          comment: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
        },
        ["EMAIL", "PUSH", "IN_APP"]
      );
    } catch (error) {
      logger.error("Failed to notify mentioned user:", error);
    }
  }
}

/**
 * Get user's mentions
 */
export async function getUserMentions(userId: string, limit: number = 20): Promise<Comment[]> {
  try {
    const comments = await prisma.comments.findMany({
      where: {
        mentions: {
          has: userId,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return comments.map((c: any) => ({
      id: c.id,
      content: c.content,
      author: {
        id: c.author.id,
        name: `${c.author.firstName} ${c.author.lastName}`,
      },
      mentions: c.mentions || [],
      attachments: c.attachments || [],
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      edited: c.createdAt.getTime() !== c.updatedAt.getTime(),
    }));
  } catch {
    return [];
  }
}

/**
 * Get comment count
 */
export async function getCommentCount(
  resourceType: CommentableType,
  resourceId: string
): Promise<number> {
  try {
    return await prisma.comments.count({
      where: {
        resourceType,
        resourceId,
      },
    });
  } catch {
    return 0;
  }
}

/**
 * Add reaction to comment
 */
export async function addReaction(
  commentId: string,
  userId: string,
  emoji: string
): Promise<boolean> {
  try {
    // TODO: Implement reactions table
    logger.debug(`User ${userId} reacted ${emoji} to comment ${commentId}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get recent activity (comments across org)
 */
export async function getRecentComments(orgId: string, limit: number = 20): Promise<Comment[]> {
  try {
    const comments = await prisma.comments.findMany({
      where: { orgId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return comments.map((c: any) => ({
      id: c.id,
      content: c.content,
      author: {
        id: c.author.id,
        name: `${c.author.firstName} ${c.author.lastName}`,
      },
      mentions: c.mentions || [],
      attachments: c.attachments || [],
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      edited: c.createdAt.getTime() !== c.updatedAt.getTime(),
    }));
  } catch {
    return [];
  }
}

/**
 * Helper: Get user name
 */
async function getUserName(userId: string): Promise<string> {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    return user ? `${user.firstName} ${user.lastName}` : "User";
  } catch {
    return "User";
  }
}

/**
 * Search comments
 */
export async function searchComments(
  orgId: string,
  query: string,
  filters?: {
    resourceType?: CommentableType;
    authorId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Comment[]> {
  try {
    const where: any = {
      orgId,
      content: {
        contains: query,
        mode: "insensitive",
      },
    };

    if (filters?.resourceType) {
      where.resourceType = filters.resourceType;
    }

    if (filters?.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters?.startDate) {
      where.createdAt = { gte: filters.startDate };
    }

    if (filters?.endDate) {
      where.createdAt = { ...where.createdAt, lte: filters.endDate };
    }

    const comments = await prisma.comments.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return comments.map((c: any) => ({
      id: c.id,
      content: c.content,
      author: {
        id: c.author.id,
        name: `${c.author.firstName} ${c.author.lastName}`,
      },
      mentions: c.mentions || [],
      attachments: c.attachments || [],
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      edited: c.createdAt.getTime() !== c.updatedAt.getTime(),
    }));
  } catch {
    return [];
  }
}
