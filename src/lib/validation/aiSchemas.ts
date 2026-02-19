/**
 * Zod schemas for AI API endpoints.
 * Centralizes request validation for all /api/ai/* POST routes.
 */
import { z } from "zod";

// ─── Common building blocks ────────────────────────────────────
export const claimIdField = z.string().uuid("claimId must be a valid UUID");
export const orgIdField = z.string().min(1, "orgId is required");
export const messageField = z.string().min(1, "message cannot be empty").max(10000);
export const promptField = z.string().min(1, "prompt cannot be empty").max(20000);
export const imageUrlField = z.string().url("imageUrl must be a valid URL");
export const base64ImageField = z
  .string()
  .min(100, "image data too short")
  .max(10_000_000, "image data exceeds 10 MB");

// ─── Chat / Assistant ──────────────────────────────────────────
export const chatSchema = z.object({
  message: messageField,
});

export const assistantSchema = z.object({
  message: messageField,
  sessionId: z.string().optional(),
  voiceEnabled: z.boolean().optional(),
});

export const claimAssistantSchema = z.object({
  message: messageField,
  claimId: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

export const dashboardAssistantSchema = z.object({
  claimId: z.string().min(1, "claimId is required"),
  action: z.enum(["supplement", "depreciation", "estimate", "report"]),
  prompt: promptField,
  orgId: orgIdField,
});

export const retailAssistantSchema = z.object({
  message: messageField,
  leadId: z.string().optional(),
  claimId: z.string().optional(),
});

// ─── Damage Analysis ───────────────────────────────────────────
export const damageAnalyzeSchema = z
  .object({
    imageUrl: z.string().optional(),
    imageBase64: z.string().optional(),
    claimId: z.string().optional(),
    propertyType: z.string().optional(),
    damageType: z.string().optional(),
  })
  .refine((d) => d.imageUrl || d.imageBase64, {
    message: "Either imageUrl or imageBase64 is required",
  });

export const damageExportSchema = z.object({
  photos: z.array(z.record(z.unknown())).default([]),
  findings: z.array(z.record(z.unknown())).default([]),
  leadId: z.string().optional(),
  jobId: z.string().optional(),
  propertyAddress: z.string().optional(),
  includeCodeCompliance: z.boolean().optional(),
  includeMaterialSpecs: z.boolean().optional(),
});

export const damageBuilderSchema = z.object({
  claimId: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  dateOfLoss: z.string().min(1, "Date of loss is required"),
  roofType: z.string().optional(),
  roofSqft: z.number().optional(),
  materials: z.string().optional(),
  windSpeed: z.string().optional(),
  hailSize: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Rebuttal ──────────────────────────────────────────────────
export const rebuttalSchema = z.object({
  claimId: z.string().min(1, "claimId is required"),
  denialText: z.string().min(20, "Denial text must be at least 20 characters"),
  tone: z.enum(["professional", "firm", "legal"]).default("professional"),
});

export const rebuttalExportSchema = z.object({
  rebuttalText: z.string().min(1, "Rebuttal text is required"),
  claimId: z.string().optional(),
  format: z.enum(["pdf", "docx"]).default("pdf"),
});

// ─── Supplement ────────────────────────────────────────────────
export const supplementAnalyzeSchema = z.object({
  claimId: claimIdField,
  items: z.array(z.record(z.unknown())).optional(),
  carrierEstimate: z.string().optional(),
});

export const supplementExportSchema = z.object({
  claimId: claimIdField,
  items: z.array(z.record(z.unknown())).min(1, "At least one item is required"),
  format: z.enum(["pdf", "xlsx"]).default("pdf"),
});

// ─── Report Builder ────────────────────────────────────────────
export const reportBuilderSchema = z.object({
  claimId: z.string().min(1, "claimId is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  property: z
    .object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    })
    .optional(),
});

export const enhancedReportBuilderSchema = z.object({
  claimId: z.string().min(1, "claimId is required"),
  options: z
    .object({
      includeWeather: z.boolean().optional(),
      includeAnnotations: z.boolean().optional(),
      includeCompliance: z.boolean().optional(),
      includeMaterials: z.boolean().optional(),
    })
    .optional(),
});

// ─── Claim Writer ──────────────────────────────────────────────
export const claimWriterSchema = z.object({
  claimId: claimIdField,
  sections: z.array(z.string()).optional(),
  tone: z.enum(["professional", "assertive", "empathetic"]).default("professional"),
});

// ─── Mockup ────────────────────────────────────────────────────
export const mockupSchema = z.object({
  imageUrl: z.string().url("Valid image URL required"),
  style: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
});

// ─── Estimate ──────────────────────────────────────────────────
export const estimateValueSchema = z.object({
  address: z.string().min(1, "Address is required"),
  propertyType: z.string().optional(),
  squareFootage: z.number().positive().optional(),
  damageType: z.string().optional(),
});

// ─── Video ─────────────────────────────────────────────────────
export const videoSchema = z.object({
  claimId: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  narration: z.string().optional(),
  style: z.enum(["professional", "walkthrough", "summary"]).default("professional"),
});

// ─── Domain / Router ───────────────────────────────────────────
export const domainSchema = z.object({
  domain: z.string().min(1),
  action: z.enum(["analyze", "suggest", "verify"]).optional(),
});

export const routerSchema = z.object({
  query: z.string().min(1, "Query is required"),
  context: z.record(z.unknown()).optional(),
});

export const runSchema = z.object({
  agentId: z.string().optional(),
  task: z.string().min(1, "Task description is required"),
  context: z.record(z.unknown()).optional(),
});

// ─── Suggest Status ────────────────────────────────────────────
export const suggestStatusSchema = z.object({
  claimId: claimIdField,
  currentStatus: z.string().optional(),
});

// ─── Recommendations ──────────────────────────────────────────
export const recommendationsRefreshSchema = z.object({
  claimId: z.string().optional(),
  orgId: z.string().optional(),
  force: z.boolean().default(false),
});

// ─── 3D ────────────────────────────────────────────────────────
export const model3dSchema = z
  .object({
    imageUrl: z.string().url().optional(),
    imageBase64: z.string().optional(),
    propertyType: z.string().optional(),
  })
  .refine((d) => d.imageUrl || d.imageBase64, {
    message: "Either imageUrl or imageBase64 is required",
  });

// ─── Agents ────────────────────────────────────────────────────
export const agentsSchema = z.object({
  agentType: z.string().min(1, "Agent type is required"),
  input: z.record(z.unknown()).optional(),
  claimId: z.string().optional(),
});

// ─── Vision ────────────────────────────────────────────────────
export const visionAnalyzeSchema = z
  .object({
    imageUrl: z.string().url().optional(),
    imageBase64: z.string().optional(),
    prompt: z.string().optional(),
    analysisType: z.enum(["damage", "material", "measurement", "general"]).default("general"),
  })
  .refine((d) => d.imageUrl || d.imageBase64, {
    message: "Either imageUrl or imageBase64 is required",
  });

// ─── Depreciation ──────────────────────────────────────────────
export const depreciationExportSchema = z.object({
  items: z.array(z.record(z.unknown())).min(1, "Items are required"),
  claimId: z.string().optional(),
  format: z.enum(["pdf", "csv"]).default("pdf"),
});

// ─── Inspect ───────────────────────────────────────────────────
export const inspectSchema = z
  .object({
    imageUrl: z.string().url().optional(),
    imageBase64: z.string().optional(),
    propertyType: z.string().optional(),
    inspectionType: z.string().optional(),
  })
  .refine((d) => d.imageUrl || d.imageBase64, {
    message: "Either imageUrl or imageBase64 is required",
  });

/**
 * Utility: validate a request body against a Zod schema.
 * Returns { success: true, data } or { success: false, response } (a NextResponse).
 */
export function validateAIRequest<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: string; details: z.ZodError["errors"] } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      success: false,
      error: "Invalid request",
      details: result.error.errors,
    };
  }
  return { success: true, data: result.data };
}
