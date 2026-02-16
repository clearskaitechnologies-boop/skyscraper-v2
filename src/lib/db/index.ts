/**
 * Database Helper using Node-Postgres (pg)
 *
 * Provides connection pooling and query helpers for PostgreSQL.
 * Used by worker processes and server-side code.
 *
 * IMPORTANT: This uses a singleton pattern to prevent "Called end on pool more than once"
 * errors in serverless environments (Vercel). Never call pool.end() in API routes!
 */

import { Pool, PoolClient, QueryResultRow } from "pg";
import { logger } from "@/lib/logger";

// =============================================================================
// SINGLETON POOL (Vercel/Serverless Safe)
// =============================================================================

declare global {
  var __pgPool: Pool | undefined;
}

function makePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  const isProd = process.env.NODE_ENV === "production";

  if (!connectionString) {
    if (isProd) {
      throw new Error("DATABASE_URL is not set");
    }

    logger.warn("[DB] DATABASE_URL missing — running in stub mode (local only)");
    const stubError = new Error("DATABASE_URL is not set. Provide it to enable database access.");

    const stub: Partial<Pool> & { __stub: true } = {
      __stub: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      query: async () => {
        throw stubError;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      connect: async () => {
        throw stubError;
      },
      end: async () => undefined,
      on: () => stub as Pool,
    };

    return stub as Pool;
  }
  const isDev = process.env.NODE_ENV === "development";

  // eslint-disable-next-line no-restricted-syntax
  return new Pool({
    connectionString,
    // ✅ Disable SSL cert verification for both dev and prod
    // Supabase uses self-signed certs that Node doesn't trust by default
    ssl:
      connectionString.includes("sslmode=require") || isProd
        ? { rejectUnauthorized: false }
        : undefined,
    // Tune pool size for serverless (lower is better)
    max: parseInt(process.env.PGPOOL_MAX || "10", 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    application_name: "skai-app", // Helps with Postgres monitoring
  });
}

// Reuse the same pool across hot reloads & serverless invocations
const _pgPool: Pool = global.__pgPool ?? makePool();
if (!global.__pgPool) {
  global.__pgPool = _pgPool;
  logger.debug("✅ PostgreSQL singleton pool initialized");
}

// Primary export (recommended)
export const pgPool: Pool = _pgPool;

// Legacy exports for backward compatibility
export const pool: Pool = _pgPool;
export const db: Pool = _pgPool; // Alias for pool (used in some API routes)

// Log pool errors
pgPool.on("error", (err) => {
  logger.error("❌ Unexpected database pool error:", err);
});

// =============================================================================
// QUERY HELPERS
// =============================================================================

// Generic row type
export type Row = QueryResultRow;

/**
 * Execute parameterized query and return rows
 *
 * @param text - SQL query with $1, $2, etc. placeholders
 * @param params - Parameter values
 * @returns Array of result rows
 */
export async function q<T extends Row = Row>(text: string, params?: any[]): Promise<T[]> {
  try {
    const result = await pgPool.query<T>(text as any, params as any);
    return result.rows;
  } catch (error) {
    console.error("Database query failed:", { text, params, error });
    throw error;
  }
}

/**
 * Execute query and return first row or null
 *
 * @param text - SQL query
 * @param params - Parameter values
 * @returns First row or null
 */
export async function qOne<T extends Row = Row>(text: string, params?: any[]): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}

/**
 * Execute query and return single value
 *
 * @param text - SQL query that returns one column
 * @param params - Parameter values
 * @returns Single value or null
 */
export async function qScalar<T = any>(text: string, params?: any[]): Promise<T | null> {
  const row = await qOne<Record<string, T>>(text, params);
  if (!row) return null;
  const values = Object.values(row);
  return values.length > 0 ? values[0] : null;
}

/**
 * Execute query without returning results (INSERT, UPDATE, DELETE)
 *
 * @param text - SQL query
 * @param params - Parameter values
 * @returns Number of affected rows
 */
export async function qExec(text: string, params?: any[]): Promise<number> {
  try {
    const result = await pgPool.query(text, params);
    return result.rowCount || 0;
  } catch (error) {
    console.error("Database exec failed:", { text, params, error });
    throw error;
  }
}

// =============================================================================
// TRANSACTION HELPERS
// =============================================================================

/**
 * Execute callback within a transaction
 *
 * @param fn - Function to execute in transaction
 * @returns Result from callback
 */
export async function withTx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// =============================================================================
// CLIENT-SCOPED QUERY HELPERS (for use inside withTx)
// =============================================================================

/**
 * Client-scoped query returning many rows
 */
export async function cq<T extends Row = Row>(
  client: PoolClient,
  text: string,
  params?: any[]
): Promise<T[]> {
  const res = await client.query<T>(text as any, params as any);
  return res.rows;
}

/**
 * Client-scoped query returning single row
 */
export async function cqOne<T extends Row = Row>(
  client: PoolClient,
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await cq<T>(client, text, params);
  return rows[0] ?? null;
}

// =============================================================================
// CLEANUP (DO NOT USE IN API ROUTES!)
// =============================================================================

/**
 * Close pool and end all connections
 *
 * ⚠️ WARNING: DO NOT call this in API routes or serverless functions!
 * This is ONLY for long-running processes (workers, scripts) that need graceful shutdown.
 * Calling pool.end() in serverless will cause "Called end on pool more than once" errors.
 *
 * In API routes, always use client.release() instead.
 */
export async function closePool(): Promise<void> {
  // Only close if we're in a long-running process (not serverless)
  if (global.__pgPool && process.env.VERCEL !== "1") {
    // eslint-disable-next-line no-restricted-syntax
    await pgPool.end();
    global.__pgPool = undefined;
    logger.debug("✅ PostgreSQL pool closed");
  }
}

// Handle process termination (only in non-serverless environments)
if (process.env.VERCEL !== "1") {
  process.on("SIGTERM", async () => {
    await closePool();
  });

  process.on("SIGINT", async () => {
    await closePool();
  });
}
