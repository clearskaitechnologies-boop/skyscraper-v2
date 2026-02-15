/**
 * AI System - Central Export
 *
 * Main entry point for all AI capabilities.
 * Provides unified access to all 275 AI modules through the core router.
 */

export * from "./router";

// Re-export all AI modules for direct access if needed
export * from "./3d";
export * from "./active";
export * from "./adaptation";
export * from "./captioning";
export * from "./classification";
export * from "./continual";
export * from "./exploration";
export * from "./few-shot";
export * from "./gan";
export * from "./graph";
export * from "./inference";
export * from "./keypoints";
export * from "./meta";
export * from "./multi-agent";
export * from "./prompting";
export * from "./quantization";
export * from "./retrieval";
export * from "./segmentation";
export * from "./semantic";
export * from "./transfer";
export * from "./video";

// ============================================
// AI INTELLIGENCE CORE - NEW ORCHESTRATION LAYER
// ============================================

// Main orchestrator
export type { OrchestratorInput, OrchestratorOutput } from "./orchestrator/orchestrateClaim";
export { orchestrateClaim, shouldTakeAction } from "./orchestrator/orchestrateClaim";

// Intelligence types
export * from "./types";

// Agents
export { createAgent,getAgentById, getAgentByName, getAllAgents } from "./agents";
export { calculateUtility, selectBestAction } from "./agents/utilityFunctions";

// Rules
export { evaluateClaimRules } from "./rules/evaluateRules";
export { createRule,evaluateRulesForClaim, getAllRules } from "./rules/ruleEngine";

// State Machine
export {
  getAllowedNextStates,
  getClaimStateHistory,
  getCurrentClaimState,
  transitionClaimState,
} from "./planner/stateMachine";

// Planner
export { getNextActionsForClaim } from "./planner/claimPlanner";

// Feedback
export { getAgentActions,getClaimActions, logAIAction } from "./feedback/logAction";
export { calculateSuccessRate,logAIOutcome } from "./feedback/logOutcome";

// Similarity
export { createOrUpdateClaimEmbedding, generateMissingEmbeddings } from "./similarity/embedClaim";
export { findSimilarClaims, getSimilarClaimsWithDetails } from "./similarity/querySimilarClaims";

// Explanations
export {
  buildExplanation,
  getExplanation,
  saveExplanation,
} from "./explanations/generateExplanation";

// Learning
export { computeDiff, extractMeaningfulEdits } from "./preferences/diffTools";
export {
  analyzeHumanEdits,
  generateTrainingData,
  logHumanEdit,
} from "./preferences/learnPreferences";

// Negotiation
export {
  getAllCarrierStrategies,
  getCarrierStrategy,
  upsertCarrierStrategy,
} from "./negotiation/carrierProfiles";
export { getNegotiationSuggestions } from "./negotiation/strategyEngine";
