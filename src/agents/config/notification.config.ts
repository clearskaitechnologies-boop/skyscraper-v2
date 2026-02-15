import type { AgentConfig } from "../base/types";
import { NOTIFICATION_AGENT_PROMPT } from "../prompts/notification.prompt";

export const notificationAgentConfig: AgentConfig = {
  name: "notification",
  description: "Dispatches emails, webhooks, in-app alerts with idempotent receipts.",
  queueName: "agent:notification",
  maxAttempts: 3,
  backoffMs: 2000,
  allowSync: true,
  prompt: NOTIFICATION_AGENT_PROMPT,
};
