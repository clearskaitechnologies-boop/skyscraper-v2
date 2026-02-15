/**
 * Weather Intelligence Types v1
 * Unified structure for real weather data with hail/wind/timeline/radar
 */

export interface WeatherIntel {
  // Location
  address: string;
  lat: number;
  lng: number;

  // Time window
  stormWindowStart: string | null; // ISO
  stormWindowEnd: string | null; // ISO

  // Hail intelligence
  hail: {
    maxSizeInches: number | null;
    nearbyReports: number;
    nearestReportDistanceMiles: number | null;
    lastReportDate: string | null; // ISO
  };

  // Wind intelligence
  wind: {
    maxGustMph: number | null;
    gustEvents: number;
    maxDurationMinutes: number | null;
    lastEventDate: string | null; // ISO
  };

  // Event timeline
  timeline: Array<{
    time: string; // ISO
    label: string; // Human-readable event description
    severity?: "info" | "warning" | "critical";
    type: "hail" | "wind" | "storm" | "watch" | "warning";
    magnitude?: number;
    distanceMiles?: number;
  }>;

  // Radar imagery (if available)
  radarImages: Array<{
    label: string;
    url: string;
    timestamp?: string;
  }>;

  // Disclaimers and data sources
  disclaimers: string[];
  sources: string[]; // ["Iowa Mesonet", "NWS CAP Alerts", etc.]

  // Metadata
  generatedAt: string; // ISO
  eventCount: number;
  daysSearched: number;

  // DOL suggestion
  recommendedDOL: string | null; // ISO date
  dolConfidence: "HIGH" | "MEDIUM" | "LOW" | null;
}

/**
 * Weather Report Generation Input
 */
export interface WeatherReportInput {
  address: string;
  lat?: number;
  lng?: number;
  daysBack?: number; // Default 90
  orgId?: string;
  claimId?: string;
  propertyId?: string;
}

/**
 * Weather Report API Response
 */
export interface WeatherReportResponse {
  weather: WeatherIntel;
  reportId: string; // ai_reports record ID
  pdfUrl?: string; // If PDF generation is enabled
}
