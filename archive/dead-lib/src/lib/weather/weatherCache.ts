/**
 * Weather Cache Module
 *
 * Caches weather API responses to reduce external API calls.
 *
 * Strategy:
 * - 1-hour TTL (weather data doesn't change frequently)
 * - Cache key: lat, lng, lossDate (unique weather query)
 * - Fire-and-forget writes (non-blocking)
 * - Graceful degradation (fails open if Redis unavailable)
 *
 * Impact:
 * - Reduces weather API costs
 * - Faster claim context building
 * - Better reliability (cache serves stale data if API down)
 */

import { logger } from "@/lib/observability/logger";
import { recordCacheStat } from "@/lib/telemetry";
import { getUpstashRedis } from "@/lib/upstash";

const WEATHER_CACHE_TTL = 3600; // 1 hour in seconds

interface WeatherData {
  maxWindGustMph: number | null;
  maxSustainedWindMph: number | null;
  maxHailInches: number | null;
  precipitationIn: number | null;
  snowfallIn: number | null;
  sourceLabel: string;
  provider: string;
  fetchedAt: string;
  raw: Record<string, unknown>;
}

/**
 * Get cached weather data
 */
export async function getCachedWeather(
  lat: number,
  lng: number,
  lossDate: string
): Promise<WeatherData | null> {
  try {
    const redis = getUpstashRedis();
    if (!redis) return null;

    const cacheKey = buildWeatherCacheKey(lat, lng, lossDate);
    const startTime = Date.now();
    const cached = await redis.get(cacheKey);
    const durationMs = Date.now() - startTime;

    if (!cached) {
      logger.debug("Weather cache miss", { lat, lng, lossDate });

      await recordCacheStat({
        orgId: null,
        cacheName: "weather",
        op: "get",
        hit: false,
        key: cacheKey,
        ttlSeconds: WEATHER_CACHE_TTL,
        durationMs,
      });
      return null;
    }

    logger.debug("Weather cache hit", { lat, lng, lossDate });

    await recordCacheStat({
      orgId: null,
      cacheName: "weather",
      op: "get",
      hit: true,
      key: cacheKey,
      ttlSeconds: WEATHER_CACHE_TTL,
      durationMs,
    });
    return cached as WeatherData;
  } catch (error: any) {
    logger.error("Weather cache read error", { error: error.message });
    return null;
  }
}

/**
 * Set cached weather data
 * Fire-and-forget operation (doesn't block caller)
 */
export async function setCachedWeather(
  lat: number,
  lng: number,
  lossDate: string,
  data: WeatherData
): Promise<void> {
  try {
    const redis = getUpstashRedis();
    if (!redis) return;

    const cacheKey = buildWeatherCacheKey(lat, lng, lossDate);
    const startTime = Date.now();
    await redis.set(cacheKey, data, { ex: WEATHER_CACHE_TTL });

    await recordCacheStat({
      orgId: null,
      cacheName: "weather",
      op: "set",
      hit: null,
      key: cacheKey,
      ttlSeconds: WEATHER_CACHE_TTL,
      durationMs: Date.now() - startTime,
    });

    logger.debug("Weather cached", { lat, lng, lossDate, ttl: WEATHER_CACHE_TTL });
  } catch (error: any) {
    logger.error("Weather cache write error", { error: error.message });
    // Don't throw - cache writes are non-critical
  }
}

/**
 * Invalidate weather cache for a location
 */
export async function invalidateWeatherCache(
  lat: number,
  lng: number,
  lossDate: string
): Promise<void> {
  try {
    const redis = getUpstashRedis();
    if (!redis) return;

    const cacheKey = buildWeatherCacheKey(lat, lng, lossDate);
    await redis.del(cacheKey);

    logger.debug("Weather cache invalidated", { lat, lng, lossDate });
  } catch (error: any) {
    logger.error("Weather cache invalidation error", { error: error.message });
  }
}

/**
 * Build cache key from coordinates and loss date
 */
function buildWeatherCacheKey(lat: number, lng: number, lossDate: string): string {
  // Round coordinates to 3 decimal places (~111m precision)
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;

  // Normalize date to YYYY-MM-DD
  const normalizedDate = lossDate.split("T")[0];

  return `weather:${roundedLat},${roundedLng}:${normalizedDate}`;
}

/**
 * Get cache statistics
 */
export async function getWeatherCacheStats(): Promise<{
  totalKeys: number;
  estimatedSize: string;
} | null> {
  try {
    const redis = getUpstashRedis();
    if (!redis) return null;

    // Count keys matching weather:* pattern
    // Note: This is expensive in production, use sparingly
    const keys = await redis.keys("weather:*");

    return {
      totalKeys: keys.length,
      estimatedSize: `~${Math.round((keys.length * 2) / 1024)}KB`, // Rough estimate
    };
  } catch (error: any) {
    logger.error("Weather cache stats error", { error: error.message });
    return null;
  }
}
