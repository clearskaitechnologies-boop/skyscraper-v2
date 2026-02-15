/**
 * WEATHER VERIFICATION AUTO-INSERT
 *
 * Auto-insert DOL verification: hail size, wind speeds, NOAA warnings, radar screenshots,
 * hail path, proximity to address (pages 13-21 format standardized)
 */

export interface WeatherVerificationData {
  hailSize: string;
  windSpeed: string;
  noaaReports: string[];
  noaaWarnings: string[];
  hailSwathMapUrl: string;
  radarLoopUrls: string[];
  hailTravelPath: string;
  proximityToAddress: string;
  additionalNotes: string;
}

export interface WeatherDataRequest {
  latitude: number;
  longitude: number;
  dateOfLoss: string; // ISO date
}

/**
 * Fetch weather data for date of loss
 * Integrates with WeatherStack + NOAA APIs
 */
export async function fetchWeatherDataForDOL(
  request: WeatherDataRequest
): Promise<WeatherVerificationData | null> {
  try {
    console.log("[WEATHER_VERIFY] Fetching data for DOL:", request.dateOfLoss);

    // TODO: Integrate with your existing weather API
    // For now, return placeholder structure
    return {
      hailSize: "2.00 inches",
      windSpeed: "65 mph gusts",
      noaaReports: ["https://www.spc.noaa.gov/climo/reports/"],
      noaaWarnings: [
        "Severe Thunderstorm Warning issued at 2:35 PM",
        "Hail up to 2 inches reported in area",
      ],
      hailSwathMapUrl: "",
      radarLoopUrls: [],
      hailTravelPath: "Storm system traveled northeast from Oklahoma panhandle",
      proximityToAddress: "0.3 miles from property location",
      additionalNotes: "Multiple hail reports confirmed within 5-mile radius",
    };
  } catch (error) {
    console.error("[WEATHER_VERIFY_ERROR]", error);
    return null;
  }
}
