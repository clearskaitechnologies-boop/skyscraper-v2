// src/lib/weather/types.ts
import { z } from "zod";

/**
 * Weather Builder Types
 * Unified structure for weather verification reports
 */

export type PerilType = "HAIL" | "WIND" | "RAIN" | "FLOOD" | "SNOW" | "AUTO_DETECT";

export const WeatherWizardSchema = z.object({
  // Claim & Location
  claim_id: z.string(),
  address: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  gps: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  
  // Loss Details
  dateOfLoss: z.string(), // ISO date string
  peril: z.enum(["HAIL", "WIND", "RAIN", "FLOOD", "SNOW", "AUTO_DETECT"]),
  autoDetectPeril: z.boolean().default(false),
  
  // Weather Data Options
  options: z.object({
    // Core Weather
    hail: z.boolean().default(false),
    wind: z.boolean().default(false),
    rain: z.boolean().default(false),
    snow: z.boolean().default(false),
    radar: z.boolean().default(true),
    stormEvents: z.boolean().default(true),
    
    // Advanced Add-Ons
    buildingCodeLoads: z.boolean().default(false),
    cocorahs: z.boolean().default(false),
    satellite: z.boolean().default(false),
    aiSeverityRating: z.boolean().default(true),
    lossTimeline: z.boolean().default(true),
  }),
});

export type WeatherWizardPayload = z.infer<typeof WeatherWizardSchema>;

/**
 * Generated Weather Report Structure
 */
export interface GeneratedWeatherReport {
  title: string;
  subtitle?: string;
  claimId: string;
  address: string;
  dateOfLoss: string;
  peril: PerilType;
  
  summary: {
    confidence: "HIGH" | "MEDIUM" | "LOW";
    aiSummary: string;
    meteorologicalData: string;
    severityRating?: number; // 1-10
  };
  
  sections: Array<{
    id: string;
    title: string;
    content: string;
    dataSource: string; // "NOAA", "NWS", "NCEI", "AI", etc.
  }>;
  
  maps?: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
  }>;
  
  recommendations: string[];
  
  meta: {
    generatedAt: string;
    options: WeatherWizardPayload["options"];
  };
}

/**
 * Peril Display Configuration
 */
export const PERIL_CONFIG = {
  HAIL: {
    label: "Hail",
    icon: "🌩️",
    color: "bg-purple-100 text-purple-700 border-purple-300",
  },
  WIND: {
    label: "Wind",
    icon: "🌬️",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  RAIN: {
    label: "Rain/Flood",
    icon: "☔",
    color: "bg-cyan-100 text-cyan-700 border-cyan-300",
  },
  FLOOD: {
    label: "Flooding",
    icon: "🌊",
    color: "bg-teal-100 text-teal-700 border-teal-300",
  },
  SNOW: {
    label: "Snow/Freeze",
    icon: "❄️",
    color: "bg-slate-100 text-slate-700 border-slate-300",
  },
  AUTO_DETECT: {
    label: "Auto-Detect",
    icon: "🤖",
    color: "bg-indigo-100 text-indigo-700 border-indigo-300",
  },
} as const;
