import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { buildClaimContext } from "@/lib/claim/buildClaimContext";
import prisma from "@/lib/prisma";
import { ReportContextSchema } from "@/lib/reports/reportContext.schema";

/**
 * MASTER REPORT CONTEXT API
 *
 * Single source of truth for report generation
 * Returns all data needed: company branding, claim data, photos, weather, notes, findings, template
 *
 * This is the ONLY endpoint AI and PDF generators should call
 */

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const { claimId, templateId, templateType = "marketplace" } = body;

    if (!claimId) {
      return NextResponse.json({ error: "CLAIM_ID_REQUIRED" }, { status: 400 });
    }

    // 1. Build claim context (weather, photos, notes, findings, scopes, etc.)
    const claimContext = await buildClaimContext(claimId);

    // 2. Fetch organization branding
    const org = await prisma.org.findUnique({
      where: { clerkOrgId: orgId },
      select: {
        id: true,
        name: true,
        brandLogoUrl: true,
        pdfHeaderText: true,
        pdfFooterText: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "ORGANIZATION_NOT_FOUND" }, { status: 404 });
    }

    // 3. Fetch template (supports BOTH marketplace templates and company custom templates)
    let template: {
      id: string;
      name: string;
      description: string | null;
      category: string | null;
      structure: unknown;
      placeholders: string[];
      version: string;
    } | null = null;
    let templateSource: "marketplace" | "custom" | null = null;

    if (templateId) {
      if (templateType === "marketplace") {
        // New marketplace template via OrgTemplate
        const orgTemplate = await prisma.orgTemplate.findFirst({
          where: { orgId, id: templateId },
          include: { Template: true },
        });

        if (orgTemplate) {
          const marketplaceTemplate = orgTemplate.Template;

          template = {
            id: orgTemplate.id,
            name: orgTemplate.customName || marketplaceTemplate?.name || "Untitled",
            description: marketplaceTemplate?.description,
            category: marketplaceTemplate?.category,
            structure: marketplaceTemplate?.sections,
            placeholders: [],
            version: marketplaceTemplate?.version || "1.0",
          };
          templateSource = "marketplace";
        }
      } else if (templateType === "custom") {
        // Legacy company custom template
        const customTemplate = await prisma.report_templates.findFirst({
          where: { id: templateId, org_id: orgId },
        });

        if (customTemplate) {
          template = {
            id: customTemplate.id,
            name: customTemplate.name,
            description: null,
            category: null,
            structure: {
              sectionOrder: customTemplate.section_order,
              sectionEnabled: customTemplate.section_enabled,
              defaults: customTemplate.defaults,
            },
            placeholders: [],
            version: "1.0",
          };
          templateSource = "custom";
        }
      }
    }

    // 4-6. Fetch photos, notes, and damage assessments in parallel
    const [photos, notes, damageAssessments] = await Promise.all([
      prisma.file_assets.findMany({
        where: { claimId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          publicUrl: true,
          category: true,
          note: true,
          createdAt: true,
          ai_tags: true,
        },
      }),
      prisma.claim_activities.findMany({
        where: { claim_id: claimId },
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          message: true,
          type: true,
          created_at: true,
          user_id: true,
        },
      }),
      prisma.damage_assessments.findMany({
        where: { claim_id: claimId },
        orderBy: { created_at: "desc" },
        include: {
          damage_findings: {
            select: {
              id: true,
              location_facet: true,
              severity: true,
              description: true,
              damage_type: true,
              created_at: true,
            },
          },
        },
      }),
    ]);
    const findings = damageAssessments.flatMap((da) => da.damage_findings);

    // 7. Build complete report context
    const reportContext = {
      // Core identifiers
      reportId: `report-${claimId}-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      generatedBy: userId,

      // Company branding (inject into every page)
      company: {
        id: org.id,
        name: org.name,
        logo: org.brandLogoUrl,
        pdfHeaderText: org.pdfHeaderText,
        pdfFooterText: org.pdfFooterText,
      },

      // Claim data (from buildClaimContext)
      claim: {
        id: claimContext.claim.id,
        claimNumber: claimContext.claim.claimNumber,
        insured_name: claimContext.claim.insured_name,
        propertyAddress: claimContext.claim.propertyAddress,
        lossDate: claimContext.claim.lossDate,
        lossType: claimContext.claim.lossType,
        damageType: claimContext.claim.damageType,
        status: claimContext.claim.status,
        carrier: claimContext.claim.carrier,
        policyNumber: claimContext.claim.policyNumber,
        adjusterName: claimContext.claim.adjusterName,
        adjusterEmail: claimContext.claim.adjusterEmail,
        adjusterPhone: claimContext.claim.adjusterPhone,
      },

      // Property details
      property: claimContext.property,

      // Scopes (variance analysis)
      scopes: claimContext.scopes,
      variances: claimContext.variances,

      // Weather data (auto-pulled from Open-Meteo)
      weather: claimContext.weather
        ? {
            lossDate: claimContext.claim.lossDate,
            hailSize: claimContext.weather.raw.maxHailInches
              ? `${claimContext.weather.raw.maxHailInches}" diameter`
              : "No hail detected",
            windSpeed: claimContext.weather.raw.maxWindGustMph
              ? `${claimContext.weather.raw.maxWindGustMph} mph gusts`
              : "N/A",
            precipitation: claimContext.weather.raw.precipitationIn
              ? `${claimContext.weather.raw.precipitationIn}" total`
              : "None",
            provider: claimContext.weather.raw.provider,
            source: claimContext.weather.raw.sourceLabel,
            eventStart: claimContext.weather.raw.eventStart,
            eventEnd: claimContext.weather.raw.eventEnd,
            verificationStatement: claimContext.weather.facts,
          }
        : null,

      // Photos (organized by type)
      media: {
        photos: photos.map((p) => ({
          id: p.id,
          url: p.publicUrl,
          type: p.category?.toUpperCase() || "OTHER",
          caption: p.note,
          timestamp: p.createdAt.toISOString(),
          metadata: { ai_tags: p.ai_tags },
        })),
        photosByCategory: {
          ROOF: photos
            .filter((p) => p.category?.toUpperCase() === "ROOF")
            .map((p) => ({
              id: p.id,
              url: p.publicUrl,
              type: "ROOF",
              caption: p.note,
              timestamp: p.createdAt.toISOString(),
              metadata: { ai_tags: p.ai_tags },
            })),
          EXTERIOR: photos
            .filter((p) => p.category?.toUpperCase() === "EXTERIOR")
            .map((p) => ({
              id: p.id,
              url: p.publicUrl,
              type: "EXTERIOR",
              caption: p.note,
              timestamp: p.createdAt.toISOString(),
              metadata: { ai_tags: p.ai_tags },
            })),
          INTERIOR: photos
            .filter((p) => p.category?.toUpperCase() === "INTERIOR")
            .map((p) => ({
              id: p.id,
              url: p.publicUrl,
              type: "INTERIOR",
              caption: p.note,
              timestamp: p.createdAt.toISOString(),
              metadata: { ai_tags: p.ai_tags },
            })),
          DETAIL: photos
            .filter((p) => p.category?.toUpperCase() === "DETAIL")
            .map((p) => ({
              id: p.id,
              url: p.publicUrl,
              type: "DETAIL",
              caption: p.note,
              timestamp: p.createdAt.toISOString(),
              metadata: { ai_tags: p.ai_tags },
            })),
          AERIAL: photos
            .filter((p) => p.category?.toUpperCase() === "AERIAL")
            .map((p) => ({
              id: p.id,
              url: p.publicUrl,
              type: "AERIAL",
              caption: p.note,
              timestamp: p.createdAt.toISOString(),
              metadata: { ai_tags: p.ai_tags },
            })),
          OTHER: photos
            .filter((p) => !p.category || p.category?.toUpperCase() === "OTHER")
            .map((p) => ({
              id: p.id,
              url: p.publicUrl,
              type: "OTHER",
              caption: p.note,
              timestamp: p.createdAt.toISOString(),
              metadata: { ai_tags: p.ai_tags },
            })),
        },
        totalPhotos: photos.length,
      },

      // Notes (inspector observations)
      notes: notes.map((n) => ({
        id: n.id,
        content: n.message || "",
        authorName: null,
        authorId: n.user_id || "",
        createdAt: n.created_at.toISOString(),
        category: n.type,
      })),

      // Findings (damage assessments)
      findings: findings.map((f) => ({
        id: f.id,
        category: f.damage_type || "UNKNOWN",
        description: f.description || "",
        severity: f.severity,
        location: f.location_facet,
        detectedAt: f.created_at.toISOString(),
        status: "detected",
      })),

      // Evidence collections (organized by section)
      evidence: claimContext.evidence,

      // Carrier strategy (if carrier known)
      carrierStrategy: claimContext.carrierStrategy,

      // Template structure (if selected)
      template: template
        ? {
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            structure: template.structure,
            placeholders: template.placeholders,
            version: template.version,
            source: templateSource,
          }
        : null,

      // Metadata
      meta: {
        contextVersion: "2.0",
        buildTimestamp: new Date().toISOString(),
        cacheStatus: "fresh",
      },
    };

    // Validate schema before returning (prevents mismatches)
    const validatedContext = ReportContextSchema.parse(reportContext);

    console.log("[REPORT_CONTEXT] Context validated successfully");

    return NextResponse.json({
      ok: true,
      context: validatedContext,
    });
  } catch (error) {
    console.error("[REPORT_CONTEXT] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}
