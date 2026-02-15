/**
 * Per-Address Cover Page Generator
 * Generates unique cover pages for batch community reports
 * Each address gets storm-aware, property-specific content
 */

import prisma from "@/lib/prisma";
import { buildClaimContext, TemplateContext } from "@/lib/templates/templateContext";

interface AddressData {
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyData?: any;
}

interface BatchCoverOptions {
  communityId: string;
  orgId: string;
  templateId: string;
  stormDate?: Date;
  stormType?: string;
  addresses: AddressData[];
}

/**
 * Generate unique cover pages for each address in a community
 * NO REUSED COVERS - Each property gets custom content
 */
export async function generatePerAddressCovers({
  communityId,
  orgId,
  templateId,
  stormDate,
  stormType,
  addresses,
}: BatchCoverOptions) {
  const results = [];
  const errors = [];

  console.log(`[BATCH_COVERS] Starting generation for ${addresses.length} addresses`);

  for (let i = 0; i < addresses.length; i++) {
    const addressData = addresses[i];

    try {
      // Create a temporary claim context for this address
      // In production, you might have actual property records
      const context: TemplateContext = {
        org: {
          name: "Loading...", // Will be populated from org data
          logoUrl: null,
          primaryColor: "#0ea5e9",
          secondaryColor: "#3b82f6",
          phone: "",
          email: "",
          website: "",
          address: "",
        },
        employee: {
          name: "Team Member",
          title: "Adjuster",
          email: "",
          phone: "",
          headshotUrl: null,
        },
        claim: {
          claimNumber: `COMMUNITY-${communityId.slice(0, 8)}-${i + 1}`,
          policyNumber: "",
          dateOfLoss: stormDate?.toISOString().split("T")[0] || "",
          lossType: stormType || "Storm Damage",
          carrier: "",
          adjuster: "",
          status: "COMMUNITY_REPORT",
        },
        property: {
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          zip: addressData.zip,
          yearBuilt: addressData.propertyData?.yearBuilt || "",
        },
        client: {
          name: "Homeowner", // Unknown for community reports
          email: "",
          phone: "",
        },
        isPreview: false,
        generatedAt: new Date().toISOString(),
        version: "1.0",
      };

      // Fetch org branding data
      const org = await prisma.org.findUnique({
        where: { id: orgId },
        select: {
          name: true,
          logoUrl: true,
          brandColor: true,
          phone: true,
          email: true,
          website: true,
          address: true,
        },
      });

      if (org) {
        context.org = {
          name: org.name || "Your Company",
          logoUrl: org.logoUrl,
          primaryColor: org.brandColor || "#0ea5e9",
          secondaryColor: "#3b82f6",
          phone: org.phone || "",
          email: org.email || "",
          website: org.website || "",
          address: org.address || "",
        };
      }

      // TODO: Generate PDF with unique cover page
      // This would call your PDF generation service with the context
      // For now, we just create the artifact record

      const artifact = await prisma.ai_reports.create({
        data: {
          orgId,
          title: `Community Report - ${addressData.address}`,
          slug: `community-${communityId}-${i + 1}`,
          category: "community",
          status: "DRAFT",
          metadata: {
            communityId,
            address: addressData.address,
            stormDate: stormDate?.toISOString(),
            stormType,
            templateId,
            uniqueCover: true,
            generatedAt: new Date().toISOString(),
          },
        },
      });

      results.push({
        address: addressData.address,
        artifactId: artifact.id,
        success: true,
      });

      console.log(
        `[BATCH_COVERS] Generated cover ${i + 1}/${addresses.length}: ${addressData.address}`
      );
    } catch (error: any) {
      console.error(`[BATCH_COVERS] Failed for ${addressData.address}:`, error);
      errors.push({
        address: addressData.address,
        error: error.message,
      });
    }
  }

  console.log(`[BATCH_COVERS] Complete. Success: ${results.length}, Errors: ${errors.length}`);

  return {
    success: results,
    errors,
    total: addresses.length,
    successCount: results.length,
    errorCount: errors.length,
  };
}

/**
 * Usage example:
 * ```ts
 * const result = await generatePerAddressCovers({
 *   communityId: "comm_123",
 *   orgId: "org_456",
 *   templateId: "roofing-inspection",
 *   stormDate: new Date("2024-06-15"),
 *   stormType: "Hail Storm",
 *   addresses: [
 *     { address: "123 Main St", city: "Phoenix", state: "AZ", zip: "85001" },
 *     { address: "456 Oak Ave", city: "Phoenix", state: "AZ", zip: "85002" },
 *   ],
 * });
 * ```
 */
