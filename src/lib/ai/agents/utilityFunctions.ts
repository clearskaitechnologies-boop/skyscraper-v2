/**
 * Utility Functions for AI Agents
 *
 * Calculate utility scores for different actions and outcomes.
 * Higher utility = better outcome from the agent's perspective.
 */

import { AgentDefinition, UtilityContext } from "../types";

/**
 * Calculate utility score for an agent in a given context
 *
 * Utility combines multiple factors:
 * - Approval rate (how often this succeeds)
 * - Cycle time (faster is better)
 * - Estimate value (higher payouts preferred)
 * - Customer satisfaction
 */
export function calculateUtility(agent: AgentDefinition, context: UtilityContext): number {
  const { metrics } = context;

  // Extract key metrics
  const approvalRate = metrics.approvalRate ?? 0.5;
  const cycleTimeDays = metrics.cycleTimeDays ?? 30;
  const customerSat = metrics.customerSatisfaction ?? 0.7;
  const avgPayout = metrics.avgPayout ?? 0;

  // Normalize cycle time (30 days = 1.0, faster is better)
  const normalizedCycleTime = Math.min(1, 30 / Math.max(cycleTimeDays, 1));

  // Normalize payout (assume $50k is max target)
  const normalizedPayout = Math.min(1, avgPayout / 50000);

  // Check if agent has custom utility model
  if (agent.utilityModel && typeof agent.utilityModel === "object") {
    const weights = agent.utilityModel.weights || {};
    const approvalWeight = weights.approval ?? 0.4;
    const cycleWeight = weights.cycleTime ?? 0.3;
    const payoutWeight = weights.payout ?? 0.2;
    const satisfactionWeight = weights.satisfaction ?? 0.1;

    return (
      approvalWeight * approvalRate +
      cycleWeight * normalizedCycleTime +
      payoutWeight * normalizedPayout +
      satisfactionWeight * customerSat
    );
  }

  // Default utility calculation
  return (
    0.4 * approvalRate + 0.3 * normalizedCycleTime + 0.2 * normalizedPayout + 0.1 * customerSat
  );
}

/**
 * Calculate expected utility for taking a specific action
 */
export function calculateExpectedUtility(
  actionType: string,
  context: UtilityContext,
  historicalData?: {
    successRate: number;
    avgImprovement: number;
  }
): number {
  const baseUtility = context.metrics.baseUtility ?? 0.5;

  if (!historicalData) {
    // Conservative estimate without historical data
    return baseUtility * 0.8;
  }

  const { successRate, avgImprovement } = historicalData;

  // Expected utility = base * success_rate * (1 + improvement)
  return baseUtility * successRate * (1 + avgImprovement);
}

/**
 * Compare two actions and return the one with higher utility
 */
export function selectBestAction(
  actions: Array<{
    actionType: string;
    utility: number;
    cost: number;
  }>
): string {
  if (actions.length === 0) return "";

  // Calculate utility-to-cost ratio
  const scored = actions.map((a) => ({
    actionType: a.actionType,
    score: a.utility / Math.max(a.cost, 0.1), // Avoid division by zero
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored[0].actionType;
}

/**
 * Calculate utility improvement from historical edits
 */
export function calculateLearningDelta(originalUtility: number, improvedUtility: number): number {
  return improvedUtility - originalUtility;
}
