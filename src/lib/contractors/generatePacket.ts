/**
 * Auto-generate contractor packet on org creation
 * Triggered by org creation webhook/flow
 */

import prisma from "@/lib/prisma";

interface ContractorPacketOptions {
  orgId: string;
  orgName: string;
  logoUrl?: string | null;
  primaryColor?: string;
}

export async function generateContractorPacket({
  orgId,
  orgName,
  logoUrl,
  primaryColor = "#0ea5e9",
}: ContractorPacketOptions) {
  try {
    console.log(`[CONTRACTOR_PACKET] Generating packet for org: ${orgName}`);

    // Define contractor packet templates
    const packetTemplates = [
      {
        slug: "contractor-cover-page",
        title: `${orgName} - Contractor Information Packet`,
        category: "contractor",
        intendedUse: "contractor",
        description: "Professional cover page with company branding",
      },
      {
        slug: "contractor-w9",
        title: "W-9 Form - Tax Information",
        category: "contractor",
        intendedUse: "contractor",
        description: "IRS W-9 Request for Taxpayer Identification",
      },
      {
        slug: "contractor-license",
        title: "License & Certifications",
        category: "contractor",
        intendedUse: "contractor",
        description: "Contractor license documentation and certifications",
      },
      {
        slug: "contractor-insurance",
        title: "Insurance Coverage",
        category: "contractor",
        intendedUse: "contractor",
        description: "General liability and workers compensation insurance",
      },
    ];

    const createdArtifacts = [];

    for (const template of packetTemplates) {
      // Check if artifact already exists for this org
      const existing = await prisma.ai_reports.findFirst({
        where: {
          orgId,
          slug: template.slug,
        },
      });

      if (existing) {
        console.log(`[CONTRACTOR_PACKET] Artifact already exists: ${template.slug}`);
        continue;
      }

      // Create artifact placeholder
      const artifact = await prisma.ai_reports.create({
        data: {
          orgId,
          slug: template.slug,
          title: template.title,
          category: template.category,
          status: "DRAFT",
          metadata: {
            isContractorPacket: true,
            orgName,
            logoUrl,
            primaryColor,
            generatedAt: new Date().toISOString(),
          },
        },
      });

      createdArtifacts.push(artifact);
      console.log(`[CONTRACTOR_PACKET] Created artifact: ${template.title}`);
    }

    console.log(
      `[CONTRACTOR_PACKET] Packet generation complete. Created ${createdArtifacts.length} artifacts`
    );

    return {
      ok: true,
      artifacts: createdArtifacts,
      message: `Contractor packet created with ${createdArtifacts.length} documents`,
    };
  } catch (error: any) {
    console.error("[CONTRACTOR_PACKET] Generation failed:", error);
    return {
      ok: false,
      error: error.message,
    };
  }
}

/**
 * Hook into org creation flow
 * Call this from your org creation API/webhook
 *
 * Example usage:
 * ```ts
 * // In /api/organizations/create route
 * const org = await prisma.org.create({ ... });
 * await generateContractorPacket({
 *   orgId: org.id,
 *   orgName: org.name,
 *   logoUrl: org.logoUrl,
 *   primaryColor: org.brandColor,
 * });
 * ```
 */
