import type { AgentConfig } from "../base/types";
import { REPORT_ASSEMBLY_AGENT_PROMPT } from "../prompts/reportAssembly.prompt";

export const reportAssemblyAgentConfig: AgentConfig = {
  name: "reportAssembly",
  description: "Assembles multi-section PDF/HTML claim reports.",
  queueName: "agent:reportAssembly",
  maxAttempts: 2,
  backoffMs: 4000,
  allowSync: false,
  prompt: REPORT_ASSEMBLY_AGENT_PROMPT,
};
