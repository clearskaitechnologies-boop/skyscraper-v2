// lib/reports/generatePdfForClaim.ts
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";

import prisma from "@/lib/prisma";

import { buildReportData } from "./buildReportData";
import { buildClaimHtml } from "./claims-html";
import { htmlToPdfBuffer, uploadReport } from "./pdf-utils";
import { buildRetailHtml } from "./retail-html";
import type { ReportConfig } from "./types";

interface GeneratePdfResult {
  url: string;
  claimId: string;
  type: string;
  reportId?: string; // Phase R: Return saved report ID
}

/**
 * Generates a PDF report for a single claim
 * Reusable function for both single and batch generation
 * Phase R: Now saves report metadata to database
 */
export async function generatePdfForClaim(config: ReportConfig): Promise<GeneratePdfResult> {
  const { claimId, type, sections, options } = config;

  // Build report data from all configured sections
  const reportData = await buildReportData(config);

  // Generate HTML based on report type
  let html: string;

  if (type === "INSURANCE_CLAIM") {
    html = await buildClaimHtml({
      claimId,
      reportData,
      orgName: reportData.org.name,
      generatedAt: new Date(),
    });
  } else if (type === "RETAIL_PROPOSAL") {
    html = await buildRetailHtml({
      reportData,
      generatedAt: new Date(),
    });
  } else {
    // For other types, use claim HTML as fallback
    html = await buildClaimHtml({
      claimId,
      reportData,
      orgName: reportData.org.name,
      generatedAt: new Date(),
    });
  }

  // Convert HTML to PDF buffer
  const pdfBuffer = await htmlToPdfBuffer(html);
  const fileSize = pdfBuffer.length;

  // Upload to storage
  const timestamp = Date.now();
  const storageKey = `${config.orgId}/${claimId}/${type}_${timestamp}.pdf`;
  const publicUrl = await uploadReport({
    bucket: "reports-pdfs",
    key: storageKey,
    buffer: pdfBuffer,
  });

  // Phase R: Save report metadata to database
  const reportId = nanoid();
  try {
    await prisma.ai_reports.create({
      data: {
        id: reportId,
        orgId: config.orgId,
        claimId: claimId,
        type: type,
        status: "finalized", // Auto-finalize on generation
        pdfUrl: publicUrl,
        sections: sections as any, // JSON field
        configData: options as any, // Store builder config
        createdById: config.options?.generatedBy || "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        title: options?.customTitle || `${type} Report`,
        subtitle: `Generated ${new Date().toLocaleDateString()}`,
        meta: {
          fileSize,
          storageKey,
          templateVersion: "phase-r-v1",
        } as any,
      },
    });
  } catch (error) {
    logger.warn("[generatePdfForClaim] Failed to save report metadata:", error);
    // Continue even if save fails - PDF was generated successfully
  }

  return {
    url: publicUrl,
    claimId,
    type,
    reportId, // Phase R: Return report ID for history tracking
  };
}
