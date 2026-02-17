import type { AgentConfig } from "../base/types";
import { CLAIMS_ANALYSIS_AGENT_PROMPT } from "../prompts/claimsAnalysis.prompt";

export const claimsAnalysisAgentConfig: AgentConfig = {
  name: "claimsAnalysis",
  description: "Enriches claims with damage classification, risk flags, coverage hints.",
  queueName: "agent:claimsAnalysis",
  maxAttempts: 3,
  backoffMs: 1500,
  allowSync: true,
  prompt: CLAIMS_ANALYSIS_AGENT_PROMPT,
};
