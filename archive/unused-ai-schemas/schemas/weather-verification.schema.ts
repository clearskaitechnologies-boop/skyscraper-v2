import { z } from "zod";

export const WeatherVerificationSchema = z.object({
  date: z.string(),
  location: z.object({
    address: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lon: z.number(),
    }),
  }),
  events: z.array(
    z.object({
      type: z.enum(["hail", "wind", "rain", "tornado", "hurricane"]),
      severity: z.enum(["minor", "moderate", "severe"]),
      timestamp: z.string(),
      details: z.string(),
    })
  ),
  source: z.enum(["visual_crossing", "noaa", "weather_gov"]),
  confidence: z.enum(["low", "medium", "high"]),
});

export type WeatherVerification = z.infer<typeof WeatherVerificationSchema>;
