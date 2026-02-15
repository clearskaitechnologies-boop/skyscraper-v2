/**
 * PDF Generation Pipeline
 * AI → Template → PDF complete flow
 */

import { renderToBuffer } from "@react-pdf/renderer";

import { buildAIContentFromTemplate } from "../ai/buildAIContentFromTemplate";
import { updateDocumentStatus } from "../documents/createGeneratedDocument";
import { hashPdf } from "../security/hashPdf";
import { uploadPdf } from "../storage/uploadPdf";
import { PdfDocument } from "./PdfDocument";

export interface GeneratePdfFromAIOptions {
  documentId: string;
  template: any;
  inputs: Record<string, any>;
  orgId: string;
  branding?: {
    logoUrl?: string;
    companyName?: string;
  };
}

export async function generatePdfFromAI({
  documentId,
  template,
  inputs,
  orgId,
  branding,
}: GeneratePdfFromAIOptions) {
  try {
    // Step 1: Generate AI content
    const aiContent = await buildAIContentFromTemplate({
      template,
      inputs,
    });

    // Step 2: Build PDF sections
    const sections = Object.entries(aiContent).map(([key, content]) => ({
      key,
      content,
    }));

    // Step 3: Render PDF
    const pdfBuffer = await renderToBuffer(
      <PdfDocument
        title={inputs.title || "Generated Report"}
        sections={sections}
        branding={branding}
      />
    );

    // Step 4: Calculate checksum
    const checksum = hashPdf(pdfBuffer);

    // Step 5: Upload to storage
    const path = `org_${orgId}/documents/${documentId}.pdf`;
    const { url } = await uploadPdf({
      buffer: pdfBuffer,
      path,
      orgId,
    });

    // Step 6: Update document status
    await updateDocumentStatus(documentId, "READY" as any, { fileUrl: url, checksum });

    return {
      url,
      checksum,
      size: pdfBuffer.length,
    };
  } catch (error) {
    console.error("PDF generation failed:", error);

    // Capture to Sentry
    if (typeof window === "undefined") {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(error, {
        tags: { subsystem: "pdf", operation: "ai_pdf_generation" },
        extra: { documentId },
      });
    }

    await updateDocumentStatus(documentId, "ERROR" as any);
    throw error;
  }
}
