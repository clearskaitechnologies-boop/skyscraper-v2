/**
 * PDF Caching Helper
 * Upload rendered PDFs to storage and update file_url in generated_documents
 * Avoids re-rendering PDFs on every download
 */

import { logger } from "@/lib/observability/logger";
import crypto from "crypto";
import { Readable } from "stream";

import prisma from "@/lib/prisma";

export interface CachePDFOptions {
  documentId: string;
  pdfStream: Readable;
  orgId: string;
  fileName?: string;
}

export interface CachePDFResult {
  success: boolean;
  fileUrl?: string;
  fileSizeBytes?: number;
  error?: string;
}

/**
 * Cache rendered PDF to storage and update generated_documents.file_url
 */
export async function cacheRenderedPdf(options: CachePDFOptions): Promise<CachePDFResult> {
  const { documentId, pdfStream, orgId, fileName } = options;

  try {
    // Fetch document record
    const document = await prisma.$queryRaw<
      Array<{
        id: string;
        organization_id: string;
        type: string;
        document_name: string;
        claim_id?: string;
      }>
    >`
      SELECT id, organization_id, type, document_name, claim_id
      FROM generated_documents
      WHERE id = ${documentId}::uuid
      LIMIT 1
    `;

    if (!document || document.length === 0) {
      return {
        success: false,
        error: "Document not found",
      };
    }

    const doc = document[0];

    // Verify org ownership
    if (doc.organization_id !== orgId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Generate storage path: pdfs/{orgId}/{claimId}/{type}/{documentId}.pdf
    const claimId = doc.claim_id || "general";
    const docType = doc.type.toLowerCase();
    const safeFileName = fileName || `${doc.document_name.replace(/[^a-z0-9-_]/gi, "-")}.pdf`;
    const storagePath = `pdfs/${orgId}/${claimId}/${docType}/${documentId}-${safeFileName}`;

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Upload to Supabase Storage
    const supabase = getStorageClient();
    if (!supabase) {
      return {
        success: false,
        error: "Storage not configured",
      };
    }

    const { data, error } = await supabase.storage
      .from("documents")
      .upload(storagePath, pdfBuffer, {
        cacheControl: "3600",
        contentType: "application/pdf",
        upsert: false, // Don't overwrite existing
      });

    if (error) {
      logger.error("PDF cache upload error:", error);
      return {
        success: false,
        error: `Storage upload failed: ${error.message}`,
      };
    }

    // Calculate checksum
    const checksum = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

    // Update generated_documents with file_url, file_size, checksum
    await prisma.$executeRaw`
      UPDATE generated_documents
      SET 
        file_url = ${data.path},
        file_size_bytes = ${pdfBuffer.length}::bigint,
        checksum = ${checksum},
        updated_at = NOW()
      WHERE id = ${documentId}::uuid
    `;

    return {
      success: true,
      fileUrl: data.path,
      fileSizeBytes: pdfBuffer.length,
    };
  } catch (error) {
    logger.error("PDF caching error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get public or signed URL for cached PDF
 */
export async function getCachedPdfUrl(
  storagePath: string,
  expiresIn: number = 60 * 60 * 24 // 24 hours default
): Promise<string | null> {
  try {
    const supabase = getStorageClient();
    if (!supabase) {
      logger.error("Storage not configured");
      return null;
    }

    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data) {
      logger.error("Failed to get cached PDF URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    logger.error("Get cached PDF URL error:", error);
    return null;
  }
}

/**
 * Check if PDF is already cached
 */
export async function isPdfCached(documentId: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<Array<{ file_url: string | null }>>`
      SELECT file_url
      FROM generated_documents
      WHERE id = ${documentId}::uuid
      LIMIT 1
    `;

    return !!(result && result.length > 0 && result[0].file_url);
  } catch {
    return false;
  }
}

/**
 * Delete cached PDF from storage
 */
export async function deleteCachedPdf(storagePath: string): Promise<boolean> {
  try {
    const supabase = getStorageClient();
    if (!supabase) {
      logger.error("Storage not configured");
      return false;
    }

    const { error } = await supabase.storage.from("documents").remove([storagePath]);

    if (error) {
      logger.error("Delete cached PDF error:", error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Delete cached PDF error:", error);
    return false;
  }
}
