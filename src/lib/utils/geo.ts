import zipcodes from "zipcodes";

/**
 * Get latitude and longitude for a given ZIP code
 * Returns null if ZIP code not found
 */
export function getLatLngForZip(zip: string): { lat: number; lng: number } | null {
  const info = zipcodes.lookup(zip);
  if (!info) return null;

  return {
    lat: info.latitude,
    lng: info.longitude,
  };
}
