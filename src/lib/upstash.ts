import { Redis } from "@upstash/redis";

// IMPORTANT:
// This module provides SAFE accessors for Upstash Redis.
// Never throw at module evaluation time – missing env MUST degrade gracefully.
// Always guard usage sites against a null client.
// Pattern:
//   const redis = createRedisClientSafely();
//   if (!redis) { /* handle absence (fail-open / warn) */ }

let client: Redis | null | undefined = undefined; // undefined = uninitialized sentinel

export function createRedisClientSafely(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    client = null;
    return client;
  }
  client = new Redis({ url, token });
  return client;
}

// Backward-compatible alias used by existing imports
export function getUpstash(): Redis | null {
  return createRedisClientSafely();
}

export const upstash: Redis | null = createRedisClientSafely();

// Alias for evidenceUrlCache
export const getUpstashRedis = getUpstash;
