/**
 * AI Damage Builder Schema
 * Validation for photo uploads with HEIC/HEIF support
 */

import { z } from "zod";

// Accept common image formats including iPhone HEIC
export const PhotoMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const photoSchema = z.object({
  id: z.string().min(1, "Photo ID required"), // Loosened from UUID requirement
  fileName: z
    .string()
    .min(1, "Filename required")
    .max(255, "Filename too long")
    .transform((val) =>
      val
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, "_")
        .replace(/_{2,}/g, "_")
        .substring(0, 100)
    ),
  mimeType: z.enum(PhotoMimeTypes, {
    errorMap: () => ({
      message: `Unsupported format. Please upload JPG, PNG, WEBP, or HEIC images.`,
    }),
  }),
  size: z
    .number()
    .positive("File size must be positive")
    .max(25 * 1024 * 1024, "File too large (max 25MB)"),
  buffer: z.instanceof(Buffer).optional(),
});

export const damageAnalysisRequestSchema = z.object({
  photos: z
    .array(photoSchema)
    .min(1, "At least one photo required")
    .max(50, "Maximum 50 photos per analysis"),
  leadId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  address: z.string().optional(),
  dateOfLoss: z.string().optional(),
  roofType: z.string().optional(),
  notes: z.string().max(5000).optional(),
});

export const damageFindingSchema = z.object({
  type: z.string().min(1, "Damage type required"),
  severity: z.enum(["Low", "Medium", "High", "Critical"]),
  description: z.string().min(10, "Description too short"),
  location: z.string().min(1, "Location required"),
  code: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const damageAnalysisResponseSchema = z.object({
  findings: z.array(damageFindingSchema),
  tokensUsed: z.number().int().positive(),
  photoCount: z.number().int().positive(),
  analysisId: z.string().optional(),
});

export type Photo = z.infer<typeof photoSchema>;
export type DamageAnalysisRequest = z.infer<typeof damageAnalysisRequestSchema>;
export type DamageFinding = z.infer<typeof damageFindingSchema>;
export type DamageAnalysisResponse = z.infer<typeof damageAnalysisResponseSchema>;
