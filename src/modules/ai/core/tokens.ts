// This is a safe stub for a feature that has been temporarily disabled
// due to its backing database model not being present in the current schema.
// All functions are no-ops or return empty/default values to prevent
// breaking changes in other parts of the application that import this module.

import type { AITokenBucket, AIUsageSummary } from "../types";

/**
 * Deduct tokens from a bucket and record usage
 */
export async function deductTokens(
  _userId: string,
  _orgId: string,
  _bucket: AITokenBucket,
  _amount: number,
  _reason: string
): Promise<void> {
  // Feature disabled. Intentionally no-op.
  return;
}

/**
 * Get usage summary for all buckets
 */
export async function getUsageSummary(_userId: string, _orgId: string): Promise<AIUsageSummary> {
  // Feature disabled.
  return {
    mockup: { used: 0, limit: 100, remaining: 100 },
    dol: { used: 0, limit: 50, remaining: 50 },
    weather: { used: 0, limit: 50, remaining: 50 },
  };
}

/**
 * Validate that user has sufficient quota for a bucket
 */
export async function validateQuota(
  _userId: string,
  _orgId: string,
  _bucket: AITokenBucket,
  _amount: number = 1
): Promise<void> {
  // Feature disabled. Intentionally no-op.
  return;
}
