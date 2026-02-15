import { z } from "zod";

export const LegalPrecedentSchema = z.object({
  cases: z.array(
    z.object({
      caseName: z.string(),
      jurisdiction: z.string(),
      year: z.number(),
      summary: z.string(),
      relevance: z.string(),
      outcome: z.enum(["favorable", "unfavorable", "mixed"]),
      citation: z.string().optional(),
    })
  ),
  policyLanguage: z.array(
    z.object({
      section: z.string(),
      text: z.string(),
      interpretation: z.string(),
      supportsClaim: z.boolean(),
    })
  ),
  confidence: z.enum(["low", "medium", "high"]),
});

export type LegalPrecedent = z.infer<typeof LegalPrecedentSchema>;
