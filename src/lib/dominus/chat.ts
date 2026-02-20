import { logger } from "@/lib/logger";

/**
 * DEPRECATED: skaiChatMessage model doesn't exist in schema.
 */

export interface ChatMessageInput {
  userId?: string;
  orgId?: string;
  claimId?: string;
  routeName?: string;
  role: "user" | "assistant";
  content: string;
}

export async function saveChatMessage(data: ChatMessageInput) {
  // skaiChatMessage model doesn't exist in schema
  logger.debug(`[skai/chat] Would save chat message for user ${data.userId}`);
  return null;
}

export async function getRecentChatHistory(userId: string, limit = 25) {
  // skaiChatMessage model doesn't exist in schema
  logger.debug(`[skai/chat] Would get chat history for user ${userId}`);
  return [];
}
