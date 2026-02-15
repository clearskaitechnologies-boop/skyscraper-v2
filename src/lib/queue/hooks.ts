/**
 * Queue Job Hooks
 * 
 * Utilities for recording job events and token spend during job execution.
 * Used by all worker jobs to track status and charge tokens.
 */

import type { Job } from "pg-boss";

import { pool } from "../db/index.js";

/**
 * Record a job event for UI tracking
 * 
 * @param job - pg-boss job object
 * @param status - queued|working|completed|failed|cancelled|retry
 * @param message - Optional status message
 * @param result - Optional result data
 */
export async function recordJobEvent(
  job: Job,
  status: string,
  message?: string,
  result?: any
): Promise<void> {
  const query = `
    INSERT INTO job_events (job_name, job_id, status, message, payload, result, attempts)
    VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7)
  `;

  await pool.query(query, [
    job.name,
    job.id,
    status,
    message || null,
    job.data || {},
    result || {},
    (job as any).attempts || 0,
  ]);

  console.log(`Job event recorded: ${job.name} (${job.id}) → ${status}`);
}

/**
 * Record token spend for a job
 * 
 * @param job - pg-boss job object
 * @param feature - Feature name (e.g., "damage-analyze", "weather-analyze")
 * @param delta - Token delta (negative for spend, positive for credit)
 */
export async function spendTokens(
  job: Job,
  feature: string,
  delta: number
): Promise<void> {
  const orgId = (job.data as any)?.orgId || null;
  const userId = (job.data as any)?.userId || null;

  const query = `
    INSERT INTO token_ledger (org_id, userId, feature, delta, ref_job_id, meta)
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)
  `;

  await pool.query(query, [
    orgId,
    userId,
    feature,
    delta,
    job.id,
    { at: new Date().toISOString() },
  ]);

  console.log(`Token spend recorded: ${feature} → ${delta} tokens (org: ${orgId})`);
}
