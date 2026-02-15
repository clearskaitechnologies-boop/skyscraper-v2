/**
 * Enhanced Report Builder API
 *
 * POST /api/ai/enhanced-report-builder
 *
 * Generates comprehensive 20-40 page professional branded PDF reports.
 * Orchestrates: Storm Intake → Weather → Photos → Materials → Compliance → PDF
 */

import { NextRequest, NextResponse } from "next/server";

import { annotatePhotos } from "@/lib/ai/photo-annotator";
import { runStormIntakePipeline } from "@/lib/ai/pipelines/stormIntake";
import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";
import { checkCompliance } from "@/lib/compliance/code-checker";
import { fetchWeatherForDOL } from "@/lib/integrations/weather";
import { getRecommendedProducts } from "@/lib/materials/vendor-catalog";
import type { EnhancedReportData } from "@/lib/pdf/enhancedReportBuilder";
import { generateEnhancedPDFReport } from "@/lib/pdf/enhancedReportBuilder";
import prisma from "@/lib/prisma";

async function POST_INNER(req: NextRequest, ctx: { userId: string; orgId: string }) {
  try {
    const { userId, orgId } = ctx;

    const body = await req.json();
    const { claimId, options } = body;

    if (!claimId) {
      return NextResponse.json({ error: "claimId is required" }, { status: 400 });
    }

    console.log("[Enhanced Report Builder] Starting comprehensive report generation:", {
      claimId,
      orgId,
      options,
    });

    // 1. FETCH CLAIM DETAILS
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      include: {
        properties: true,
      },
    });

    // Fetch photos separately using FileAsset
    const photos = await prisma.file_assets.findMany({
      where: { claimId, category: "photo" },
      take: 20,
    });

    // Fetch homeowner contact from clientLinks if available
    const clientLink = await prisma.claimClientLink.findFirst({
      where: { claimId },
    });

    if (!claim || claim.orgId !== orgId) {
      return NextResponse.json({ error: "Claim not found or access denied" }, { status: 404 });
    }

    const property = claim.properties;
    const homeowner = clientLink;

    if (!property) {
      return NextResponse.json({ error: "Property information required" }, { status: 400 });
    }

    if (photos.length === 0) {
      return NextResponse.json({ error: "No photos found for this claim" }, { status: 400 });
    }

    console.log(`[Enhanced Report Builder] Found ${photos.length} photos`);

    // 2. RUN STORM INTAKE PIPELINE
    console.log("[Enhanced Report Builder] Running AI Storm Intake Pipeline...");

    const photoUrls = photos.map((p) => p.publicUrl);
    const analysisResult = await runStormIntakePipeline({
      images: photoUrls,
      claimId,
      orgId,
      propertyAddress: property.street,
      lossDate: claim.dateOfLoss,
      damageType: claim.damageType,
    });

    if (!analysisResult.success) {
      return NextResponse.json(
        { error: "AI analysis failed", details: analysisResult.error },
        { status: 500 }
      );
    }

    const analysis = analysisResult.results!;

    // 3. FETCH WEATHER DATA (if enabled)
    let weatherData;
    if (options?.includeWeather !== false && claim.dateOfLoss) {
      console.log("[Enhanced Report Builder] Fetching weather data...");
      // fetchWeatherForDOL returns WeatherData | null
      const lat = 0; // TODO: Get from property if available
      const lng = 0; // TODO: Get from property if available
      const weatherResult = await fetchWeatherForDOL(lat, lng, claim.dateOfLoss);

      if (weatherResult) {
        weatherData = weatherResult;
        console.log("[Enhanced Report Builder] Weather data retrieved");
      }
    }

    // 4. ANNOTATE PHOTOS (if enabled)
    let annotatedPhotos;
    if (options?.includeAnnotations !== false) {
      console.log("[Enhanced Report Builder] Annotating photos with AI...");
      const photoData = photos.map((p) => ({ id: p.id, url: p.publicUrl }));
      const annotationResult = await annotatePhotos(photoData);

      if (annotationResult.success) {
        annotatedPhotos = annotationResult.data;
        console.log(`[Enhanced Report Builder] ${annotatedPhotos?.length} photos annotated`);
      }
    }

    // 5. CHECK CODE COMPLIANCE (if enabled)
    let complianceReport;
    if (options?.includeCompliance !== false && property.yearBuilt) {
      console.log("[Enhanced Report Builder] Checking code compliance...");
      // checkCompliance takes (state, county?, damageType?) and returns CodeCheckResult
      const complianceResult = await checkCompliance(
        property.state,
        property.city,
        claim.damageType
      );

      if (complianceResult.compliant !== undefined) {
        complianceReport = complianceResult;
        console.log("[Enhanced Report Builder] Compliance report generated");
      }
    }

    // 6. GET MATERIAL RECOMMENDATIONS (if enabled)
    let recommendedMaterials;
    if (options?.includeMaterials !== false) {
      console.log("[Enhanced Report Builder] Finding recommended materials...");
      recommendedMaterials = getRecommendedProducts({
        damageType: analysis.summary.primaryDamageType as "hail" | "wind",
        budget: "standard",
        impactResistance: analysis.summary.primaryDamageType === "hail",
      });
      console.log(`[Enhanced Report Builder] ${recommendedMaterials.length} products recommended`);
    }

    // 7. FETCH COMPANY BRANDING
    let branding;
    if (orgId) {
      const org = await prisma.org.findUnique({
        where: { clerkOrgId: orgId },
      });
      const orgBranding = await prisma.org_branding.findFirst({
        where: { orgId: org?.id },
      });

      if (org) {
        branding = {
          companyName: orgBranding?.companyName || org.name,
          logo: orgBranding?.logoUrl || org.brandLogoUrl,
          primaryColor: orgBranding?.colorPrimary || "#2563eb",
          secondaryColor: orgBranding?.colorAccent || "#64748b",
          phone: orgBranding?.phone || undefined,
          email: orgBranding?.email || undefined,
          website: orgBranding?.website || undefined,
          licenseNumber: orgBranding?.license || undefined,
        };
        console.log("[Enhanced Report Builder] Branding loaded");
      }
    }

    // 8. ASSEMBLE ENHANCED REPORT DATA
    const reportData: EnhancedReportData = {
      claimId: claim.id,
      claimNumber: claim.claimNumber || undefined,
      dateOfLoss: claim.dateOfLoss!,
      property: {
        address: property.street,
        city: property.city,
        state: property.state,
        zip: property.zipCode,
        yearBuilt: property.yearBuilt || undefined,
        stories: undefined, // properties table doesn't have stories
      },
      homeowner: {
        name: homeowner?.clientName || claim.insured_name || "Homeowner",
        email: homeowner?.clientEmail || claim.homeowner_email || undefined,
        phone: undefined, // ClaimClientLink doesn't store phone
      },
      analysis,
      weatherData,
      annotatedPhotos,
      complianceReport,
      recommendedMaterials: recommendedMaterials?.slice(0, 3), // Top 3
      branding,
      generatedAt: new Date(),
      generatedBy: userId,
      reportVersion: "2.0-Enhanced",
    };

    // 9. GENERATE COMPREHENSIVE PDF
    console.log("[Enhanced Report Builder] Generating comprehensive PDF...");
    const pdfBuffer = await generateEnhancedPDFReport(reportData);

    console.log(`[Enhanced Report Builder] PDF generated: ${pdfBuffer.length} bytes`);

    // 10. RETURN PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Comprehensive-Damage-Report-${claim.claimNumber || claimId}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[Enhanced Report Builder] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate enhanced report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const POST = withAiBilling(
  createAiConfig("enhanced_report", { costPerRequest: 40, planRequired: "pro" }),
  async (req: NextRequest, ctx) => POST_INNER(req, { userId: ctx.userId, orgId: ctx.orgId || "" })
);
