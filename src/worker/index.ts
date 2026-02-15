/**
 * Worker Entry Point
 *
 * Background worker process for handling async jobs.
 * Subscribes to job queues and processes them.
 *
 * Run with: pnpm run worker
 * Or in Railway: npm run worker
 */

import { subscribe, type Job as PgBossJob } from "../lib/queue/index.js";
import { jobDamageAnalyze } from "./jobs/damage-analyze.js";
import { jobProposalGenerate } from "./jobs/proposal-generate.js";
import { jobWeatherAnalyze } from "./jobs/weather-analyze.js";

// =============================================================================
// JOB HANDLERS
// =============================================================================

/**
 * Echo Job - Health Check
 */
async function jobEcho(payload: any, job: PgBossJob) {
  console.log("=".repeat(80));
  console.log("ECHO_JOB_RECEIVED");
  console.log("Job ID:", job.id);
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("Timestamp:", new Date().toISOString());
  console.log("=".repeat(80));
}

// =============================================================================
// WORKER STARTUP
// =============================================================================

async function startWorker() {
  console.log("=".repeat(80));
  console.log("WORKER STARTING");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Environment:", process.env.NODE_ENV || "development");
  console.log("=".repeat(80));

  if (!process.env.DATABASE_URL) {
    console.error(
      "[worker] DATABASE_URL missing — worker will not start. Set DATABASE_URL or run pnpm start for web only."
    );
    process.exit(1);
  }

  try {
    // Subscribe to job queues
    await subscribe("echo", jobEcho);
    console.log("✅ Subscribed to: echo");

    await subscribe("damage-analyze", jobDamageAnalyze, {
      batchSize: 2, // Process 2 jobs at a time
    });
    console.log("✅ Subscribed to: damage-analyze");

    await subscribe("proposal-generate", jobProposalGenerate, {
      batchSize: 1, // Process 1 at a time
    });
    console.log("✅ Subscribed to: proposal-generate");

    await subscribe("weather-analyze", jobWeatherAnalyze, {
      batchSize: 3, // Process 3 at a time
    });
    console.log("✅ Subscribed to: weather-analyze");

    console.log("=".repeat(80));
    console.log("WORKER ONLINE - Ready to process jobs");
    console.log("=".repeat(80));
  } catch (error) {
    console.error("Failed to start worker:", error);
    process.exit(1);
  }
}

// Start the worker
startWorker().catch((error) => {
  console.error("Worker crashed:", error);
  process.exit(1);
});
