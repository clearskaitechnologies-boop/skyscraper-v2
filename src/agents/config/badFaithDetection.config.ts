import type { AgentConfig } from "../base/types";
import { BAD_FAITH_DETECTION_AGENT_PROMPT } from "../prompts/badFaithDetection.prompt";

export const badFaithDetectionAgentConfig: AgentConfig = {
  name: "badFaithDetection",
  description: "Scans claim timelines for potential bad faith indicators.",
  queueName: "agent:badFaithDetection",
  maxAttempts: 2,
  backoffMs: 3000,
  allowSync: false,
  prompt: BAD_FAITH_DETECTION_AGENT_PROMPT,
};
