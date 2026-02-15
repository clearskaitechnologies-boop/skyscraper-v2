/**
 * FREE WEATHER STACK - Event Scoring & DOL Selection
 * Scores weather events by proximity + magnitude
 */

import type { DOLResult,PropertyContext, ScoredEvent, WeatherEvent } from "@/types/weather";

import { bearingDeg, cardinal, geomCentroid,haversineMiles } from "./geo";

/**
 * Score all weather events for a specific property
 */
/**
 * Score all events for a property, return scored events and grouped by date
 */
export function scoreEventsForProperty(
  events: WeatherEvent[],
  property: PropertyContext
): { scored: ScoredEvent[]; byDate: Map<string, number> } {
  const scored: ScoredEvent[] = events.map((event) => {
    const [lon, lat] = geomCentroid(event.geometry);
    const eventLoc = { lat, lon };
    const distance_miles = haversineMiles(property, eventLoc);
    const bearing_deg = bearingDeg(property, eventLoc);
    const direction_cardinal = cardinal(bearing_deg);

    const magnitudeScore = calculateMagnitudeScore(event);
    const proximityScore = calculateProximityScore(distance_miles);
    const score = magnitudeScore + proximityScore;

    return {
      ...event,
      distance_miles,
      bearing_deg,
      direction_cardinal,
      score,
    };
  });

  // Group by date
  const byDate = new Map<string, number>();
  scored.forEach((e) => {
    const day = e.time_utc.split("T")[0];
    const current = byDate.get(day) || 0;
    byDate.set(day, Math.max(current, e.score));
  });

  return { scored, byDate };
}

/**
 * Calculate magnitude score (hail size, wind speed, warning severity)
 */
function calculateMagnitudeScore(event: WeatherEvent): number {
  // Hail reports: 1" = 10 points, 2" = 20 points, etc.
  if (event.type === "hail_report" && event.magnitude) {
    return Math.min(50, event.magnitude * 10);
  }

  // Wind reports: 50mph = 5 points, 100mph = 10 points
  if (event.type === "wind_report" && event.magnitude) {
    return Math.min(30, (event.magnitude / 10) * 1);
  }

  // Tornado warnings: high severity
  if (event.type === "tor_warning") return 40;

  // Severe thunderstorm warnings: moderate severity
  if (event.type === "svr_warning") return 25;

  // Flash flood warnings: moderate severity
  if (event.type === "ff_warning") return 20;

  return 5; // Default for unknown types
}

/**
 * Calculate proximity score (closer = better)
 */
function calculateProximityScore(distance_miles: number): number {
  // Within 1 mile: 50 points
  // 5 miles: 30 points
  // 10 miles: 15 points
  // 20+ miles: 0 points
  if (distance_miles <= 1) return 50;
  if (distance_miles <= 5) return 30 - (distance_miles - 1) * 5;
  if (distance_miles <= 10) return 15 - (distance_miles - 5) * 2;
  if (distance_miles <= 20) return Math.max(0, 10 - (distance_miles - 10));
  return 0;
}

/**
 * Pick the best Date of Loss from scored events
 */
export function pickQuickDOL(scored: ScoredEvent[], byDate: Map<string, number>): DOLResult {
  // Sort dates by score (descending)
  const sortedDates = [...byDate.entries()].sort((a, b) => b[1] - a[1]);

  const [bestDate, bestScore] = sortedDates[0] ?? [undefined, 0];

  // Get top events for that date
  const topEvents = scored
    .filter((e) => e.time_utc.startsWith(bestDate ?? ""))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((e) => ({
      eventId: e.id,
      type: e.type,
      magnitude: e.magnitude,
      distance_miles: Number(e.distance_miles.toFixed(2)),
      direction_cardinal: e.direction_cardinal,
      time_utc: e.time_utc,
      source: e.source,
    }));

  // Calculate confidence (0..1 scale)
  const confidence = Math.min(1, bestScore / 100);

  return {
    recommended_date_utc: bestDate ?? "",
    top_events: topEvents,
    confidence,
    total_events_scanned: scored.length,
  };
}
