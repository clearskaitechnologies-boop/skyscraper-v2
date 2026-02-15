import type { AgentConfig } from "../base/types";
import { INGESTION_AGENT_PROMPT } from "../prompts/ingestion.prompt";

export const ingestionAgentConfig: AgentConfig = {
  name: "ingestion",
  description: "Normalizes, validates, de-duplicates all incoming artifacts.",
  queueName: "agent:ingestion",
  maxAttempts: 3,
  backoffMs: 2000,
  allowSync: false,
  prompt: INGESTION_AGENT_PROMPT,
};
