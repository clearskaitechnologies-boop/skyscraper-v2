/**
 * FREE WEATHER STACK - Geo Utilities
 * Distance, bearing, and direction calculations (no external API needed)
 */

import type { GeoJSON } from "geojson";

/**
 * Haversine distance between two lat/lon points (in miles)
 */
export function haversineMiles(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 3958.7613; // Earth radius in miles

  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Bearing from point A to point B (in degrees, 0-360)
 */
export function bearingDeg(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const toDeg = (x: number) => (x * 180) / Math.PI;

  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lon - a.lon);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Convert bearing degrees to cardinal direction (N, NE, E, etc.)
 */
export function cardinal(deg: number): string {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}

/**
 * Get centroid of a GeoJSON geometry (Point or Polygon)
 */
export function geomCentroid(geom: GeoJSON.Geometry): [number, number] {
  if (geom.type === "Point") {
    return geom.coordinates as [number, number];
  }

  if (geom.type === "Polygon") {
    const ring = (geom.coordinates as [number, number][][])[0] || [];
    const n = ring.length;
    if (n === 0) return [0, 0];

    let x = 0;
    let y = 0;
    for (const [lon, lat] of ring) {
      x += lon;
      y += lat;
    }
    return [x / n, y / n];
  }

  // Default fallback for unsupported geometries
  return [0, 0];
}

/**
 * Check if a point is inside a polygon (basic ray-casting algorithm)
 */
export function pointInPolygon(
  point: { lat: number; lon: number },
  polygon: [number, number][] // Array of [lon, lat]
): boolean {
  let inside = false;
  const x = point.lon;
  const y = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
