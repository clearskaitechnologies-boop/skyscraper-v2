/**
 * Weather Integration
 * Stub implementation - to be completed
 */

export interface WeatherLocation {
  city: string;
  state: string;
  lat: number;
  lon: number;
}

export interface HailData {
  maxSize: number;
  duration: number;
  density: string;
  distribution?: Record<string, number>;
}

export interface WindData {
  maxSpeed: number;
  direction: string;
  gustSpeed: number;
}

export interface WeatherData {
  date: Date;
  conditions: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  events: string[];
  // Extended properties for reports
  location?: WeatherLocation;
  hailData?: HailData;
  windData?: WindData;
  humidity?: number;
  source?: string;
}

export async function getHistoricalWeather(
  lat: number,
  lng: number,
  date: Date
): Promise<WeatherData | null> {
  console.log(`[Weather] Getting historical weather for ${lat},${lng} on ${date.toISOString()}`);
  return null;
}

export async function getWeatherEvents(
  lat: number,
  lng: number,
  startDate: Date,
  endDate: Date
): Promise<WeatherData[]> {
  console.log(`[Weather] Getting weather events for ${lat},${lng}`);
  return [];
}

export async function getStormData(claimId: string) {
  console.log(`[Weather] Getting storm data for claim ${claimId}`);
  return null;
}

// Alias for fetchWeatherForDOL
export async function fetchWeatherForDOL(
  lat: number,
  lng: number,
  date: Date
): Promise<WeatherData | null> {
  return getHistoricalWeather(lat, lng, date);
}
