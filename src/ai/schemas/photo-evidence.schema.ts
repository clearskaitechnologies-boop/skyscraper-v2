/**
 * Photo Evidence Schema
 * Validation for AI-generated photo captions and evidence organization
 */

import { z } from "zod";

export const PhotoEvidenceItemSchema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().min(10).max(300),
  category: z.enum(["roof", "exterior", "interior", "detail", "comparison"]),
  severity: z.enum(["minor", "moderate", "severe"]).optional(),
  annotations: z
    .array(
      z.object({
        type: z.enum(["arrow", "circle", "box"]),
        label: z.string().max(100),
        position: z.object({
          x: z.number(),
          y: z.number(),
        }),
      })
    )
    .optional(),
});

export const PhotoEvidenceSchema = z.object({
  photos: z.array(PhotoEvidenceItemSchema).min(1).max(50),
  summary: z.string().max(500).optional(),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export type PhotoEvidence = z.infer<typeof PhotoEvidenceSchema>;
export type PhotoEvidenceItem = z.infer<typeof PhotoEvidenceItemSchema>;
