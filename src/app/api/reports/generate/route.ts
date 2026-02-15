export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * REPORT GENERATION PIPELINE - MASTER ENDPOINT
 *
 * This is THE ONLY entry point for PDF report generation.
 * It follows the deterministic pipeline:
 *
 * 1. Fetch context from /api/reports/context
 * 2. Compose AI content via /api/reports/compose
 * 3. Render HTML template with merged data
 * 4. Convert HTML to PDF
 * 5. Upload to Supabase exports bucket
 * 6. Return signed URL (1-hour expiry)
 *
 * NO direct AI calls. NO manual context building.
 * ALL data flows through the master context API.
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createExportRecord } from "@/lib/exportRegistry";
import { featureDisabledResponse, FeatureFlags } from "@/lib/featureFlags";
import prisma from "@/lib/prisma";
import { generatePDFWithTimeout } from "@/lib/puppeteerTimeout";
import { checkRateLimit, rateLimitExceededResponse, RateLimits } from "@/lib/rateLimiter";
import { renderReportHtml } from "@/lib/reports/renderReportHtml";

// Configuration
const EXPORT_URL_TTL_SECONDS = parseInt(process.env.EXPORT_URL_TTL_SECONDS || "3600");
const STORAGE_BUCKET_EXPORTS = process.env.SUPABASE_STORAGE_BUCKET_EXPORTS || "exports";

// Initialize Supabase client for exports bucket
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Error codes
enum GenerateError {
  CONTEXT_FETCH_FAILED = "CONTEXT_FETCH_FAILED",
  OPENAI_COMPOSE_FAILED = "OPENAI_COMPOSE_FAILED",
  PDF_RENDER_FAILED = "PDF_RENDER_FAILED",
  STORAGE_UPLOAD_FAILED = "STORAGE_UPLOAD_FAILED",
  SIGNED_URL_FAILED = "SIGNED_URL_FAILED",
}

// Request validation schema
const GenerateReportSchema = z.object({
  claimId: z.string().min(1, "Claim ID required"),
  templateId: z.string().optional(), // If omitted, uses org default
  sections: z
    .array(
      z.enum([
        "executiveSummary",
        "damageAssessment",
        "weatherAnalysis",
        "scopeComparison",
        "photoDocumentation",
        "recommendations",
        "carrierStrategy",
      ])
    )
    .optional()
    .default([
      "executiveSummary",
      "damageAssessment",
      "weatherAnalysis",
      "scopeComparison",
      "photoDocumentation",
      "recommendations",
    ]),
});

type GenerateReportRequest = z.infer<typeof GenerateReportSchema>;

/**
 * STEP 1: Fetch report context
 */
async function fetchContext(
  claimId: string,
  templateId: string | undefined,
  cookies: string
): Promise<any> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reports/context`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
      body: JSON.stringify({ claimId, templateId }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "UNKNOWN" }));
      throw new Error(`${GenerateError.CONTEXT_FETCH_FAILED}: ${error.error}`);
    }

    const { context } = await res.json();
    console.log("[CONTEXT_OK]", {
      claimId,
      hasWeather: !!context.weather,
      photoCount: context.media?.totalPhotos,
    });
    return context;
  } catch (error) {
    console.error("[CONTEXT_ERROR]", error);
    throw error;
  }
}

/**
 * STEP 2: Compose AI content
 */
async function composeContent(
  context: any,
  sections: string[],
  cookies: string
): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reports/compose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
      body: JSON.stringify({ context, sections }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "UNKNOWN" }));
      throw new Error(`${GenerateError.OPENAI_COMPOSE_FAILED}: ${error.error}`);
    }

    const { composed } = await res.json();
    console.log("[COMPOSE_OK]", { sectionsGenerated: Object.keys(composed).length });
    return composed;
  } catch (error) {
    console.error("[COMPOSE_ERROR]", error);
    throw error;
  }
}

/**
 * STEP 3: Render HTML template using premium renderer
 */
function renderHTML(context: any, composed: Record<string, string>): string {
  return renderReportHtml(context, composed, { pageSize: "letter", showPageNumbers: true });
}

/**
 * STEP 4: Convert HTML to PDF using Puppeteer (with timeout protection)
 */
async function htmlToPDF(html: string): Promise<Buffer> {
  try {
    const pdfBuffer = await generatePDFWithTimeout(html, {
      format: "Letter",
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
      timeoutMs: FeatureFlags.PDF_RENDER_TIMEOUT,
    });

    console.log("[PDF_OK]", { size: pdfBuffer.length });
    return Buffer.from(pdfBuffer);
  } catch (error: any) {
    if (error.code === "PDF_RENDER_TIMEOUT") {
      console.error("❌ PDF_RENDER_TIMEOUT:", { timeoutMs: error.timeoutMs });
      throw new Error(
        `${GenerateError.PDF_RENDER_FAILED}: PDF generation timed out after ${error.timeoutMs}ms`
      );
    }
    console.error("[PDF_ERROR]", error);
    throw new Error(
      `${GenerateError.PDF_RENDER_FAILED}: ${error instanceof Error ? error.message : "Unknown"}`
    );
  }
}

/**
 * STEP 5: Upload to Supabase and return signed URL + export record
 */
async function uploadPDF(
  pdfBuffer: Buffer,
  claimId: string,
  orgId: string,
  userId: string,
  templateId?: string
): Promise<{ signedUrl: string; exportId: string | null; path: string }> {
  try {
    const filename = `${claimId}-${Date.now()}.pdf`;
    const path = `${orgId}/${filename}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET_EXPORTS)
      .upload(path, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      console.error("[UPLOAD_ERROR]", error);
      throw new Error(`${GenerateError.STORAGE_UPLOAD_FAILED}: ${error.message}`);
    }

    console.log("[UPLOAD_OK]", { path, size: pdfBuffer.length });

    // Generate signed URL with configurable expiry
    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET_EXPORTS)
      .createSignedUrl(path, EXPORT_URL_TTL_SECONDS);

    if (signedError || !signedData) {
      console.error("[SIGN_URL_ERROR]", signedError);
      throw new Error(`${GenerateError.SIGNED_URL_FAILED}: ${signedError?.message}`);
    }

    console.log("[SIGN_URL_OK]", { expiresIn: EXPORT_URL_TTL_SECONDS });

    // Create export record in database (non-blocking)
    const exportRecord = (await createExportRecord({
      claimId,
      orgId,
      type: "report",
      templateId,
      storagePath: path,
      storageUrl: signedData.signedUrl,
      createdBy: userId,
      metadata: { pdfSize: pdfBuffer.length, expiresIn: EXPORT_URL_TTL_SECONDS },
    })) as { id: string } | null;

    if (exportRecord) {
      console.log("[EXPORT_REGISTRY_OK]", { exportId: exportRecord.id });
    } else {
      console.warn("⚠️  Failed to create export record (non-critical)");
    }

    return {
      signedUrl: signedData.signedUrl,
      exportId: exportRecord?.id || null,
      path,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("GenerateError")) {
      throw error;
    }
    console.error("[UPLOAD_UNEXPECTED_ERROR]", error);
    throw new Error(
      `${GenerateError.STORAGE_UPLOAD_FAILED}: ${error instanceof Error ? error.message : "Unknown"}`
    );
  }
}

/**
 * MAIN HANDLER
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Auth
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Feature flag check
    if (!FeatureFlags.PDF_GENERATION_ENABLED || !FeatureFlags.PUPPETEER_ENABLED) {
      console.warn("⚠️  PDF generation disabled");
      return NextResponse.json(
        featureDisabledResponse("PDF Generation", "Service temporarily unavailable"),
        { status: 503 }
      );
    }

    // Rate limit check
    const rateLimitKey = `pdf-gen:${orgId}`;
    const rateLimit = checkRateLimit(rateLimitKey, RateLimits.PDF_GENERATION);
    if (!rateLimit.allowed) {
      console.warn("⚠️  Rate limit exceeded:", { orgId, resetAt: rateLimit.resetAt });
      return NextResponse.json(rateLimitExceededResponse(rateLimit.resetAt), { status: 429 });
    }

    // Parse request
    const body = await req.json();
    const parsed = GenerateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { claimId, templateId, sections } = parsed.data;

    console.log("[REPORT_GENERATE_START]", {
      claimId,
      templateId,
      sections: sections.length,
      orgId,
    });

    const cookies = req.headers.get("cookie") || "";

    // PIPELINE EXECUTION
    console.log("[GENERATE] Step 1: Fetching context...");
    const context = await fetchContext(claimId, templateId, cookies);

    console.log("[GENERATE] Step 2: Composing AI content...");
    const composed = await composeContent(context, sections, cookies);

    console.log("[GENERATE] Step 3: Rendering HTML...");
    console.log("[HTML_START]");
    const html = renderHTML(context, composed);
    console.log("[HTML_OK]", { length: html.length });

    console.log("[GENERATE] Step 4: Converting to PDF...");
    const pdfBuffer = await htmlToPDF(html);

    console.log("[GENERATE] Step 5: Uploading to storage...");
    const { signedUrl, exportId, path } = await uploadPDF(
      pdfBuffer,
      claimId,
      orgId,
      userId,
      templateId
    );

    const duration = Date.now() - startTime;

    console.log(`[REPORT_GENERATE_OK] Complete in ${duration}ms`, {
      claimId,
      pdfUrl: signedUrl,
      exportId,
    });

    // Create notification and send email on successful report generation
    try {
      const { sendReportReadyEmail } = await import("@/lib/email/resend");

      // Store notification
      try {
        await prisma.tradeNotification.create({
          data: {
            recipientId: userId,
            type: "report_ready",
            title: "Report Generated",
            message: `Your report for claim ${claimId} is ready to view`,
            actionUrl: `/claims/${claimId}/reports`,
            metadata: { claimId, exportId, templateId },
          },
        });
      } catch (notifErr) {
        console.error("[reports/generate] TradeNotification create failed:", notifErr);
      }

      // Get user email
      const user = await prisma.users.findFirst({
        where: { clerkUserId: userId },
        select: { email: true },
      });

      if (user?.email) {
        await sendReportReadyEmail(user.email, claimId, templateId || "Custom Report").catch(
          (err) => console.error("Failed to send report ready email:", err)
        );
      }
    } catch (error) {
      console.error("Failed to send report notifications:", error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      ok: true,
      pdfUrl: signedUrl,
      exportId,
      storagePath: path,
      claimId,
      sections: sections.length,
      duration,
      expiresIn: EXPORT_URL_TTL_SECONDS,
    });
  } catch (error: any) {
    console.error("[REPORT_GENERATE_ERROR]", {
      error: error.message,
      duration: Date.now() - startTime,
    });

    // Parse error type
    let errorCode = "UNKNOWN_ERROR";
    if (error.message.includes(GenerateError.CONTEXT_FETCH_FAILED)) {
      errorCode = GenerateError.CONTEXT_FETCH_FAILED;
    } else if (error.message.includes(GenerateError.OPENAI_COMPOSE_FAILED)) {
      errorCode = GenerateError.OPENAI_COMPOSE_FAILED;
    } else if (error.message.includes(GenerateError.PDF_RENDER_FAILED)) {
      errorCode = GenerateError.PDF_RENDER_FAILED;
    } else if (error.message.includes(GenerateError.STORAGE_UPLOAD_FAILED)) {
      errorCode = GenerateError.STORAGE_UPLOAD_FAILED;
    } else if (error.message.includes(GenerateError.SIGNED_URL_FAILED)) {
      errorCode = GenerateError.SIGNED_URL_FAILED;
    }

    return NextResponse.json(
      {
        error: errorCode,
        message: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
