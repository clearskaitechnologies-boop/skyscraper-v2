import { z } from "zod";

// Phase 1: Minimal alignment schemas for high-traffic models.
// These mirror core Prisma fields while omitting heavy relational arrays.
// Further refinement (Phase 2) will add nested relations & stricter enums.

export const claimLifecycleStageEnum = z
  .enum(["FILED", "INSPECTION", "ESTIMATE", "NEGOTIATION", "SETTLED", "CLOSED"])
  .optional();

export const claimSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  propertyId: z.string(),
  projectId: z.string().nullable().optional(),
  claimNumber: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  damageType: z.string(),
  dateOfLoss: z.date(),
  carrier: z.string().nullable().optional(),
  adjusterName: z.string().nullable().optional(),
  adjusterPhone: z.string().nullable().optional(),
  adjusterEmail: z.string().nullable().optional(),
  status: z.string(),
  priority: z.string(),
  estimatedValue: z.number().int().nullable().optional(),
  approvedValue: z.number().int().nullable().optional(),
  deductible: z.number().int().nullable().optional(),
  assignedTo: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  exposureCents: z.number().int().nullable().optional(),
  // Prisma raw uses snake_case; DTO uses camelCase
  insured_name: z.string().nullable().optional(),
  insured_name: z.string().nullable().optional(),
  lifecycleStage: claimLifecycleStageEnum,
  policyNumber: z.string().nullable().optional(),
  adjusterPacketSentAt: z.date().nullable().optional(),
  homeownerEmail: z.string().email().nullable().optional(),
  homeownerSummarySentAt: z.date().nullable().optional(),
  lastContactedAt: z.date().nullable().optional(),
  catStormEventId: z.string().nullable().optional(),
  propertyAddress: z.string().nullable().optional(),
});

export type Claim = z.infer<typeof claimSchema>;

export const leadSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  contactId: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  source: z.string(),
  value: z.number().int().nullable().optional(),
  probability: z.number().int().nullable().optional(),
  stage: z.string(),
  temperature: z.string(),
  assignedTo: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  followUpDate: z.date().nullable().optional(),
  closedAt: z.date().nullable().optional(),
  claimId: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Lead = z.infer<typeof leadSchema>;

export const stormRecordSchema = z.object({
  id: z.string(),
  address: z.string(),
  type: z.string(),
  date: z.date(),
  severity: z.string().nullable().optional(),
  rawData: z.any().nullable().optional(),
  createdAt: z.date(),
  orgId: z.string(),
});

export type StormRecord = z.infer<typeof stormRecordSchema>;

export const teamMemberSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  userId: z.string(),
  role: z.string(),
  phone: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  jobHistory: z.any().nullable().optional(),
  joined_at: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

// Utility: basic runtime validator wrappers
export function parseClaim(data: unknown): Claim {
  return claimSchema.parse(data);
}
export function parseLead(data: unknown): Lead {
  return leadSchema.parse(data);
}
export function parseStormRecord(data: unknown): StormRecord {
  return stormRecordSchema.parse(data);
}
export function parseTeamMember(data: unknown): TeamMember {
  return teamMemberSchema.parse(data);
}
