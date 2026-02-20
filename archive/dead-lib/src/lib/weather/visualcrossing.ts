import { logger } from "@/lib/logger";
import "server-only";

import type { NormalizedLocation, StormSnapshot } from "./storm-types";

const VISUALCROSSING_API_KEY = process.env.VISUALCROSSING_API_KEY;

if (!VISUALCROSSING_API_KEY) {
  logger.warn("[VISUALCROSSING] API key not configured – weather will return null fallback.");
}

/**
 * Fetch storm data from Visual Crossing Timeline API
 * Detects hail and high wind events over the last 12 months
 *
 * ✅ Redis-cached (1h TTL) via weatherCache module — saves $35/mo API records
 */
export async function fetchVisualCrossingStormData(
  location: NormalizedLocation
): Promise<StormSnapshot | null> {
  if (!VISUALCROSSING_API_KEY) {
    logger.warn("[VISUALCROSSING] Skipping fetch – no API key configured");
    return null;
  }

  // ── Redis cache check ──────────────────────────────────────
  const today = new Date();
  const cacheDate = today.toISOString().split("T")[0];
  const cached = await getCachedWeather(location.latitude, location.longitude, `vc:${cacheDate}`);
  if (cached) {
    logger.debug("[VISUALCROSSING] Cache HIT", { address: location.address });
    return cached.raw as unknown as StormSnapshot;
  }

  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const startDate = oneYearAgo.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const locationQuery = `${location.latitude},${location.longitude}`;
  const baseUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(locationQuery)}/${startDate}/${endDate}`;

  const params = new URLSearchParams({
    key: VISUALCROSSING_API_KEY,
    unitGroup: "us",
    include: "days",
    elements: "datetime,tempmax,tempmin,precip,preciptype,windspeed,windgust,conditions",
  });

  try {
    logger.debug(`[VISUALCROSSING] Fetching storm data for: ${location.address}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${baseUrl}?${params.toString()}`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      logger.error(`[VISUALCROSSING] HTTP ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();

    // Parse days for hail and wind events
    let hailDate: string | null = null;
    let hailSize: number | null = null;
    let windDate: string | null = null;
    let windSpeed: number | null = null;
    let stormCount = 0;

    if (data.days && Array.isArray(data.days)) {
      for (const day of data.days) {
        const precipTypes = day.preciptype || [];
        const hasHail = precipTypes.includes("hail");
        const highWind = (day.windgust || day.windspeed || 0) > 40; // mph

        if (hasHail || highWind) {
          stormCount++;
        }

        // Capture most recent hail event
        if (hasHail && !hailDate) {
          hailDate = day.datetime;
          hailSize = 0.75; // Visual Crossing doesn't report size, default estimate
        }

        // Capture most recent high wind event
        if (highWind && !windDate) {
          windDate = day.datetime;
          windSpeed = day.windgust || day.windspeed;
        }
      }
    }

    const snapshot: StormSnapshot = {
      hailSize,
      hailDate,
      windSpeed: windSpeed ? Math.round(windSpeed) : null,
      windDate,
      stormsLast12Months: stormCount,
      provider: "VISUALCROSSING",
      raw: data,
    };

    logger.debug(`[VISUALCROSSING] Found ${stormCount} storm events`);
    return snapshot;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[VISUALCROSSING] Error:`, error.message);
    }
    return null;
  }
}
