/**
 * Executive Summary Schema
 * Validation for AI-generated executive summaries
 */

import { z } from "zod";

export const ExecutiveSummarySchema = z.object({
  paragraphs: z
    .array(z.string().min(50).max(1000))
    .min(1)
    .max(3)
    .describe("1-3 paragraphs of summary content"),

  tone: z
    .enum(["neutral", "advocacy", "technical"])
    .default("neutral")
    .describe("Writing tone for the summary"),

  keyFindings: z.array(z.string()).max(5).optional().describe("Bullet points of key findings"),

  recommendation: z.string().max(500).optional().describe("Primary recommendation or conclusion"),

  confidence: z
    .enum(["low", "medium", "high"])
    .default("medium")
    .describe("AI confidence in generation quality"),
});

export type ExecutiveSummary = z.infer<typeof ExecutiveSummarySchema>;
