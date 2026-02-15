import type { AgentConfig } from "../base/types";
import { SECURITY_COMPLIANCE_AGENT_PROMPT } from "../prompts/securityCompliance.prompt";

export const securityComplianceAgentConfig: AgentConfig = {
  name: "securityCompliance",
  description: "Enforces PHI/PII protection, permission rules, cross-org isolation.",
  queueName: "agent:securityCompliance",
  maxAttempts: 3,
  backoffMs: 3000,
  allowSync: true,
  prompt: SECURITY_COMPLIANCE_AGENT_PROMPT,
};
