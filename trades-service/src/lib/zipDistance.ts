// ============================================================================
// ZIP CODE DISTANCE CALCULATIONS
// Uses zipcodes library for geo filtering
// ============================================================================

import zipcodes from "zipcodes";

export interface ZipLocation {
  zip: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
}

/**
 * Get lat/lng for a zip code
 */
export function getZipLocation(zip: string): ZipLocation | null {
  const data = zipcodes.lookup(zip);
  if (!data) return null;

  return {
    zip,
    lat: data.latitude,
    lng: data.longitude,
    city: data.city,
    state: data.state,
  };
}

/**
 * Calculate distance between two zip codes in miles
 * Uses Haversine formula
 */
export function calculateZipDistance(zip1: string, zip2: string): number | null {
  const loc1 = getZipLocation(zip1);
  const loc2 = getZipLocation(zip2);

  if (!loc1 || !loc2) return null;

  return haversineDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng);
}

/**
 * Haversine formula to calculate distance between two lat/lng points
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find all pros within radius of a zip code
 * Returns array of {proClerkId, distance} sorted by distance
 */
export function findProsWithinRadius(
  clientZip: string,
  pros: Array<{ clerkUserId: string; baseZip: string; radiusMiles: number }>,
  maxRadius?: number
): Array<{ proClerkId: string; distance: number }> {
  const results: Array<{ proClerkId: string; distance: number }> = [];

  for (const pro of pros) {
    const distance = calculateZipDistance(clientZip, pro.baseZip);
    if (distance === null) continue;

    // Check if within pro's service radius
    if (distance <= pro.radiusMiles) {
      // If maxRadius specified, also check client's search radius
      if (maxRadius === undefined || distance <= maxRadius) {
        results.push({
          proClerkId: pro.clerkUserId,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
        });
      }
    }
  }

  return results.sort((a, b) => a.distance - b.distance);
}

/**
 * Get all zips within radius of a center zip
 * Useful for expanding search radius
 */
export function getZipsInRadius(centerZip: string, radiusMiles: number): string[] {
  const center = getZipLocation(centerZip);
  if (!center) return [];

  const allZips = zipcodes.radius(center.zip, radiusMiles);
  // Convert to string array (zipcodes lib may return ZipCode objects)
  return (allZips || []).map((z: any) => (typeof z === "string" ? z : z.zip || z));
}
