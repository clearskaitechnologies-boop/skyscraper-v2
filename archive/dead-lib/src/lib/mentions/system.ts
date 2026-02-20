/**
 * TASK 99: MENTIONS SYSTEM
 *
 * @mention system with autocomplete, notifications, and user search.
 */

import prisma from "@/lib/prisma";

export interface Mention {
  id: string;
  userId: string;
  mentionedBy: string;
  entityType: string;
  entityId: string;
  context: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Parse mentions from text
 */
export function parseMentions(text: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\((\w+)\)/g;
  const usernames: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    usernames.push(match[2]);
  }

  // Also support simple @username format
  const simpleMentionRegex = /@(\w+)/g;
  while ((match = simpleMentionRegex.exec(text)) !== null) {
    if (!usernames.includes(match[1])) {
      usernames.push(match[1]);
    }
  }

  return usernames;
}

/**
 * Create mentions for users
 */
export async function createMentions(
  organizationId: string,
  mentionedBy: string,
  userIds: string[],
  data: {
    entityType: string;
    entityId: string;
    context: string;
  }
): Promise<void> {
  const mentions = userIds.map((userId) => ({
    organizationId,
    userId,
    mentionedBy,
    entityType: data.entityType,
    entityId: data.entityId,
    context: data.context,
    isRead: false,
  }));

  await prisma.mention.createMany({
    data: mentions,
  });

  // Create notifications
  for (const userId of userIds) {
    await prisma.projectNotification.create({
      data: {
        userId,
        type: "MENTION",
        title: "You were mentioned",
        message: data.context.substring(0, 100),
        data: {
          entityType: data.entityType,
          entityId: data.entityId,
        } as any,
      },
    });
  }
}

/**
 * Get user mentions
 */
export async function getUserMentions(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  }
): Promise<{
  mentions: Mention[];
  total: number;
  unread: number;
  page: number;
  pages: number;
}> {
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const skip = (page - 1) * limit;

  const whereClause: any = { userId };

  if (options?.unreadOnly) {
    whereClause.isRead = false;
  }

  const [mentions, total, unread] = await Promise.all([
    prisma.mention.findMany({
      where: whereClause,
      include: {
        mentionedByUser: {
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
    }),
    prisma.mention.count({ where: whereClause }),
    prisma.mention.count({ where: { userId, isRead: false } }),
  ]);

  return {
    mentions: mentions as any,
    total,
    unread,
    page,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Mark mention as read
 */
export async function markMentionAsRead(mentionId: string): Promise<void> {
  await prisma.mention.update({
    where: { id: mentionId },
    data: { isRead: true },
  });
}

/**
 * Mark all mentions as read
 */
export async function markAllMentionsAsRead(userId: string): Promise<void> {
  await prisma.mention.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });
}

/**
 * Get unread mention count
 */
export async function getUnreadMentionCount(userId: string): Promise<number> {
  return await prisma.mention.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Delete mention
 */
export async function deleteMention(mentionId: string): Promise<void> {
  await prisma.mention.delete({
    where: { id: mentionId },
  });
}

/**
 * Search users for mentions
 */
export async function searchUsersForMention(
  organizationId: string,
  query: string,
  limit: number = 10
): Promise<
  {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    username?: string;
  }[]
> {
  const users = await prisma.users.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } },
      ],
      organizationMemberships: {
        some: {
          organizationId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      username: true,
    },
    take: limit,
  });

  return users;
}

/**
 * Format mention in text
 */
export function formatMention(username: string, userId: string): string {
  return `@[${username}](${userId})`;
}

/**
 * Replace mentions with formatted links
 */
export function replaceMentionsWithLinks(
  text: string,
  users: Record<string, { name: string; id: string }>
): string {
  let result = text;

  Object.entries(users).forEach(([username, user]) => {
    const regex = new RegExp(`@${username}\\b`, "g");
    result = result.replace(regex, `<a href="/users/${user.id}" class="mention">@${user.name}</a>`);
  });

  return result;
}

/**
 * Highlight mentions in text
 */
export function highlightMentions(text: string): string {
  return text.replace(
    /@\[([^\]]+)\]\((\w+)\)/g,
    '<span class="mention" data-user-id="$2">@$1</span>'
  );
}

/**
 * Get mentions for entity
 */
export async function getEntityMentions(entityType: string, entityId: string): Promise<Mention[]> {
  const mentions = await prisma.mention.findMany({
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
      mentionedByUser: {
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

  return mentions as any;
}

/**
 * Get mention statistics
 */
export async function getMentionStats(userId: string): Promise<{
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);

  const [total, unread, todayCount, weekCount] = await Promise.all([
    prisma.mention.count({ where: { userId } }),
    prisma.mention.count({ where: { userId, isRead: false } }),
    prisma.mention.count({
      where: { userId, createdAt: { gte: today } },
    }),
    prisma.mention.count({
      where: { userId, createdAt: { gte: thisWeek } },
    }),
  ]);

  return {
    total,
    unread,
    today: todayCount,
    thisWeek: weekCount,
  };
}

/**
 * Get users mentioned by user
 */
export async function getUsersMentionedBy(
  mentionedBy: string,
  limit: number = 10
): Promise<
  {
    userId: string;
    count: number;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  }[]
> {
  const mentions = await prisma.mention.groupBy({
    by: ["userId"],
    where: { mentionedBy },
    _count: true,
    orderBy: { _count: { userId: "desc" } },
    take: limit,
  });

  const userIds = mentions.map((m) => m.userId);
  const users = await prisma.users.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  });

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return mentions.map((m) => ({
    userId: m.userId,
    count: m._count,
    user: userMap[m.userId],
  }));
}

/**
 * Validate mention format
 */
export function validateMention(text: string): boolean {
  const mentionRegex = /@\[([^\]]+)\]\((\w+)\)/;
  return mentionRegex.test(text);
}

/**
 * Extract user IDs from mentions
 */
export async function extractUserIdsFromMentions(
  organizationId: string,
  mentions: string[]
): Promise<string[]> {
  const users = await prisma.users.findMany({
    where: {
      username: { in: mentions },
      organizationMemberships: {
        some: {
          organizationId,
        },
      },
    },
    select: { id: true },
  });

  return users.map((u) => u.id);
}

/**
 * Get mention notification preferences
 */
export async function getMentionNotificationPreferences(userId: string): Promise<{
  email: boolean;
  push: boolean;
  sms: boolean;
}> {
  const prefs = await prisma.userPreferences.findUnique({
    where: { userId },
    select: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: true,
    },
  });

  return {
    email: prefs?.emailNotifications ?? true,
    push: prefs?.pushNotifications ?? true,
    sms: prefs?.smsNotifications ?? false,
  };
}
