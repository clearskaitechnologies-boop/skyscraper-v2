/**
 * Weather & Hazard API Integration Service
 * Integrates with NOAA, First Street Foundation, and CoreLogic
 * for real-time weather data and hazard scoring
 */

import { fetchSafe } from '@/lib/fetchSafe';

interface HazardScores {
  hailRiskScore: number; // 0-100
  windRiskScore: number; // 0-100
  wildfireRiskScore: number; // 0-100
  floodZone: string; // FEMA flood zone
  earthquakeZone: string; // Seismic zone
  tornadoRiskScore: number; // 0-100
}

interface WeatherData {
  currentConditions?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    conditions: string;
  };
  alerts?: Array<{
    event: string;
    severity: string;
    description: string;
    expires: string;
  }>;
}

/**
 * Fetch NOAA weather data and alerts
 */
export async function fetchNOAAWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  try {
    // NOAA Weather API is free, no API key required
    // Get weather station for coordinates
    const pointsResponse = await fetchSafe(
      `https://api.weather.gov/points/${latitude},${longitude}`,
      {
        headers: {
          "User-Agent": "(PreLossVision, contact@preloss.com)",
        },
        label: 'weather-points'
      }
    );
    if (!pointsResponse || !pointsResponse.ok) {
      throw new Error(`NOAA API error: ${pointsResponse.status}`);
    }

    const pointsData = await pointsResponse.json();
    const forecastUrl = pointsData.properties.forecast;
    const alertsUrl = `https://api.weather.gov/alerts/active?point=${latitude},${longitude}`;

    // Fetch current forecast and alerts in parallel
    const [forecastResponse, alertsResponse] = await Promise.all([
      fetchSafe(forecastUrl, {
        headers: {
          "User-Agent": "(PreLossVision, contact@preloss.com)",
        },
        label: 'weather-forecast'
      }),
      fetchSafe(alertsUrl, {
        headers: {
          "User-Agent": "(PreLossVision, contact@preloss.com)",
        },
        label: 'weather-alerts'
      }),
    ]);

    const forecastData = await forecastResponse.json();
    const alertsData = await alertsResponse.json();

    const currentPeriod = forecastData.properties?.periods?.[0];

    return {
      currentConditions: {
        temperature: currentPeriod?.temperature || 0,
        humidity: currentPeriod?.relativeHumidity?.value || 0,
        windSpeed: parseInt(currentPeriod?.windSpeed?.split(" ")?.[0] || "0"),
        conditions: currentPeriod?.shortForecast || "Unknown",
      },
      alerts: alertsData.features?.map((alert: any) => ({
        event: alert.properties.event,
        severity: alert.properties.severity,
        description: alert.properties.description,
        expires: alert.properties.expires,
      })) || [],
    };
  } catch (error) {
    console.error("NOAA API error:", error);
    return {};
  }
}

/**
 * Fetch wildfire risk from First Street Foundation
 */
export async function fetchWildfireRisk(
  latitude: number,
  longitude: number
): Promise<number> {
  const firstStreetApiKey = process.env.FIRST_STREET_API_KEY;

  if (!firstStreetApiKey) {
    console.warn("First Street API key not configured");
    return 0;
  }

  try {
    const response = await fetchSafe(
      `https://api.firststreet.org/v1/wildfire/property?lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Authorization: `Bearer ${firstStreetApiKey}`,
          Accept: "application/json",
        },
        label: 'wildfire-risk'
      }
    );
    if (!response || !response.ok) {
      throw new Error(`First Street API error: ${response.status}`);
    }

    const data = await response.json();
    
    // First Street returns risk on 1-10 scale, convert to 0-100
    const riskScore = (data.wildfire?.riskScore || 0) * 10;
    return Math.min(100, Math.max(0, riskScore));
  } catch (error) {
    console.error("First Street API error:", error);
    return 0;
  }
}

/**
 * Fetch hail risk from CoreLogic Hazard API
 */
export async function fetchHailRisk(
  latitude: number,
  longitude: number
): Promise<number> {
  const coreLogicApiKey = process.env.CORELOGIC_HAZARD_API_KEY;

  if (!coreLogicApiKey) {
    console.warn("CoreLogic Hazard API key not configured");
    return 0;
  }

  try {
    const response = await fetchSafe(
      `https://api.corelogic.com/hazard/v1/hail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${coreLogicApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude,
          longitude,
        }),
        label: 'hail-risk'
      }
    );
    if (!response || !response.ok) {
      throw new Error(`CoreLogic Hazard API error: ${response.status}`);
    }

    const data = await response.json();
    
    // CoreLogic returns hail frequency (0-10), convert to 0-100 risk score
    const hailFrequency = data.hailFrequency || 0;
    return Math.min(100, hailFrequency * 10);
  } catch (error) {
    console.error("CoreLogic Hazard API error:", error);
    return 0;
  }
}

/**
 * Fetch wind risk from NOAA Storm Prediction Center
 */
export async function fetchWindRisk(
  latitude: number,
  longitude: number
): Promise<number> {
  try {
    // NOAA SPC provides historical tornado/wind data
    // This is a simplified implementation - real version would analyze historical events
    
    // Fetch severe weather reports near location
    const response = await fetchSafe(
      `https://www.spc.noaa.gov/climo/reports/recent_wind.json`,
      {
        headers: {
          "User-Agent": "(PreLossVision, contact@preloss.com)",
        },
        label: 'wind-risk'
      }
    );
    if (!response || !response.ok) {
      return 50; // Default moderate risk
    }

    const data = await response.json();
    
    // Calculate risk based on proximity to recent wind events
    // This is simplified - production would use historical analysis
    const recentEvents = data.features?.filter((feature: any) => {
      const eventLat = feature.geometry.coordinates[1];
      const eventLon = feature.geometry.coordinates[0];
      const distance = Math.sqrt(
        Math.pow(eventLat - latitude, 2) + Math.pow(eventLon - longitude, 2)
      );
      return distance < 0.5; // Within ~30 miles
    }) || [];

    // More recent events = higher risk
    const riskScore = Math.min(100, recentEvents.length * 10);
    return riskScore;
  } catch (error) {
    console.error("Wind risk calculation error:", error);
    return 50; // Default moderate risk
  }
}

/**
 * Fetch FEMA flood zone data
 */
export async function fetchFloodZone(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    // FEMA provides flood zone data via WMS/WFS services
    const response = await fetchSafe(
      `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?` +
      `geometry=${longitude},${latitude}&` +
      `geometryType=esriGeometryPoint&` +
      `inSR=4326&` +
      `spatialRel=esriSpatialRelIntersects&` +
      `returnGeometry=false&` +
      `outFields=FLD_ZONE&` +
      `f=json`
    );
    if (!response || !response.ok) {
      return "UNKNOWN";
    }

    const data = await response.json();
    const floodZone = data.features?.[0]?.attributes?.FLD_ZONE || "UNKNOWN";
    
    return floodZone;
  } catch (error) {
    console.error("FEMA flood zone error:", error);
    return "UNKNOWN";
  }
}

/**
 * Fetch earthquake zone from USGS
 */
export async function fetchEarthquakeZone(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    // USGS provides seismic hazard data
    const response = await fetchSafe(
      `https://earthquake.usgs.gov/ws/designmaps/asce7-16.json?` +
      `latitude=${latitude}&longitude=${longitude}&riskCategory=II&siteClass=C&title=Project`
    );
    if (!response || !response.ok) {
      return "UNKNOWN";
    }

    const data = await response.json();
    const pga = data.response?.data?.pga || 0; // Peak Ground Acceleration
    
    // Classify based on PGA
    if (pga < 0.05) return "Very Low";
    if (pga < 0.10) return "Low";
    if (pga < 0.20) return "Moderate";
    if (pga < 0.40) return "High";
    return "Very High";
  } catch (error) {
    console.error("USGS earthquake zone error:", error);
    return "UNKNOWN";
  }
}

/**
 * Calculate tornado risk score
 */
export async function fetchTornadoRisk(
  latitude: number,
  longitude: number
): Promise<number> {
  // Use NOAA Storm Prediction Center historical tornado data
  // This is simplified - production would analyze decades of historical tracks
  
  // Tornado Alley states (rough approximation)
  const tornadoAlleyStates = ["TX", "OK", "KS", "NE", "SD"];
  
  // High-risk areas get 70-90 score
  // Medium-risk areas get 40-60 score
  // Low-risk areas get 10-30 score
  
  // This is a placeholder - real implementation would use NOAA historical data
  return 50; // Default moderate risk
}

/**
 * Get comprehensive hazard scores for a location
 */
export async function getHazardScores(
  latitude: number,
  longitude: number
): Promise<HazardScores> {
  try {
    // Fetch all hazard scores in parallel
    const [
      hailScore,
      windScore,
      wildfireScore,
      floodZone,
      earthquakeZone,
      tornadoScore,
    ] = await Promise.all([
      fetchHailRisk(latitude, longitude),
      fetchWindRisk(latitude, longitude),
      fetchWildfireRisk(latitude, longitude),
      fetchFloodZone(latitude, longitude),
      fetchEarthquakeZone(latitude, longitude),
      fetchTornadoRisk(latitude, longitude),
    ]);

    return {
      hailRiskScore: hailScore,
      windRiskScore: windScore,
      wildfireRiskScore: wildfireScore,
      floodZone,
      earthquakeZone,
      tornadoRiskScore: tornadoScore,
    };
  } catch (error) {
    console.error("Failed to fetch hazard scores:", error);
    
    // Return default values on error
    return {
      hailRiskScore: 0,
      windRiskScore: 0,
      wildfireRiskScore: 0,
      floodZone: "UNKNOWN",
      earthquakeZone: "UNKNOWN",
      tornadoRiskScore: 0,
    };
  }
}

/**
 * Get geocoordinates from address (using NOAA's geocoding service)
 */
export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    
    // Use Census Bureau's geocoding service (free, no API key)
    const response = await fetchSafe(
      `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?` +
      `address=${encodedAddress}&benchmark=2020&format=json`
    );
    if (!response || !response.ok) {
      return null;
    }

    const data = await response.json();
    const coordinates = data.result?.addressMatches?.[0]?.coordinates;

    if (!coordinates) {
      return null;
    }

    return {
      latitude: coordinates.y,
      longitude: coordinates.x,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
