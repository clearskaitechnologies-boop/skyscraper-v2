import { z } from "zod";

export const DamageTimelineSchema = z.object({
  events: z
    .array(
      z.object({
        date: z.string(),
        title: z.string(),
        description: z.string(),
        category: z.enum(["weather", "inspection", "communication", "repair"]),
        evidence: z.array(z.string()).optional(),
      })
    )
    .min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  confidence: z.enum(["low", "medium", "high"]),
});

export type DamageTimeline = z.infer<typeof DamageTimelineSchema>;
