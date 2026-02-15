/**
 * AI Intelligence Core - Type Definitions
 *
 * Core types for the AIMA-inspired intelligent agent system.
 * These types power the orchestration, planning, and learning systems.
 */

export type ClaimStateEnum =
  | "INTAKE"
  | "INSPECTED"
  | "ESTIMATE_DRAFTED"
  | "SUBMITTED"
  | "NEGOTIATING"
  | "APPROVED"
  | "IN_PRODUCTION"
  | "COMPLETE"
  | "PAID";

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  goal: string;
  utilityModel: any; // JSON structure defining utility calculation
}

export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  trigger: any; // Condition DSL (e.g., { all: [{ path: "roof.slope", op: ">", value: 4 }] })
  action: any; // Effect definition (add lineItem, flag risk, etc.)
  enabled?: boolean;
}

export interface NextActionSuggestion {
  id: string;
  label: string;
  description?: string;
  priority: "low" | "medium" | "high" | "critical";
  agentId?: string;
  actionType: string;
  estimatedTime?: string; // e.g., "5-10 minutes"
  requiredData?: string[]; // What data is needed to perform this action
}

export interface ExplanationPayload {
  reasoning: string;
  rulesUsed?: string[];
  similarCases?: { claimId: string; score: number }[];
  confidenceScore?: number;
}

export interface NegotiationSuggestion {
  summary: string;
  steps: string[];
  expectedImpact?: string;
  tactics?: string[];
  riskLevel?: "low" | "medium" | "high";
}

export interface ClaimIntelligence {
  approvalLikelihood: number; // 0-1
  supplementSuccessProbability: number; // 0-1
  riskScore: number; // 0-1
  recommendedStrategy: string;
  keyFactors: string[];
  warnings?: string[];
}

export interface KnowledgeNodeData {
  id: string;
  type: string;
  name: string;
  metadata?: any;
}

export interface KnowledgeEdgeData {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relation: string;
  metadata?: any;
}

export interface ClaimContext {
  claimId: string;
  orgId?: string;
  carrier?: string;
  state?: ClaimStateEnum;
  roofType?: string;
  roofSlope?: number;
  damageTypes?: string[];
  hasPhotos?: boolean;
  hasWeatherData?: boolean;
  estimateValue?: number;
  [key: string]: any; // Allow flexible context
}

export interface UtilityContext {
  claimId: string;
  metrics: Record<string, number>; // e.g., { approvalRate: 0.8, cycleTimeDays: 12 }
  carrier?: string;
  estimateValue?: number;
}

export interface AIActionLog {
  id: string;
  claimId: string;
  agentId: string;
  actionType: string;
  inputData: any;
  outputData: any;
  createdAt: Date;
}

export interface AIOutcomeLog {
  id: string;
  actionId: string;
  resultType: string; // approved, partial, denied, delayed, disputed
  metadata?: any;
  createdAt: Date;
}

export interface HumanEditLog {
  id: string;
  actionId: string;
  originalOutput: any;
  editedOutput: any;
  diff: any;
  createdAt: Date;
}
