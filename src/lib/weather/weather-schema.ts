// lib/weather/weather-schema.ts
import { z } from "zod";

export const weatherToggleList = [
  { key: "noaaSwath", label: "NOAA Hail Swath", icon: "🛰️" },
  { key: "hailSizeRadius", label: "Max Hail Size", icon: "🌑" },
  { key: "hailDensity", label: "Hail Density", icon: "🧊" },
  { key: "hailHardness", label: "Hail Hardness", icon: "💎" },
  { key: "groundStrikes", label: "Ground Strikes", icon: "" },
  { key: "maxGust", label: "Max Wind Gust", icon: "🌬️" },
  { key: "threeSecondGust", label: "Peak 3-sec Gust", icon: "💨" },
  { key: "windDirection", label: "Wind Direction", icon: "🧭" },
  { key: "windDrivenRain", label: "Wind-Driven Rain", icon: "🌧️" },
  { key: "rain24", label: "24hr Rainfall", icon: "☔" },
  { key: "rain72", label: "3-Day Rainfall", icon: "💧" },
  { key: "flashFlood", label: "Flash Flood Data", icon: "🌊" },
  { key: "radarLoop", label: "Radar Loop Summary", icon: "📡" },
  { key: "freezeThaw", label: "Freeze/Thaw Cycles", icon: "❄️" },
  { key: "snowLoad", label: "Snow Load", icon: "⛄" },
  { key: "iceIndex", label: "Ice Accumulation Index", icon: "🧊" },
  { key: "stormSeverity", label: "AI Severity Rating", icon: "⚠️" },
  { key: "stormTimeline", label: "Storm Timeline", icon: "🕒" },
  { key: "codeCompare", label: "Code Load Comparison", icon: "📘" },
  { key: "cocorahs", label: "COCORAHS Reports", icon: "📍" },
];

export const WeatherSchema = z.object({
  claim_id: z.string().min(1),
  address: z.string().min(1),
  gps: z.string().optional(),
  dateOfLoss: z.string().min(1),
  peril: z.string().min(1),
  mapPreview: z.boolean().optional(),
  toggles: z.record(z.boolean()),
});

export type WeatherFormType = z.infer<typeof WeatherSchema>;
