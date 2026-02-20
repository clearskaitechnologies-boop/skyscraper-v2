/**
 * TASK 157: DISTRIBUTED CACHING
 *
 * Multi-layer distributed cache with Redis cluster.
 */

import prisma from "@/lib/prisma";

export type CacheLevel = "L1" | "L2" | "L3";

export interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  level: CacheLevel;
  createdAt: Date;
  expiresAt: Date;
  hits: number;
}

// In-memory L1 cache
const l1Cache = new Map<string, any>();

/**
 * Get from cache (multi-level)
 */
export async function getCached<T>(key: string): Promise<T | null> {
  // L1: Memory cache
  if (l1Cache.has(key)) {
    await incrementHits(key, "L1");
    return l1Cache.get(key);
  }

  // L2: Redis (simulated with DB)
  const l2Entry = await prisma.cacheEntry.findUnique({
    where: { key_level: { key, level: "L2" } },
  });

  if (l2Entry && new Date() < l2Entry.expiresAt) {
    // Promote to L1
    l1Cache.set(key, l2Entry.value);
    await incrementHits(key, "L2");
    return l2Entry.value as T;
  }

  // L3: Database cache
  const l3Entry = await prisma.cacheEntry.findUnique({
    where: { key_level: { key, level: "L3" } },
  });

  if (l3Entry && new Date() < l3Entry.expiresAt) {
    // Promote to L2 and L1
    l1Cache.set(key, l3Entry.value);
    await setCache(key, l3Entry.value, l3Entry.ttl, "L2");
    await incrementHits(key, "L3");
    return l3Entry.value as T;
  }

  return null;
}

/**
 * Set cache value
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number = 3600,
  level: CacheLevel = "L2"
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttl * 1000);

  if (level === "L1" || level === "L2") {
    l1Cache.set(key, value);
  }

  if (level === "L2" || level === "L3") {
    await prisma.cacheEntry.upsert({
      where: { key_level: { key, level } },
      update: {
        value: value as any,
        ttl,
        expiresAt,
      },
      create: {
        key,
        value: value as any,
        ttl,
        level,
        expiresAt,
        hits: 0,
      } as any,
    });
  }
}

/**
 * Invalidate cache
 */
export async function invalidateCache(key: string): Promise<void> {
  // Clear all levels
  l1Cache.delete(key);

  await prisma.cacheEntry.deleteMany({
    where: { key },
  });
}

/**
 * Invalidate by pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<number> {
  // Clear L1 matching pattern
  const regex = new RegExp(pattern);
  let count = 0;

  for (const key of l1Cache.keys()) {
    if (regex.test(key)) {
      l1Cache.delete(key);
      count++;
    }
  }

  // Clear database cache
  const result = await prisma.cacheEntry.deleteMany({
    where: {
      key: {
        contains: pattern,
      },
    },
  });

  return count + result.count;
}

/**
 * Increment hit counter
 */
async function incrementHits(key: string, level: CacheLevel): Promise<void> {
  await prisma.cacheEntry.updateMany({
    where: { key, level },
    data: {
      hits: { increment: 1 },
    } as any,
  });
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  l1Size: number;
  l2Size: number;
  l3Size: number;
  totalHits: number;
  hitRate: number;
}> {
  const [l2Count, l3Count, entries] = await Promise.all([
    prisma.cacheEntry.count({ where: { level: "L2" } }),
    prisma.cacheEntry.count({ where: { level: "L3" } }),
    prisma.cacheEntry.findMany({
      select: { hits: true },
    }),
  ]);

  const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);
  const totalEntries = l1Cache.size + l2Count + l3Count;
  const hitRate = totalEntries > 0 ? (totalHits / totalEntries) * 100 : 0;

  return {
    l1Size: l1Cache.size,
    l2Size: l2Count,
    l3Size: l3Count,
    totalHits,
    hitRate,
  };
}

/**
 * Cleanup expired entries
 */
export async function cleanupExpiredCache(): Promise<number> {
  const result = await prisma.cacheEntry.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  return result.count;
}

/**
 * Warm cache with frequently accessed data
 */
export async function warmCache(
  dataFetcher: () => Promise<Record<string, any>>,
  ttl: number = 3600
): Promise<number> {
  const data = await dataFetcher();
  let count = 0;

  for (const [key, value] of Object.entries(data)) {
    await setCache(key, value, ttl, "L2");
    count++;
  }

  return count;
}

/**
 * Get hot keys (most accessed)
 */
export async function getHotKeys(limit: number = 10): Promise<
  {
    key: string;
    hits: number;
    level: CacheLevel;
  }[]
> {
  const entries = await prisma.cacheEntry.findMany({
    orderBy: { hits: "desc" },
    take: limit,
    select: { key: true, hits: true, level: true },
  });

  return entries as any;
}
