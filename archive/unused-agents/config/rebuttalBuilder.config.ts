import type { AgentConfig } from "../base/types";
import { REBUTTAL_BUILDER_AGENT_PROMPT } from "../prompts/rebuttalBuilder.prompt";

export const rebuttalBuilderAgentConfig: AgentConfig = {
  name: "rebuttalBuilder",
  description: "Generates structured insurer rebuttals and objection letters.",
  queueName: "agent:rebuttalBuilder",
  maxAttempts: 2,
  backoffMs: 2500,
  allowSync: false,
  prompt: REBUTTAL_BUILDER_AGENT_PROMPT,
};
