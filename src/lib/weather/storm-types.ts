// Weather Intelligence - Storm-specific types
// Normalized structure for storm data across providers

/**
 * Normalized location for weather queries
 */
export interface NormalizedLocation {
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  latitude: number;
  longitude: number;
}

/**
 * Normalized storm snapshot across weather providers
 */
export interface StormSnapshot {
  hailSize?: number | null; // inches
  hailDate?: string | null; // ISO date string
  windSpeed?: number | null; // mph
  windDate?: string | null; // ISO date string
  stormsLast12Months?: number | null;
  provider?: "WEATHERSTACK" | "VISUALCROSSING";
  raw?: unknown; // optional raw payload for debugging
}

/**
 * Weather provider result wrapper
 */
export interface WeatherProviderResult {
  success: boolean;
  data?: StormSnapshot;
  error?: string;
  provider: "WEATHERSTACK" | "VISUALCROSSING";
}
