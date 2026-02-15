// ============================================================================
// EXPORT ORCHESTRATOR - Universal Contractor Packet
// ============================================================================
// Composes sections, applies branding, generates PDF/DOCX/ZIP
// ============================================================================

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { getAllAISections } from "@/modules/ai/jobs/persist";
import { logAction } from "@/modules/audit/core/logger";

import { applyBrandingColors } from "../core/BrandingProvider";
import { getSectionsByKeys, validateSectionData } from "../core/SectionRegistry";
import type { ExportOptions, ExportResult, ReportContext, Section } from "../types";

/**
 * Check for unapproved AI fields
 */
async function checkUnapprovedAI(reportId: string): Promise<{
  hasUnapproved: boolean;
  count: number;
  sections: string[];
}> {
  const aiSections = await getAllAISections(reportId);
  let count = 0;
  const sectionKeys: string[] = [];

  for (const [sectionKey, section] of Object.entries(aiSections)) {
    const sectionData = section as {
      fields: Record<string, { aiGenerated?: boolean; approved?: boolean }>;
    };
    const unapprovedFields = Object.entries(sectionData.fields).filter(
      ([_, field]) => field.aiGenerated && !field.approved
    );
    if (unapprovedFields.length > 0) {
      count += unapprovedFields.length;
      sectionKeys.push(sectionKey);
    }
  }

  return {
    hasUnapproved: count > 0,
    count,
    sections: sectionKeys,
  };
}

/**
 * Main export orchestrator
 * Fetches data, composes sections, applies branding, generates file
 */
export async function exportReport(options: ExportOptions): Promise<ExportResult> {
  const { format, sections: sectionKeys, context, blockOnUnapproved } = options;

  try {
    // Log export start
    if (context?.orgId && context?.userId) {
      await logAction({
        orgId: context.orgId,
        userId: context.userId,
        userName: context.userName || "Unknown",
        action: "EXPORT_START",
        jobId: context.jobId,
        metadata: { format, sectionCount: sectionKeys.length },
      }).catch((err) => console.warn("[Export] Failed to log start:", err));
    }

    // Check for unapproved AI fields (if blocking enabled)
    if (blockOnUnapproved && context?.reportId) {
      const aiCheck = await checkUnapprovedAI(context.reportId);
      if (aiCheck.hasUnapproved) {
        // Log export failed
        if (context?.orgId && context?.userId) {
          await logAction({
            orgId: context.orgId,
            userId: context.userId,
            userName: context.userName || "Unknown",
            action: "EXPORT_FAILED",
            jobId: context.jobId,
            metadata: { reason: "unapproved_ai_fields", count: aiCheck.count },
          }).catch((err) => console.warn("[Export] Failed to log error:", err));
        }

        return {
          success: false,
          error: `Cannot export: ${aiCheck.count} unapproved AI field(s) in sections: ${aiCheck.sections.join(", ")}. Approve or disable blocking.`,
          errorCode: "AI_UNAPPROVED",
          hint: `Review and approve AI-generated fields in: ${aiCheck.sections.join(", ")}. Or disable "Block on Unapproved AI" in export settings.`,
        };
      }
    }

    // Get sections to render
    const sections = getSectionsByKeys(sectionKeys);

    // Validate required data
    const validation = validateSectionData(sections, context);
    if (!validation.valid) {
      // Log export failed
      if (context?.orgId && context?.userId) {
        await logAction({
          orgId: context.orgId,
          userId: context.userId,
          userName: context.userName || "Unknown",
          action: "EXPORT_FAILED",
          jobId: context.jobId,
          metadata: { reason: "missing_data", missing: validation.missing },
        }).catch((err) => console.warn("[Export] Failed to log error:", err));
      }

      return {
        success: false,
        error: `Missing required data: ${validation.missing.join(", ")}`,
        errorCode: "DATA_PROVIDER_EMPTY",
        hint: `Complete these sections before exporting: ${validation.missing.join(", ")}. Or deselect them from the export.`,
      };
    }

    // Route to appropriate export handler
    let result: ExportResult;
    switch (format) {
      case "pdf":
        result = await exportPDF(sections, context);
        break;
      case "docx":
        result = await exportDOCX(sections, context);
        break;
      case "zip":
        result = await exportZIP(sections, context);
        break;
      default:
        result = {
          success: false,
          error: `Unsupported format: ${format}`,
          errorCode: "UNSUPPORTED_FORMAT",
          hint: `Supported formats: PDF, DOCX, ZIP. Please select a valid format.`,
        };
    }

    // Log export complete/failed
    if (context?.orgId && context?.userId) {
      await logAction({
        orgId: context.orgId,
        userId: context.userId,
        userName: context.userName || "Unknown",
        action: result.success ? "EXPORT_COMPLETE" : "EXPORT_FAILED",
        jobId: context.jobId,
        metadata: {
          format,
          sectionCount: sectionKeys.length,
          ...(result.success ? { bufferSize: result.buffer?.length } : { error: result.error }),
        },
      }).catch((err) => console.warn("[Export] Failed to log completion:", err));
    }

    return result;
  } catch (error: any) {
    console.error("[Export Orchestrator] Error:", error);

    // Log export failed
    if (context?.orgId && context?.userId) {
      await logAction({
        orgId: context.orgId,
        userId: context.userId,
        userName: context.userName || "Unknown",
        action: "EXPORT_FAILED",
        jobId: context.jobId,
        metadata: { error: error.message, format },
      }).catch((err) => console.warn("[Export] Failed to log error:", err));
    }

    return {
      success: false,
      error: error.message || "Export failed",
      errorCode: "UNKNOWN",
      hint: "An unexpected error occurred. Please try again or contact support if the issue persists.",
    };
  }
}

/**
 * Export as PDF using pdf-lib
 */
async function exportPDF(sections: Section[], context: ReportContext): Promise<ExportResult> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { brandRgb, accentRgb } = applyBrandingColors(context.branding);

  // Render each section
  for (const section of sections) {
    await renderSection(pdfDoc, section, context, {
      font,
      fontBold,
      brandRgb,
      accentRgb,
    });
  }

  // Add page numbers
  addPageNumbers(pdfDoc, font, brandRgb);

  const pdfBytes = await pdfDoc.save();

  return {
    success: true,
    buffer: Buffer.from(pdfBytes),
  };
}

/**
 * Render a single section into the PDF
 */
async function renderSection(
  pdfDoc: PDFDocument,
  section: Section,
  context: ReportContext,
  fonts: any
) {
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();
  const { font, fontBold, brandRgb } = fonts;

  // Section header
  page.drawRectangle({
    x: 0,
    y: height - 60,
    width,
    height: 60,
    color: rgb(brandRgb.r, brandRgb.g, brandRgb.b),
  });

  page.drawText(section.title, {
    x: 40,
    y: height - 40,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Section content (placeholder for now - will be replaced with real renderers)
  page.drawText(`[${section.key}] - Content placeholder`, {
    x: 40,
    y: height - 100,
    size: 12,
    font,
  });

  page.drawText(`Section data: ${JSON.stringify(context.metadata).substring(0, 100)}...`, {
    x: 40,
    y: height - 120,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Call section's render function (currently placeholders)
  await section.renderFn(context);
}

/**
 * Add page numbers to all pages
 */
function addPageNumbers(
  pdfDoc: PDFDocument,
  font: any,
  brandRgb: { r: number; g: number; b: number }
) {
  const pages = pdfDoc.getPages();
  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNum = `Page ${index + 1} of ${pages.length}`;

    // Footer bar
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 30,
      color: rgb(brandRgb.r, brandRgb.g, brandRgb.b),
    });

    page.drawText(pageNum, {
      x: width / 2 - 30,
      y: 10,
      size: 10,
      font,
      color: rgb(1, 1, 1),
    });
  });
}

/**
 * Export as DOCX (placeholder - will use docx library in Phase 2)
 */
async function exportDOCX(sections: Section[], context: ReportContext): Promise<ExportResult> {
  // TODO: Implement DOCX generation using 'docx' npm package
  // For now, return error
  return {
    success: false,
    error: "DOCX export not yet implemented (Phase 2)",
  };
}

/**
 * Export as ZIP with PDF + attachments (placeholder)
 */
async function exportZIP(sections: Section[], context: ReportContext): Promise<ExportResult> {
  // TODO: Implement ZIP generation using 'archiver' or 'jszip'
  // Include: PDF, photos, attachments, invoices
  return {
    success: false,
    error: "ZIP export not yet implemented (Phase 2)",
  };
}
