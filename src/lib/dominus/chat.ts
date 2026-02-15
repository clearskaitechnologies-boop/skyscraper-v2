/**
 * DEPRECATED: dominusChatMessage model doesn't exist in schema.
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
  // dominusChatMessage model doesn't exist in schema
  console.log(`[dominus/chat] Would save chat message for user ${data.userId}`);
  return null;
}

export async function getRecentChatHistory(userId: string, limit = 25) {
  // dominusChatMessage model doesn't exist in schema
  console.log(`[dominus/chat] Would get chat history for user ${userId}`);
  return [];
}
