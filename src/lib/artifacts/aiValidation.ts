/**
 * AI Request Validation Schemas
 * Zod schemas for validating AI-powered endpoint requests
 */

import { z } from "zod";

/**
 * Report generation request validation
 */
export const reportGenerationSchema = z.object({
  claimId: z.string().uuid(),
  reportType: z.enum([
    "estimate_narrative",
    "supplement",
    "rebuttal",
    "depreciation_release",
    "final_closeout",
  ]),
  options: z
    .object({
      includePhotos: z.boolean().optional(),
      includeWeather: z.boolean().optional(),
      includeCitations: z.boolean().optional(),
      template: z.string().optional(),
    })
    .optional(),
});

export type ReportGenerationRequest = z.infer<typeof reportGenerationSchema>;

/**
 * AI Assistant query validation
 */
export const assistantQuerySchema = z.object({
  claimId: z.string().uuid(),
  message: z.string().min(1).max(2000),
  threadId: z.string().optional(),
});

export type AssistantQueryRequest = z.infer<typeof assistantQuerySchema>;

/**
 * Supplement generation validation
 */
export const supplementSchema = z.object({
  claimId: z.string().uuid(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unit: z.string(),
      unitPrice: z.number().positive(),
      total: z.number().positive(),
    })
  ),
  reasoning: z.string().optional(),
});

export type SupplementRequest = z.infer<typeof supplementSchema>;

/**
 * Generic AI validation helper
 */
export function validateAIRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  error?: string;
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      };
    }
    return { success: false, error: "Validation failed" };
  }
}
