import { logger } from "@/lib/logger";

/**
 * LEGACY FEATURE GATING
 *
 * This file provides a centralized way to disable features that depend on
 * database models or columns that no longer exist. Instead of ripping out
 * the UI, we can use these helpers to gracefully degrade functionality,
 * log a warning, and return empty data.
 *
 * This is a temporary measure to allow the app to compile and run while
 * we progressively refactor or remove the legacy UI.
 */

const gatedFeatures = new Set<string>();

/**
 * Marks a feature as gated and logs a warning to the console the first time
 * it's called for a given feature key. This prevents spamming the logs.
 *
 * @param key A unique key for the feature being gated (e.g., "claim_supplements").
 * @param reason A short explanation of why the feature is disabled.
 */
export function legacyDisabled(key: string, reason: string): void {
  if (!gatedFeatures.has(key)) {
    logger.warn(`🔶 LEGACY FEATURE DISABLED: "${key}" is not available. ${reason}.`);
    gatedFeatures.add(key);
  }
}

/**
 * Checks if a feature has been disabled via a call to legacyDisabled.
 *
 * @param key The unique key for the feature.
 * @returns `true` if the feature is disabled, `false` otherwise.
 */
export function isLegacyDisabled(key: string): boolean {
  return gatedFeatures.has(key);
}
