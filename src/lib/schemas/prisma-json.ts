/**
 * Zod Schemas for Prisma JSON Fields
 *
 * These schemas provide type safety for JSON fields stored in the database.
 * Use these to validate and type-cast Prisma JSON fields instead of `as any`.
 *
 * Usage:
 *   const metadata = ClaimMetadataSchema.parse(claim.metadata);
 *   // metadata is now fully typed
 */

import { z } from "zod";

// ============================================================================
// Common Schemas
// ============================================================================

/**
 * Address schema used across multiple entities
 */
export const AddressSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type Address = z.infer<typeof AddressSchema>;

/**
 * Contact info schema
 */
export const ContactInfoSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  phoneAlt: z.string().optional(),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

// ============================================================================
// Claim Schemas
// ============================================================================

/**
 * Claim metadata JSON field
 */
export const ClaimMetadataSchema = z.object({
  source: z.string().optional(),
  importedFrom: z.string().optional(),
  externalId: z.string().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export type ClaimMetadata = z.infer<typeof ClaimMetadataSchema>;

/**
 * Weather data stored with claims
 */
export const WeatherDataSchema = z.object({
  date: z.string(),
  conditions: z.string().optional(),
  temperature: z.number().optional(),
  windSpeed: z.number().optional(),
  windDirection: z.string().optional(),
  precipitation: z.number().optional(),
  hailSize: z.number().optional(),
  source: z.string().optional(),
  confidence: z.number().optional(),
});

export type WeatherData = z.infer<typeof WeatherDataSchema>;

/**
 * Damage assessment data
 */
export const DamageAssessmentSchema = z.object({
  type: z.string(),
  severity: z.enum(["minor", "moderate", "severe", "total"]).optional(),
  area: z.string().optional(),
  description: z.string().optional(),
  estimatedCost: z.number().optional(),
  photos: z.array(z.string()).optional(),
  confidence: z.number().optional(),
});

export type DamageAssessment = z.infer<typeof DamageAssessmentSchema>;

// ============================================================================
// Report Schemas
// ============================================================================

/**
 * Report config JSON field
 */
export const ReportConfigSchema = z.object({
  templateId: z.string().optional(),
  includePhotos: z.boolean().default(true),
  includeWeather: z.boolean().default(true),
  includeMeasurements: z.boolean().default(true),
  includeEstimate: z.boolean().default(false),
  customSections: z.array(z.string()).optional(),
  branding: z
    .object({
      logoUrl: z.string().optional(),
      primaryColor: z.string().optional(),
      companyName: z.string().optional(),
    })
    .optional(),
});

export type ReportConfig = z.infer<typeof ReportConfigSchema>;

/**
 * Report output data
 */
export const ReportOutputSchema = z.object({
  pdfUrl: z.string().optional(),
  htmlContent: z.string().optional(),
  generatedAt: z.string(),
  pageCount: z.number().optional(),
  sections: z
    .array(
      z.object({
        name: z.string(),
        pageStart: z.number().optional(),
      })
    )
    .optional(),
});

export type ReportOutput = z.infer<typeof ReportOutputSchema>;

// ============================================================================
// Financial Schemas
// ============================================================================

/**
 * Line item schema for invoices/estimates
 */
export const LineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string(),
  quantity: z.number().default(1),
  unitPrice: z.number(),
  total: z.number(),
  category: z.string().optional(),
  taxable: z.boolean().default(true),
});

export type LineItem = z.infer<typeof LineItemSchema>;

/**
 * Invoice totals
 */
export const InvoiceTotalsSchema = z.object({
  subtotal: z.number(),
  tax: z.number(),
  taxRate: z.number().optional(),
  discount: z.number().optional(),
  discountPercent: z.number().optional(),
  total: z.number(),
  amountPaid: z.number().default(0),
  balance: z.number(),
});

export type InvoiceTotals = z.infer<typeof InvoiceTotalsSchema>;

/**
 * Payout breakdown
 */
export const PayoutBreakdownSchema = z.object({
  rcv: z.number().optional(), // Replacement Cost Value
  acv: z.number().optional(), // Actual Cash Value
  depreciation: z.number().optional(),
  deductible: z.number().optional(),
  supplements: z.number().optional(),
  overhead: z.number().optional(),
  profit: z.number().optional(),
  netPayout: z.number(),
});

export type PayoutBreakdown = z.infer<typeof PayoutBreakdownSchema>;

// ============================================================================
// Migration Schemas
// ============================================================================

/**
 * Migration job config
 */
export const MigrationConfigSchema = z.object({
  dryRun: z.boolean().default(false),
  batchSize: z.number().default(100),
  skipContacts: z.boolean().default(false),
  skipJobs: z.boolean().default(false),
  skipDocuments: z.boolean().default(false),
  skipTasks: z.boolean().default(false),
  dateFilter: z
    .object({
      after: z.string().optional(),
      before: z.string().optional(),
    })
    .optional(),
});

export type MigrationConfig = z.infer<typeof MigrationConfigSchema>;

/**
 * Migration stats
 */
export const MigrationStatsSchema = z.object({
  contactsImported: z.number().default(0),
  jobsImported: z.number().default(0),
  documentsImported: z.number().default(0),
  tasksImported: z.number().default(0),
  notesImported: z.number().default(0),
  recordsSkipped: z.number().default(0),
  recordsFailed: z.number().default(0),
});

export type MigrationStats = z.infer<typeof MigrationStatsSchema>;

// ============================================================================
// Pipeline Schemas
// ============================================================================

/**
 * Pipeline activity metadata
 */
export const PipelineActivityMetadataSchema = z.object({
  fromStage: z.string().optional(),
  toStage: z.string().optional(),
  reason: z.string().optional(),
  automated: z.boolean().optional(),
  triggeredBy: z.string().optional(),
});

export type PipelineActivityMetadata = z.infer<typeof PipelineActivityMetadataSchema>;

// ============================================================================
// Webhook Schemas
// ============================================================================

/**
 * Webhook delivery response
 */
export const WebhookResponseSchema = z.object({
  status: z.number(),
  body: z.string().optional(),
  headers: z.record(z.string()).optional(),
});

export type WebhookResponse = z.infer<typeof WebhookResponseSchema>;

/**
 * Sync error log entry
 */
export const SyncErrorSchema = z.object({
  error: z.string(),
  at: z.string(),
  context: z.record(z.unknown()).optional(),
});

export type SyncError = z.infer<typeof SyncErrorSchema>;

// ============================================================================
// AI Schemas
// ============================================================================

/**
 * AI estimate JSON structure
 */
export const AIEstimateSchema = z.object({
  scope: z.string().optional(),
  lineItems: z.array(LineItemSchema).optional(),
  totalEstimate: z.number().optional(),
  confidence: z.number().optional(),
  generatedAt: z.string().optional(),
  modelUsed: z.string().optional(),
});

export type AIEstimate = z.infer<typeof AIEstimateSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely parse JSON field with schema validation
 * Returns undefined if parsing fails
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | undefined {
  const result = schema.safeParse(data);
  return result.success ? result.data : undefined;
}

/**
 * Parse JSON field with schema, using default on failure
 */
export function parseWithDefault<T>(schema: z.ZodSchema<T>, data: unknown, defaultValue: T): T {
  const result = schema.safeParse(data);
  return result.success ? result.data : defaultValue;
}

/**
 * Type guard for checking if value is a valid JSON object
 */
export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
