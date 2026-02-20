/**
 * Carrier Strategy Cache Module
 * 
 * Caches carrier routing decisions to reduce computation overhead.
 * 
 * Strategy:
 * - 30-minute TTL (strategies rarely change)
 * - Cache key: carrier name (normalized)
 * - In-memory fallback (if Redis unavailable)
 * - Fire-and-forget writes (non-blocking)
 * 
 * Impact:
 * - Faster claim context building
 * - Reduced CPU usage
 * - Consistent strategy across requests
 */

import { logger } from "@/lib/observability/logger";
import { getUpstashRedis } from "@/lib/upstash";

const CARRIER_STRATEGY_CACHE_TTL = 1800; // 30 minutes in seconds

export interface CarrierStrategy {
  tone: "conciliatory" | "assertive" | "procedural";
  emphasize: string[];
  requireCitations: boolean;
}

// In-memory fallback cache (used if Redis unavailable)
const memoryCache = new Map<string, { strategy: CarrierStrategy; expiresAt: number }>();

/**
 * Get cached carrier strategy
 */
export async function getCachedCarrierStrategy(
  carrier: string
): Promise<CarrierStrategy | null> {
  const normalizedCarrier = normalizeCarrierName(carrier);

  try {
    const redis = getUpstashRedis();
    
    // Try Redis first
    if (redis) {
      const cacheKey = buildCarrierCacheKey(normalizedCarrier);
      const cached = await redis.get(cacheKey);

      if (cached) {
        logger.debug("Carrier strategy cache hit (Redis)", { carrier: normalizedCarrier });
        return cached as CarrierStrategy;
      }
    }

    // Fallback to memory cache
    const memoryCached = memoryCache.get(normalizedCarrier);
    if (memoryCached && memoryCached.expiresAt > Date.now()) {
      logger.debug("Carrier strategy cache hit (memory)", { carrier: normalizedCarrier });
      return memoryCached.strategy;
    }

    logger.debug("Carrier strategy cache miss", { carrier: normalizedCarrier });
    return null;
  } catch (error: any) {
    logger.error("Carrier strategy cache read error", { error: error.message });
    
    // Try memory cache as fallback
    const memoryCached = memoryCache.get(normalizedCarrier);
    if (memoryCached && memoryCached.expiresAt > Date.now()) {
      return memoryCached.strategy;
    }
    
    return null;
  }
}

/**
 * Set cached carrier strategy
 * Fire-and-forget operation (doesn't block caller)
 */
export async function setCachedCarrierStrategy(
  carrier: string,
  strategy: CarrierStrategy
): Promise<void> {
  const normalizedCarrier = normalizeCarrierName(carrier);

  try {
    // Store in Redis
    const redis = getUpstashRedis();
    if (redis) {
      const cacheKey = buildCarrierCacheKey(normalizedCarrier);
      await redis.set(cacheKey, strategy, { ex: CARRIER_STRATEGY_CACHE_TTL });
      logger.debug("Carrier strategy cached (Redis)", {
        carrier: normalizedCarrier,
        ttl: CARRIER_STRATEGY_CACHE_TTL,
      });
    }

    // Also store in memory cache as fallback
    memoryCache.set(normalizedCarrier, {
      strategy,
      expiresAt: Date.now() + CARRIER_STRATEGY_CACHE_TTL * 1000,
    });
    
    logger.debug("Carrier strategy cached (memory)", { carrier: normalizedCarrier });
  } catch (error: any) {
    logger.error("Carrier strategy cache write error", { error: error.message });
    // Don't throw - cache writes are non-critical
  }
}

/**
 * Invalidate carrier strategy cache
 */
export async function invalidateCarrierStrategy(carrier: string): Promise<void> {
  const normalizedCarrier = normalizeCarrierName(carrier);

  try {
    const redis = getUpstashRedis();
    if (redis) {
      const cacheKey = buildCarrierCacheKey(normalizedCarrier);
      await redis.del(cacheKey);
      logger.debug("Carrier strategy cache invalidated (Redis)", { carrier: normalizedCarrier });
    }

    // Also clear from memory cache
    memoryCache.delete(normalizedCarrier);
    logger.debug("Carrier strategy cache invalidated (memory)", { carrier: normalizedCarrier });
  } catch (error: any) {
    logger.error("Carrier strategy cache invalidation error", { error: error.message });
  }
}

/**
 * Build cache key from carrier name
 */
function buildCarrierCacheKey(normalizedCarrier: string): string {
  return `carrier_strategy:${normalizedCarrier}`;
}

/**
 * Normalize carrier name for consistent caching
 */
function normalizeCarrierName(carrier: string): string {
  return carrier
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_") // Replace non-alphanumeric with underscore
    .replace(/_+/g, "_") // Collapse multiple underscores
    .replace(/^_|_$/g, ""); // Trim leading/trailing underscores
}

/**
 * Get cache statistics
 */
export async function getCarrierCacheStats(): Promise<{
  redisKeys: number;
  memoryKeys: number;
  estimatedSize: string;
} | null> {
  try {
    const redis = getUpstashRedis();
    let redisKeys = 0;

    if (redis) {
      const keys = await redis.keys("carrier_strategy:*");
      redisKeys = keys.length;
    }

    // Clean up expired memory cache entries
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
      if (value.expiresAt <= now) {
        memoryCache.delete(key);
      }
    }

    return {
      redisKeys,
      memoryKeys: memoryCache.size,
      estimatedSize: `~${Math.round(((redisKeys + memoryCache.size) * 1) / 1024)}KB`,
    };
  } catch (error: any) {
    logger.error("Carrier strategy cache stats error", { error: error.message });
    return null;
  }
}

/**
 * Clear all carrier strategy caches (use sparingly)
 */
export async function clearAllCarrierCaches(): Promise<void> {
  try {
    const redis = getUpstashRedis();
    if (redis) {
      const keys = await redis.keys("carrier_strategy:*");
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info("Cleared all carrier strategy caches (Redis)", { count: keys.length });
      }
    }

    memoryCache.clear();
    logger.info("Cleared all carrier strategy caches (memory)");
  } catch (error: any) {
    logger.error("Clear carrier caches error", { error: error.message });
  }
}
