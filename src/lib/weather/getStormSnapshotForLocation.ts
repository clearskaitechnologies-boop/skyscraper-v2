import "server-only";

import type { NormalizedLocation, StormSnapshot } from "./storm-types";
import { fetchVisualCrossingStormData } from "./visualcrossing";
import { getDashboardWeather } from "./weatherstack";

// Simple in-memory cache with 5-minute TTL
const cache = new Map<string, { data: StormSnapshot | null; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Smart orchestrator for storm data
 * Tries Visual Crossing first (more detailed historical data)
 * Falls back to Weatherstack for basic weather data
 * Includes simple in-memory caching
 */
export async function getStormSnapshotForLocation(
  location: NormalizedLocation
): Promise<StormSnapshot | null> {
  const cacheKey = `${location.latitude},${location.longitude}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    console.log(`[STORM_INTEL] Cache hit for ${location.address}`);
    return cached.data;
  }

  console.log(`[STORM_INTEL] Fetching fresh storm data for ${location.address}`);

  // Try Visual Crossing first (better for historical storm events)
  let snapshot = await fetchVisualCrossingStormData(location);

  // Fallback to Weatherstack if Visual Crossing fails
  if (!snapshot) {
    console.log(`[STORM_INTEL] Visual Crossing failed, trying Weatherstack fallback`);
    const weather = await getDashboardWeather(`${location.latitude},${location.longitude}`);

    if (weather) {
      // Weatherstack doesn't have historical storm data, but we can return basic info
      snapshot = {
        hailSize: null,
        hailDate: null,
        windSpeed: weather.windSpeed || null,
        windDate: null,
        stormsLast12Months: 0,
        provider: "WEATHERSTACK",
      };
      console.log(`[STORM_INTEL] ⚠️ Using Weatherstack fallback (limited data)`);
    }
  }

  if (snapshot) {
    console.log(`[STORM_INTEL] ✅ Storm data retrieved via ${snapshot.provider}`);
  } else {
    console.log(`[STORM_INTEL] ⚠️ No storm data available for location`);
  }

  // Cache result
  cache.set(cacheKey, {
    data: snapshot,
    expires: Date.now() + CACHE_TTL,
  });

  return snapshot;
}

/**
 * Clear the storm data cache (useful for testing)
 */
export function clearStormCache(): void {
  cache.clear();
  console.log(`[STORM_INTEL] Cache cleared`);
}
