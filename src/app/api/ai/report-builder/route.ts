/**
 * AI Report Builder API
 *
 * POST /api/ai/report-builder
 *
 * Generates comprehensive PDF reports from Storm Intake analysis.
 * Integrates with AI pipeline and PDF generation system.
 */

import { NextRequest, NextResponse } from "next/server";

import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";

import { runStormIntakePipeline } from "@/lib/ai/pipelines/stormIntake";
import { generatePDFBuffer } from "@/lib/pdf/reportBuilder";
import prisma from "@/lib/prisma";

async function POST_INNER(req: NextRequest, ctx: { userId: string; orgId: string | null }) {
  try {
    const { userId } = ctx;

    const body = await req.json();
    const { claimId, images, property } = body;

    console.log("[Report Builder] Request received for claimId:", claimId);
    console.log("[Report Builder] Images count:", images?.length);

    if (!claimId) {
      return NextResponse.json({ success: false, error: "claimId is required" }, { status: 400 });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least 1-3 roof damage photos are required to generate a report",
        },
        { status: 400 }
      );
    }

    // Fetch claim details
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      include: {
        properties: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    // Get org context
    const orgId = claim.orgId || "unknown";

    // Validate images are valid URLs or data URIs
    const validImages = images.filter((img: string) => {
      if (!img || typeof img !== "string") return false;
      return (
        img.startsWith("http") ||
        img.startsWith("data:") ||
        img.startsWith("/") ||
        img.startsWith("blob:")
      );
    });

    if (validImages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid image URLs found. Please ensure photos are uploaded correctly.",
        },
        { status: 400 }
      );
    }

    console.log("[Report Builder] Starting analysis for claim:", claimId);
    console.log(
      "[Report Builder] Processing",
      validImages.length,
      "valid images out of",
      images.length,
      "total"
    );

    // Run Storm Intake Pipeline
    const pipelineResult = await runStormIntakePipeline({
      images: validImages,
      claimId,
      orgId,
      propertyAddress: property?.address,
      lossDate: claim.dateOfLoss || undefined,
      damageType: claim.damageType || undefined,
    });

    if (!pipelineResult.success || !pipelineResult.results) {
      console.error("[Report Builder] Pipeline failed:", pipelineResult.error);
      return NextResponse.json(
        {
          success: false,
          error: pipelineResult.error || "AI analysis failed",
        },
        { status: 500 }
      );
    }

    console.log("[Report Builder] Analysis complete, generating PDF");

    // Build report data
    const reportData = {
      claimId,
      claimNumber: claim.claimNumber || undefined,
      property: {
        address: claim.properties?.street || property?.address || "Unknown Address",
        city: claim.properties?.city || property?.city || "",
        state: claim.properties?.state || property?.state || "",
        zip: claim.properties?.zipCode || property?.zip || "",
      },
      analysis: pipelineResult.results,
      generatedAt: new Date().toISOString(),
      generatedBy: userId,
      orgName: undefined, // Could fetch from org table if needed
    };

    // Generate PDF
    const pdfBuffer = await generatePDFBuffer(reportData);

    console.log("[Report Builder] PDF generated successfully");
    console.log("[Report Builder] PDF size:", (pdfBuffer.length / 1024).toFixed(2), "KB");

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="SkaiScraper_Report_${claimId}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[Report Builder] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export const POST = withAiBilling(
  createAiConfig("report_builder", { costPerRequest: 30 }),
  POST_INNER
);
