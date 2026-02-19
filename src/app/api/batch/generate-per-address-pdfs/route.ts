import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

/**
 * POST /api/batch/generate-per-address-pdfs
 *
 * Generate unique PDFs for each address in batch
 * Each PDF has:
 * - Unique cover page with address, storm info, org branding
 * - Template-specific content with address-personalized wording
 * - Consistent template structure with personalized variables
 *
 * Returns: Array of PDF URLs or zip file download
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireApiAuth();

    // Check if authResult is an error response
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId, orgId } = authResult;

    const body = await req.json();
    const { addresses = [], templateSlug, stormData = {}, batchMetadata = {} } = body;

    if (!addresses || addresses.length === 0) {
      return NextResponse.json({ error: "Address list required" }, { status: 400 });
    }

    if (!templateSlug) {
      return NextResponse.json({ error: "Template slug required" }, { status: 400 });
    }

    // Get template
    const template = await prisma.template.findUnique({
      where: { slug: templateSlug },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Get org branding
    const orgRecord = await prisma.org.findUnique({
      where: { id: orgId! },
      select: { name: true },
    });
    const branding = await prisma.org_branding.findFirst({
      where: { orgId: orgId ?? undefined },
      select: {
        logoUrl: true,
        phone: true,
        website: true,
      },
    });
    const org = {
      name: orgRecord?.name ?? "",
      companyLogoUrl: branding?.logoUrl ?? null,
      companyAddress: branding?.website ?? null,
      companyPhone: branding?.phone ?? null,
    };

    // Generate PDFs for each address
    const pdfResults = await Promise.all(
      addresses.map(async (address: string, index: number) => {
        try {
          // Parse address components
          const addressParts = parseAddress(address);

          // Build personalized content
          const personalizedContent = buildPersonalizedContent({
            template,
            address: addressParts,
            stormData,
            orgData: org || {},
            batchMetadata,
          });

          // Generate PDF (mock for now - in production, call PDF service)
          const pdfUrl = await generatePDFForAddress({
            content: personalizedContent,
            address: addressParts,
            orgId,
            userId,
          });

          return {
            address,
            pdfUrl,
            success: true,
          };
        } catch (error) {
          logger.error(`[PerAddressPDF] Failed for ${address}:`, error);
          return {
            address,
            error: error.message,
            success: false,
          };
        }
      })
    );

    // Count results
    const successful = pdfResults.filter((r) => r.success).length;
    const failed = pdfResults.filter((r) => !r.success).length;

    return NextResponse.json({
      ok: true,
      results: pdfResults,
      summary: {
        total: addresses.length,
        successful,
        failed,
        templateUsed: templateSlug,
      },
    });
  } catch (error) {
    logger.error("[PerAddressPDF] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PDFs" },
      { status: 500 }
    );
  }
}

// Helper: Parse address string into components
function parseAddress(address: string) {
  const parts = address.split(",").map((p) => p.trim());

  return {
    street: parts[0] || "",
    city: parts[1] || "",
    stateZip: parts[2] || "",
    full: address,
  };
}

// Helper: Build personalized content for address
function buildPersonalizedContent(params: any) {
  const { template, address, stormData, orgData, batchMetadata } = params;

  // Get auto-fill map from template
  const autoFillMap = template.autoFillMap || {};

  // Build personalized data object
  const personalizedData: Record<string, string> = {};

  // Property address fields
  personalizedData["{{PROPERTY_ADDRESS}}"] = address.full;
  personalizedData["{{STREET_ADDRESS}}"] = address.street;
  personalizedData["{{CITY}}"] = address.city;
  personalizedData["{{STATE_ZIP}}"] = address.stateZip;

  // Storm data fields
  personalizedData["{{STORM_DATE}}"] = stormData.date || "TBD";
  personalizedData["{{STORM_TYPE}}"] = stormData.type || "Storm Damage";
  personalizedData["{{STORM_NAME}}"] = stormData.name || "Recent Storm Event";
  personalizedData["{{HAIL_SIZE}}"] = stormData.hailSize || "N/A";
  personalizedData["{{WIND_SPEED}}"] = stormData.windSpeed || "N/A";

  // Org branding fields
  personalizedData["{{COMPANY_NAME}}"] = orgData.name || "Your Company";
  personalizedData["{{COMPANY_PHONE}}"] = orgData.companyPhone || "(555) 555-5555";
  personalizedData["{{COMPANY_ADDRESS}}"] = orgData.companyAddress || "";

  // Batch metadata
  personalizedData["{{BATCH_ID}}"] = batchMetadata.batchId || "";
  personalizedData["{{GENERATION_DATE}}"] = new Date().toLocaleDateString();

  return {
    template: template.title,
    slug: template.slug,
    personalizedData,
    address: address.full,
  };
}

// Helper: Generate PDF for address (mock implementation)
async function generatePDFForAddress(params: any) {
  const { content, address, orgId, userId } = params;

  // In production, this would:
  // 1. Render HTML template with personalized data
  // 2. Call Puppeteer/Playwright to generate PDF
  // 3. Upload to Vercel Blob storage
  // 4. Return blob URL

  // For MVP, return mock URL
  const mockPdfUrl = `/api/batch/pdfs/${orgId}/${encodeURIComponent(address.street)}.pdf`;

  return mockPdfUrl;
}
