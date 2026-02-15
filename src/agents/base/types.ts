// Shared agent types
export type AgentName =
  | "ingestion"
  | "claimsAnalysis"
  | "rebuttalBuilder"
  | "badFaithDetection"
  | "reportAssembly"
  | "proposalOptimization"
  | "tokenLedger"
  | "dataQuality"
  | "securityCompliance"
  | "healthMonitoring"
  | "notification"
  | "costGovernance";

export type AgentErrorClass =
  | "success"
  | "user_error"
  | "transient_error"
  | "system_fault"
  | "org_context_error"
  | "rate_limit_error"
  | "cost_violation"
  | "schema_drift_detected";

export interface SafeOrgContext {
  status: "unauthenticated" | "noMembership" | "ok" | "error";
  orgId?: string;
  plan?: string | null;
}

export interface AgentInputBase {
  safeOrgContext: SafeOrgContext;
  userMessage?: string;
  orgContext?: Record<string, unknown> | null;
  claimContext?: Record<string, unknown> | null;
  leadContext?: Record<string, unknown> | null;
  docContext?: Array<Record<string, unknown>> | null;
  agentMemory?: Array<string> | null;
  outputInstructions?: {
    format: "markdown" | "json" | "text";
    schemaName?: string;
  };
  requestId?: string;
}

export interface AgentResult {
  agent: AgentName;
  ok: boolean;
  errorClass: AgentErrorClass;
  errorMessage?: string;
  rawOutput: string;
  structuredOutput?: unknown;
  tokensUsed?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  assumptions?: string[];
  suggestedMemoryUpdate?: string[] | null;
}

export interface AgentConfig {
  name: AgentName;
  description: string;
  queueName: string;
  maxAttempts: number;
  backoffMs: number;
  allowSync: boolean;
  prompt: string; // child prompt (root prepended already in each prompt module)
}
