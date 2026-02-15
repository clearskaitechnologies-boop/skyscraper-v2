import { z } from "zod";

export const CodeComplianceSchema = z.object({
  items: z
    .array(
      z.object({
        code: z.string(),
        description: z.string(),
        required: z.boolean(),
        currentStatus: z.enum(["compliant", "non-compliant", "upgrade-required"]),
        recommendation: z.string(),
        costImpact: z.string().optional(),
      })
    )
    .min(1),
  jurisdiction: z.string(),
  buildingType: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
});

export type CodeCompliance = z.infer<typeof CodeComplianceSchema>;
