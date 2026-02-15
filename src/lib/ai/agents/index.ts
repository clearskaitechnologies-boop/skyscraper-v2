/**
 * AI Agent Registry
 *
 * Manages the collection of AI agents that can operate on claims.
 * Each agent has specific goals and utility functions.
 *
 * Note: Agents are defined in-memory since they are static configurations.
 */

import { AgentDefinition } from "../types";

/**
 * Static agent definitions (no database table required)
 */
const AGENTS: AgentDefinition[] = [
  {
    id: "agent-estimate",
    name: "EstimateAgent",
    description: "Generates comprehensive, code-compliant estimates using AI Claims Builder",
    goal: "Maximize estimate accuracy while ensuring carrier approval likelihood",
    utilityModel: {
      weights: { accuracy: 0.35, completeness: 0.25, approvalRate: 0.25, speed: 0.15 },
      thresholds: { minAccuracy: 0.85, minCompleteness: 0.9 },
      optimizationTarget: "approval_rate",
    },
  },
  {
    id: "agent-appeal",
    name: "AppealAgent",
    description: "Writes persuasive appeal and supplement letters with code citations",
    goal: "Overturn denials and secure supplements through compelling arguments",
    utilityModel: {
      weights: { persuasiveness: 0.4, codeCompliance: 0.3, successRate: 0.2, responseTime: 0.1 },
      thresholds: { minCodeCitations: 3, minPhotoReferences: 2 },
      optimizationTarget: "overturn_rate",
    },
  },
  {
    id: "agent-supplement",
    name: "SupplementAgent",
    description: "Prepares supplement documentation with justifications and evidence",
    goal: "Secure approval for additional scope items through thorough documentation",
    utilityModel: {
      weights: {
        justificationQuality: 0.35,
        evidenceCompleteness: 0.3,
        approvalRate: 0.25,
        amountSecured: 0.1,
      },
      thresholds: { minJustificationLength: 200, minPhotoCount: 5 },
      optimizationTarget: "supplement_approval_rate",
    },
  },
  {
    id: "agent-negotiation",
    name: "NegotiationAgent",
    description: "Provides carrier-specific negotiation strategies and tactics",
    goal: "Maximize final payout through strategic carrier interactions",
    utilityModel: {
      weights: {
        payoutIncrease: 0.4,
        carrierSatisfaction: 0.25,
        timeToResolution: 0.2,
        relationshipPreservation: 0.15,
      },
      thresholds: { minPayoutIncrease: 0.05, maxNegotiationRounds: 3 },
      optimizationTarget: "payout_increase",
    },
  },
  {
    id: "agent-planner",
    name: "PlannerAgent",
    description: "Recommends optimal next actions based on claim state and patterns",
    goal: "Guide users through most efficient claim workflow",
    utilityModel: {
      weights: {
        timeToCompletion: 0.35,
        approvalLikelihood: 0.3,
        userSatisfaction: 0.2,
        costEfficiency: 0.15,
      },
      thresholds: { minConfidence: 0.7, maxActionsPerState: 5 },
      optimizationTarget: "cycle_time",
    },
  },
  {
    id: "agent-risk",
    name: "RiskAnalysisAgent",
    description: "Identifies high-risk claims and recommends preventive actions",
    goal: "Reduce denials and delays through early risk detection",
    utilityModel: {
      weights: {
        denialPredictionAccuracy: 0.4,
        earlyWarningValue: 0.3,
        falsePositiveRate: 0.2,
        preventionSuccess: 0.1,
      },
      thresholds: { minRiskThreshold: 0.6, maxFalsePositiveRate: 0.15 },
      optimizationTarget: "denial_prevention",
    },
  },
  {
    id: "agent-claims-builder",
    name: "ClaimsBuilderAgent",
    description: "Builds complete claim packages with all required documentation",
    goal: "Create submission-ready claim packages",
    utilityModel: {
      weights: { completeness: 0.4, accuracy: 0.3, speed: 0.2, complianceScore: 0.1 },
      thresholds: { minCompleteness: 0.95 },
      optimizationTarget: "first_time_approval",
    },
  },
  {
    id: "agent-orchestrator",
    name: "OrchestratorAgent",
    description: "Coordinates multiple agents for complex claim workflows",
    goal: "Optimize multi-step claim processes",
    utilityModel: {
      weights: { efficiency: 0.35, outcomeQuality: 0.35, coordination: 0.2, adaptability: 0.1 },
      thresholds: { maxAgentsPerTask: 3 },
      optimizationTarget: "workflow_efficiency",
    },
  },
];

/**
 * Get all registered agents
 */
export async function getAllAgents(): Promise<AgentDefinition[]> {
  return AGENTS;
}

/**
 * Get a specific agent by ID
 */
export async function getAgentById(id: string): Promise<AgentDefinition | null> {
  return AGENTS.find((a) => a.id === id) || null;
}

/**
 * Get agent by name (e.g., "EstimateAgent", "AppealAgent")
 */
export async function getAgentByName(name: string): Promise<AgentDefinition | null> {
  return AGENTS.find((a) => a.name === name) || null;
}

/**
 * Create a new agent (adds to in-memory registry)
 */
export async function createAgent(data: Omit<AgentDefinition, "id">): Promise<AgentDefinition> {
  const newAgent: AgentDefinition = {
    id: `agent-${data.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`,
    name: data.name,
    description: data.description,
    goal: data.goal,
    utilityModel: data.utilityModel,
  };
  AGENTS.push(newAgent);
  return newAgent;
}

/**
 * Get agents suitable for a given action type
 */
export async function getAgentsForActionType(actionType: string): Promise<AgentDefinition[]> {
  // Map action types to agent names
  const agentMapping: Record<string, string[]> = {
    generate_estimate: ["EstimateAgent", "ClaimsBuilderAgent"],
    generate_letter: ["AppealAgent", "SupplementAgent"],
    recommend_next_step: ["PlannerAgent", "OrchestratorAgent"],
    negotiate: ["NegotiationAgent"],
    analyze_risk: ["RiskAnalysisAgent"],
  };

  const agentNames = agentMapping[actionType] || [];
  if (agentNames.length === 0) return [];

  return AGENTS.filter((a) => agentNames.includes(a.name));
}
