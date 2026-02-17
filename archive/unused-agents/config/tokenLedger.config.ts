import type { AgentConfig } from "../base/types";
import { TOKEN_LEDGER_AGENT_PROMPT } from "../prompts/tokenLedger.prompt";

export const tokenLedgerAgentConfig: AgentConfig = {
  name: "tokenLedger",
  description: "Manages token balances, debits/credits, and spending anomalies.",
  queueName: "agent:tokenLedger",
  maxAttempts: 3,
  backoffMs: 1500,
  allowSync: true,
  prompt: TOKEN_LEDGER_AGENT_PROMPT,
};
