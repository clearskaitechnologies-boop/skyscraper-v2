/**
 * PHASE 34: AI MODE SELECTOR
 *
 * Intelligent model selection based on:
 * - User preference (cheap/smart/auto)
 * - Token balance
 * - Org settings
 *
 * Models:
 * - CHEAP: gpt-4o-mini ($0.00015 input, $0.0006 output per 1K tokens)
 * - SMART: gpt-4o ($0.005 input, $0.015 output per 1K tokens)
 * - AUTO: Dynamic based on token balance threshold
 */

import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

import type { AIModel } from "./perf";

export type AIMode = "cheap" | "smart" | "auto";

const AUTO_THRESHOLD = 200; // Switch to cheap mode if balance below this

/**
 * Select appropriate model based on mode and context
 */
export async function selectModel(mode: AIMode, orgId: string): Promise<AIModel> {
  // If cheap mode explicitly requested
  if (mode === "cheap") {
    return "gpt-4o-mini";
  }

  // If smart mode explicitly requested
  if (mode === "smart") {
    return "gpt-4o";
  }

  // AUTO mode - check token balance
  const tokenWallet = await prisma.usage_tokens.findUnique({
    where: { orgId },
  });

  const balance = tokenWallet?.balance || 0;

  // Low balance - use cheap model
  if (balance < AUTO_THRESHOLD) {
    logger.debug(`[AI Mode] AUTO → CHEAP (balance: ${balance} < ${AUTO_THRESHOLD})`);
    return "gpt-4o-mini";
  }

  // Sufficient balance - use smart model
  logger.debug(`[AI Mode] AUTO → SMART (balance: ${balance})`);
  return "gpt-4o";
}

/**
 * Get model from Org settings with fallback
 */
export async function getOrgAIMode(orgId: string): Promise<AIMode> {
  try {
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: { aiModeDefault: true },
    });

    const mode = org?.aiModeDefault as AIMode;
    return mode || "auto";
  } catch (error) {
    logger.error("[AI Mode] Error getting Org mode:", error);
    return "auto";
  }
}

/**
 * Complete model selection flow with Org settings
 */
export async function selectModelForOrg(orgId: string): Promise<AIModel> {
  const mode = await getOrgAIMode(orgId);
  return selectModel(mode, orgId);
}

/**
 * Get estimated cost per 1K tokens for a model
 */
export function getModelCost(model: AIModel): { input: number; output: number } {
  const costs: Record<string, { input: number; output: number }> = {
    "gpt-4o": { input: 0.005, output: 0.015 },
    "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  };

  return costs[model] || costs["gpt-4o-mini"];
}

/**
 * Calculate cost savings from using cheap vs smart mode
 */
export function calculateSavings(
  tokensIn: number,
  tokensOut: number
): {
  smartCost: number;
  cheapCost: number;
  savings: number;
  savingsPercent: number;
} {
  const smartCosts = getModelCost("gpt-4o");
  const cheapCosts = getModelCost("gpt-4o-mini");

  const smartCost = (tokensIn / 1000) * smartCosts.input + (tokensOut / 1000) * smartCosts.output;
  const cheapCost = (tokensIn / 1000) * cheapCosts.input + (tokensOut / 1000) * cheapCosts.output;

  const savings = smartCost - cheapCost;
  const savingsPercent = smartCost > 0 ? (savings / smartCost) * 100 : 0;

  return {
    smartCost,
    cheapCost,
    savings,
    savingsPercent,
  };
}

/**
 * Check if Org has caching enabled
 */
export async function isCachingEnabled(orgId: string): Promise<boolean> {
  try {
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: { aiCacheEnabled: true },
    });

    return org?.aiCacheEnabled !== false; // Default true
  } catch (error) {
    logger.error("[AI Mode] Error checking cache settings:", error);
    return true; // Default enabled
  }
}

/**
 * Check if Org has deduplication enabled
 */
export async function isDedupeEnabled(orgId: string): Promise<boolean> {
  try {
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: { aiDedupeEnabled: true },
    });

    return org?.aiDedupeEnabled !== false; // Default true
  } catch (error) {
    logger.error("[AI Mode] Error checking dedupe settings:", error);
    return true; // Default enabled
  }
}

/**
 * Get cache TTL for Org
 */
export async function getCacheTTL(orgId: string): Promise<number> {
  try {
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: { aiCacheTTL: true },
    });

    return org?.aiCacheTTL || 604800; // Default 7 days
  } catch (error) {
    logger.error("[AI Mode] Error getting cache TTL:", error);
    return 604800;
  }
}
