import { z } from "zod";

export const CarrierCorrespondenceSchema = z.object({
  entries: z
    .array(
      z.object({
        date: z.string(),
        direction: z.enum(["inbound", "outbound"]),
        from: z.string(),
        to: z.string(),
        subject: z.string(),
        summary: z.string(),
        keyPoints: z.array(z.string()),
        actionItems: z.array(z.string()).optional(),
      })
    )
    .min(1),
  totalCommunications: z.number(),
  confidence: z.enum(["low", "medium", "high"]),
});

export type CarrierCorrespondence = z.infer<typeof CarrierCorrespondenceSchema>;
