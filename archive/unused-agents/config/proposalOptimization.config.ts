import type { AgentConfig } from "../base/types";
import { PROPOSAL_OPTIMIZATION_AGENT_PROMPT } from "../prompts/proposalOptimization.prompt";

export const proposalOptimizationAgentConfig: AgentConfig = {
  name: "proposalOptimization",
  description: "Optimizes scopes, line items, and pricing strategies.",
  queueName: "agent:proposalOptimization",
  maxAttempts: 2,
  backoffMs: 2000,
  allowSync: true,
  prompt: PROPOSAL_OPTIMIZATION_AGENT_PROMPT,
};
