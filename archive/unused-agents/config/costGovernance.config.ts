import type { AgentConfig } from "../base/types";
import { COST_GOVERNANCE_AGENT_PROMPT } from "../prompts/costGovernance.prompt";

export const costGovernanceAgentConfig: AgentConfig = {
  name: "costGovernance",
  description: "Optimizes model tier selection and enforces cost budgets.",
  queueName: "agent:costGovernance",
  maxAttempts: 3,
  backoffMs: 3000,
  allowSync: true,
  prompt: COST_GOVERNANCE_AGENT_PROMPT,
};
