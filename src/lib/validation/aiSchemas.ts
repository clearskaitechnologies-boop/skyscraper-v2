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
  jobId: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
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
  claimId: z.string().min(1, "claimId is required"),
  propertyAddress: z.string().optional(),
  claimType: z.string().optional(),
  lossSummary: z.string().optional(),
  notes: z.string().optional(),
  policySummary: z.string().optional(),
});

// ─── Mockup ────────────────────────────────────────────────────
export const mockupSchema = z.object({
  imageUrl: z.string().url("Valid image URL required"),
  address: z.string().optional(),
  prompt: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
});

// ─── Estimate Value ────────────────────────────────────────────
export const estimateValueSchema = z.object({
  damageType: z.string().optional(),
  propertyAddress: z.string().optional(),
  dateOfLoss: z.string().optional(),
  propertyType: z.string().optional(),
});

// ─── Video ─────────────────────────────────────────────────────
export const videoSchema = z.object({
  action: z
    .enum([
      "analyze",
      "detectMotion",
      "classifyScenes",
      "trackObjects",
      "extractKeyframes",
      "generateSummary",
    ])
    .default("analyze"),
  payload: z
    .object({
      url: z.string().min(1, "Video URL is required"),
    })
    .passthrough(),
});

// ─── Domain / Router ───────────────────────────────────────────
export const domainSchema = z.object({
  action: z
    .enum([
      "align",
      "transfer",
      "adaptFeatures",
      "measureShift",
      "findMapping",
      "validateAdaptation",
    ])
    .default("align"),
  payload: z
    .object({
      source: z.unknown().optional(),
      target: z.unknown().optional(),
    })
    .passthrough()
    .refine((d) => d.source || d.target, {
      message: "Either source or target domain data is required",
    }),
});

export const routerSchema = z.object({
  task: z.string().min(1, "Task is required (format: 'module.function')"),
  payload: z.record(z.unknown()).optional(),
});

export const runSchema = z.object({
  reportId: z.string().min(1, "reportId is required"),
  engine: z.string().optional(),
  sectionKey: z.string().optional(),
  context: z.record(z.unknown()).optional(),
});

// ─── Suggest Status ────────────────────────────────────────────
export const suggestStatusSchema = z.object({
  claimId: z.string().min(1, "claimId is required"),
});

// ─── Recommendations ──────────────────────────────────────────
export const recommendationsRefreshSchema = z.object({
  claimId: z.string().optional(),
  orgId: z.string().optional(),
  force: z.boolean().default(false),
});

// ─── Dispatch ──────────────────────────────────────────────────
export const dispatchSchema = z.object({
  actionType: z.string().optional(),
  priority: z.string().optional(),
});

// ─── Supplement (claimId) ──────────────────────────────────────
export const supplementClaimSchema = z.object({
  pushbackType: z.string().optional(),
  carrierNotes: z.string().optional(),
});

// ─── Depreciation Export PDF ───────────────────────────────────
export const depreciationExportPdfSchema = z.object({
  claimId: z.string().min(1, "claimId is required"),
  rcv: z.number({ required_error: "rcv is required" }),
  age: z.number().optional(),
  lifespan: z.number().optional(),
  depreciationType: z.string().optional(),
  acv: z.number().optional(),
  depreciation: z.number().optional(),
});

// ─── Rebuttal Export PDF ───────────────────────────────────────
export const rebuttalExportPdfSchema = z.object({
  claimId: z.string().min(1, "claimId is required"),
  rebuttalText: z.string().min(1, "rebuttalText is required"),
});

// ─── 3D ────────────────────────────────────────────────────────
export const model3dSchema = z.object({
  action: z
    .enum(["detectObjects", "estimateDepth", "reconstruct", "processPointCloud"])
    .default("detectObjects"),
  payload: z
    .object({
      images: z.array(z.string()).optional(),
      pointCloud: z.record(z.unknown()).optional(),
    })
    .passthrough()
    .refine((d) => d.images || d.pointCloud, {
      message: "Either images or pointCloud data is required in payload",
    }),
});

// ─── Agents ────────────────────────────────────────────────────
export const agentsSchema = z.object({
  action: z
    .enum(["optimizePolicy", "coordinateWorkflow", "allocateResources", "planActions"])
    .default("optimizePolicy"),
  payload: z
    .object({
      context: z.record(z.unknown()),
    })
    .passthrough(),
});

// ─── Vision ────────────────────────────────────────────────────
export const visionAnalyzeSchema = z.object({
  imageUrl: z.string().url("imageUrl must be a valid URL"),
  focusAreas: z.array(z.string()).optional(),
  claimId: z.string().optional(),
  analysisType: z.enum(["damage", "material", "measurement", "general"]).default("general"),
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

// ─── Inspect (FormData variant) ────────────────────────────────
export const inspectFormDataSchema = z.object({
  propertyId: z.string().optional(),
});

// ─── Analyze Damage (FormData variant) ─────────────────────────
export const analyzeDamageFormDataSchema = z.object({
  claimId: z.string().optional(),
});

// ─── Analyze Photo (FormData variant) ──────────────────────────
export const analyzePhotoFormDataSchema = z.object({
  context: z.string().max(5000).optional(),
});

// ─── Damage Assessment (JSON body) ─────────────────────────────
export const damageAssessmentSchema = z.object({
  propertyAddress: z.string().min(1, "propertyAddress is required"),
  propertyType: z.string().optional(),
  yearBuilt: z.string().optional(),
  squareFootage: z.string().optional(),
  dateOfLoss: z.string().optional(),
  damageType: z.string().min(1, "damageType is required"),
  damageDescription: z.string().min(1, "damageDescription is required"),
  affectedAreas: z.array(z.string()).optional(),
  estimatedRepairCost: z.union([z.string(), z.number()]).optional(),
  estimatedReplacementCost: z.union([z.string(), z.number()]).optional(),
});

// ─── Supplement Export PDF ─────────────────────────────────────
export const supplementExportPdfSchema = z.object({
  claimId: z.string().min(1, "claimId is required"),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "item description is required"),
        quantity: z.number({ required_error: "quantity is required" }),
        unitPrice: z.number({ required_error: "unitPrice is required" }),
      })
    )
    .min(1, "At least one item is required"),
  total: z.number().optional(),
});

// ─── History (query params) ────────────────────────────────────
export const historyQuerySchema = z.object({
  type: z.enum(["weather", "rebuttal", "supplement", "damage", "mockup", "all"]).default("all"),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// ─── Orchestrate (query params) ────────────────────────────────
export const orchestrateQuerySchema = z.object({
  type: z.enum(["next_actions", "full_intelligence", "negotiate"]).default("full_intelligence"),
});

// ─── Skills (query params) ─────────────────────────────────────
export const skillsQuerySchema = z.object({
  role: z.enum(["Free", "Pro", "Admin"]).optional(),
  category: z.enum(["damage", "workflow", "communication", "analysis", "estimation"]).optional(),
  query: z.string().max(200).optional(),
  stats: z.enum(["true", "false"]).optional(),
  full: z.enum(["true", "false"]).optional(),
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
