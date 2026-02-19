import { logger } from "@/lib/observability/logger";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

import { getOpenAI } from "@/lib/ai/client";
import {
  requireActiveSubscription,
  SubscriptionRequiredError,
} from "@/lib/billing/requireActiveSubscription";
import { buildClaimContext } from "@/lib/claim/buildClaimContext";
import { createExportRecord } from "@/lib/exportRegistry";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStorageClient } from "@/lib/storage/client";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const EXPORT_URL_TTL_SECONDS = parseInt(process.env.EXPORT_URL_TTL_SECONDS || "3600");
const STORAGE_BUCKET_EXPORTS = process.env.SUPABASE_STORAGE_BUCKET_EXPORTS || "exports";

/**
 * POST /api/mockups/generate
 * Generate before/after mockups using OpenAI Vision
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Billing guard ──
    try {
      await requireActiveSubscription(orgId);
    } catch (error) {
      if (error instanceof SubscriptionRequiredError) {
        return NextResponse.json(
          { error: "subscription_required", message: "Active subscription required" },
          { status: 402 }
        );
      }
      throw error;
    }

    // ── Rate limit ──
    const rl = await checkRateLimit(userId, "UPLOAD");
    if (!rl.success) {
      return NextResponse.json(
        {
          error: "rate_limit_exceeded",
          message: "Too many requests. Please try again later.",
          retryAfter: rl.reset,
        },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) },
        }
      );
    }

    const openai = getOpenAI();
    const supabase = getStorageClient();

    if (!supabase) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { claimId, photoId, instructions } = body;

    if (!claimId || !photoId) {
      return NextResponse.json({ error: "claimId and photoId required" }, { status: 400 });
    }

    logger.debug("🎨 MOCKUP_GENERATE_START:", { claimId, photoId });

    // Get claim context
    const context = await buildClaimContext(claimId);

    if (!context.claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Find the specific photo
    const photos = context.photos || [];
    const photo = photos.find((p: any) => p.id === photoId);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Use OpenAI Vision to analyze the damage
    const analysisPrompt = `You are an expert roofing contractor analyzing damage photos.

Photo caption: ${photo.caption || "No caption"}
Photo notes: ${photo.notes || "No notes"}
Damage type: ${context.claim.lossType || "Unknown"}

Describe what repairs would be needed to restore this to its original condition. Be specific about materials, methods, and scope of work.`;

    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: analysisPrompt },
            {
              type: "image_url",
              image_url: {
                url: photo.signedUrl || photo.publicUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const analysis = visionResponse.choices[0]?.message?.content || "No analysis available";

    logger.debug("[MOCKUP] Generating side-by-side PDF...");

    // Generate side-by-side HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    h1 {
      color: #117CFF;
      font-size: 28px;
      margin: 0 0 10px 0;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
    }
    .comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
    }
    .image-container {
      text-align: center;
    }
    .image-label {
      font-weight: bold;
      color: #111;
      font-size: 18px;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .image-box {
      border: 3px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: #f9f9f9;
    }
    .image-box img {
      width: 100%;
      height: auto;
      display: block;
    }
    .analysis {
      margin-top: 30px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #117CFF;
    }
    .analysis-title {
      font-weight: bold;
      color: #111;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .analysis-content {
      line-height: 1.6;
      color: #444;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Before / After Comparison</h1>
    <p class="subtitle">Claim #${context.claim.claimNumber || "N/A"} • ${context.claim.lossType || "Damage"}</p>
  </div>

  <div class="comparison">
    <div class="image-container">
      <div class="image-label">Before (Current Damage)</div>
      <div class="image-box">
        <img src="${photo.signedUrl || photo.publicUrl}" alt="Before">
      </div>
    </div>
    <div class="image-container">
      <div class="image-label">After (Proposed Repair)</div>
      <div class="image-box">
        <img src="${photo.signedUrl || photo.publicUrl}" alt="After" style="filter: brightness(1.1) contrast(1.1);">
      </div>
      <p style="margin-top: 10px; color: #666; font-size: 12px; font-style: italic;">
        * Conceptual representation of completed repairs
      </p>
    </div>
  </div>

  <div class="analysis">
    <div class="analysis-title">Repair Analysis</div>
    <div class="analysis-content">${analysis.replace(/\n/g, "<br>")}</div>
  </div>

  <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #999;">
    Generated by SkaiScraper on ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;

    // Convert to PDF
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
      });

      logger.debug("[MOCKUP_PDF_OK]", { size: pdfBuffer.length });

      // Upload to Supabase
      const filename = `mockup-${claimId}-${photoId}-${Date.now()}.pdf`;
      const path = `${orgId}/${claimId}/mockups/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET_EXPORTS)
        .upload(path, pdfBuffer, { contentType: "application/pdf" });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get signed URL
      const { data: signedData, error: signedError } = await supabase.storage
        .from(STORAGE_BUCKET_EXPORTS)
        .createSignedUrl(path, EXPORT_URL_TTL_SECONDS);

      if (signedError || !signedData) {
        throw new Error(`Signed URL failed: ${signedError?.message}`);
      }

      logger.debug("✅ MOCKUP_GENERATE_OK:", { claimId, photoId, url: signedData.signedUrl });

      // Create export record in database (non-blocking)
      const exportRecord = (await createExportRecord({
        claimId,
        orgId: context.claim.orgId,
        type: "mockup",
        storagePath: path,
        storageUrl: signedData.signedUrl,
        createdBy: userId,
        metadata: {
          photoId,
          instructions: instructions || null,
          analysis: analysis,
          pdfSize: pdfBuffer.length,
          expiresIn: EXPORT_URL_TTL_SECONDS,
        },
      })) as { id: string } | null;

      if (exportRecord) {
        logger.debug("📝 EXPORT_REGISTRY_OK:", { exportId: exportRecord.id });
      } else {
        logger.warn("⚠️  Failed to create export record (non-critical)");
      }

      return NextResponse.json({
        ok: true,
        beforeUrl: photo.publicUrl,
        afterUrl: photo.publicUrl,
        pdfUrl: signedData.signedUrl,
        analysis: analysis,
        exportId: exportRecord?.id || path,
        storagePath: path,
        expiresIn: EXPORT_URL_TTL_SECONDS,
      });
    } finally {
      if (browser) await browser.close();
    }
  } catch (error) {
    logger.error("❌ MOCKUP_GENERATE_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to generate mockup",
      },
      { status: 500 }
    );
  }
}
