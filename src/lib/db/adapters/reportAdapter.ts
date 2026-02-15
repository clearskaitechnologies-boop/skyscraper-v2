/**
 * Report Adapter
 * Converts Prisma report models → Domain camelCase DTOs
 */

import type { ai_reports, claims, inspections, report_templates } from "@prisma/client";

// =============================================================================
// Domain DTOs
// =============================================================================

export interface AIReportDTO {
  id: string;
  orgId: string;
  type: string;
  title: string;
  prompt?: string;
  content: string;
  tokensUsed: number;
  model?: string;
  claimId?: string;
  inspectionId?: string;
  userId: string;
  userName: string;
  status: string;
  attachments?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  // Relations (optional)
  claim?: {
    id: string;
    claimNumber: string;
    insured_name?: string;
  };
}

export interface ReportTemplateDTO {
  id: string;
  orgId: string;
  name: string;
  isDefault: boolean;
  sectionOrder?: unknown[];
  sectionEnabled?: Record<string, boolean>;
  defaults?: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Adapter Functions
// =============================================================================

type AIReportRow = ai_reports & {
  claims?: claims | null;
  inspections?: inspections | null;
};

/**
 * Convert a raw Prisma ai_reports row to DTO
 */
export function adaptAIReport(row: AIReportRow): AIReportDTO {
  return {
    id: row.id,
    orgId: row.orgId,
    type: row.type,
    title: row.title,
    prompt: row.prompt ?? undefined,
    content: row.content,
    tokensUsed: row.tokensUsed,
    model: row.model ?? undefined,
    claimId: row.claimId ?? undefined,
    inspectionId: row.inspectionId ?? undefined,
    userId: row.userId,
    userName: row.userName,
    status: row.status,
    attachments: (row.attachments as Record<string, unknown>) ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,

    // Relations
    claim: row.claims
      ? {
          id: row.claims.id,
          claimNumber: row.claims.claimNumber,
          insured_name: row.claims.insured_name ?? undefined,
        }
      : undefined,
  };
}

/**
 * Convert a raw Prisma report_templates row to DTO
 */
export function adaptReportTemplate(row: report_templates): ReportTemplateDTO {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    isDefault: row.is_default,
    sectionOrder: row.section_order as unknown[] | undefined,
    sectionEnabled: row.section_enabled as Record<string, boolean> | undefined,
    defaults: row.defaults as Record<string, unknown> | undefined,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Adapt multiple AI reports
 */
export function adaptAIReports(rows: AIReportRow[]): AIReportDTO[] {
  return rows.map(adaptAIReport);
}

/**
 * Adapt multiple report templates
 */
export function adaptReportTemplates(rows: report_templates[]): ReportTemplateDTO[] {
  return rows.map(adaptReportTemplate);
}
