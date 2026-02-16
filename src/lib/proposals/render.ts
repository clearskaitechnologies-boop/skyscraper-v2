/**
 * PHASE 3 SPRINT 3: PDF Render Pipeline
 * Uses Puppeteer to render proposal templates to PDF
 * Uploads to Firebase Storage with signed URLs
 */

import puppeteer, { type Browser } from "puppeteer";
import { logger } from "@/lib/logger";

import { APP_URL } from "@/lib/env";
import prisma from "@/lib/prisma";
import { uploadBufferToFirebase } from "@/lib/storage/firebase-admin";

export interface RenderOptions {
  includeEvidence?: boolean;
  maxEvidenceImages?: number;
  includeWeather?: boolean;
  includeDol?: boolean;
}

export interface RenderResult {
  proposalId: string;
  fileId: string;
  pdfUrl: string;
  pages: number;
  fileSize: number;
}

/**
 * Render a proposal draft to PDF with retry logic
 */
export async function renderProposalPdf({
  draftId,
  template,
  options = {},
}: {
  draftId: string;
  template: string;
  options?: RenderOptions;
}): Promise<RenderResult> {
  try {
    return await renderPdfWithRetry(draftId, template, options, 1);
  } catch (error) {
    logger.error("[PDF Render] Failed after all retry attempts:", error);
    throw new Error("PDF generation failed - please try again or download HTML");
  }
}

/**
 * Internal function with retry logic for PDF rendering
 */
async function renderPdfWithRetry(
  draftId: string,
  template: string,
  options: RenderOptions,
  attempt: number
): Promise<RenderResult> {
  let browser: Browser | null = null;

  try {
    // Fetch proposal draft
    const draft = await prisma.proposal_drafts.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      throw new Error(`Proposal draft not found: ${draftId}`);
    }

    // Build print page URL with query params
    const url = new URL(`${APP_URL}/proposal/print`);
    url.searchParams.set("id", draftId);
    url.searchParams.set("template", template);
    if (options.includeEvidence !== undefined) {
      url.searchParams.set("includeEvidence", String(options.includeEvidence));
    }
    if (options.maxEvidenceImages) {
      url.searchParams.set("maxEvidenceImages", String(options.maxEvidenceImages));
    }

    logger.debug(`[PDF Render] Attempt ${attempt} - Starting Puppeteer for:`, url.toString());

    // Launch headless browser with timeout protection
    browser = await Promise.race([
      puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Browser launch timeout")), 10000)
      ),
    ]);

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1280, height: 1024 });

    // Navigate to print page with 20s timeout
    await Promise.race([
      page.goto(url.toString(), {
        waitUntil: "networkidle0",
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Page load timeout")), 20000)
      ),
    ]);

    // Generate PDF buffer with timeout
    const pdfBuffer = await Promise.race([
      page.pdf({
        format: "Letter",
        printBackground: true,
        margin: {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("PDF generation timeout")), 15000)
      ),
    ]);

    // Close browser immediately after PDF is generated
    await browser.close();
    browser = null;

    logger.debug("[PDF Render] PDF generated, size:", pdfBuffer.length, "bytes");

    // Upload to Firebase Storage
    const filePath = `proposals/${(draft as any).org_id || "org"}/${draftId}.pdf`;
    const { publicUrl } = await uploadBufferToFirebase(filePath, pdfBuffer, "application/pdf");

    logger.debug("[PDF Render] Uploaded to Firebase:", publicUrl);

    // Create ProposalFile record
    const proposalFile = await prisma.proposal_files.create({
      data: {
        proposal_id: draftId as any,
        kind: "pdf",
        url: publicUrl,
        pages: null,
        fileSize: pdfBuffer.length,
      } as any,
    });

    // Update draft status to rendered
    await prisma.proposal_drafts.update({
      where: { id: draftId },
      data: { status: "rendered" },
    });

    return {
      proposalId: draftId,
      fileId: proposalFile.id,
      pdfUrl: publicUrl,
      pages: 0,
      fileSize: pdfBuffer.length,
    };
  } catch (error) {
    // Ensure browser is closed even on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("[PDF Render] Error closing browser:", closeError);
      }
    }

    // Retry logic - one retry on failure
    if (attempt < 2) {
      console.warn(
        `[PDF Render] Attempt ${attempt} failed: ${error instanceof Error ? error.message : "Unknown error"}. Retrying...`
      );
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s backoff
      return renderPdfWithRetry(draftId, template, options, attempt + 1);
    }

    // Final failure
    throw error;
  }
}
