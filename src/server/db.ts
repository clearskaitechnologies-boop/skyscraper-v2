/**
 * ⚠️ DEPRECATED: Use shared pgPool from "@/lib/db" instead
 *
 * This file creates a duplicate pool which violates connection pooling best practices.
 * Import { pgPool } from "@/lib/db" in all new code.
 */

import { pgPool } from "@/lib/db";

// Re-export the shared pool for backward compatibility
export const pool = pgPool;
export default pool;
