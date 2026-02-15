/**
 * Echo Job - Health Check
 * 
 * Simple job to verify queue and worker are functioning.
 * Logs the payload and completes immediately.
 */

import type { JobHandler } from "@/lib/queue";

export interface EchoPayload {
  message?: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Echo job handler - logs payload and returns
 */
export const jobEcho: JobHandler<EchoPayload> = async (payload, job) => {
  console.log("=".repeat(80));
  console.log("ECHO_JOB_RECEIVED");
  console.log("Job ID:", job.id);
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("Timestamp:", new Date().toISOString());
  console.log("=".repeat(80));

  // Job completes successfully
  return;
};
