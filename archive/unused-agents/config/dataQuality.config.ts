import type { AgentConfig } from "../base/types";
import { DATA_QUALITY_AGENT_PROMPT } from "../prompts/dataQuality.prompt";

export const dataQualityAgentConfig: AgentConfig = {
  name: "dataQuality",
  description: "Detects schema drift, null anomalies, field distribution changes.",
  queueName: "agent:dataQuality",
  maxAttempts: 3,
  backoffMs: 2500,
  allowSync: false,
  prompt: DATA_QUALITY_AGENT_PROMPT,
};
