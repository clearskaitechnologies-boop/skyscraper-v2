/**
 * Client Data Auto-Population
 *
 * Auto-fills report with client details from database.
 * Zero manual data entry.
 */

import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface ClientReportData {
  homeowner: {
    name: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  property: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    yearBuilt?: number;
    squareFootage?: number;
    stories?: number;
    roofSquares?: number;
  };
  claim: {
    claimNumber?: string;
    claimId: string;
    dateOfLoss?: Date;
    lossType: string;
    status: string;
    createdAt: Date;
  };
  adjuster?: {
    name: string;
    company: string;
    email?: string;
    phone?: string;
  };
  agent?: {
    name: string;
    company: string;
    email?: string;
    phone?: string;
  };
  carrier?: {
    name: string;
    policyNumber?: string;
  };
  organization: {
    name: string;
    phone?: string;
    email?: string;
    website?: string;
    licenseNumber?: string;
  };
}

/**
 * Fetch all client data for report
 */
export async function fetchClientReportData(
  claimId: string,
  orgId: string
): Promise<{ success: boolean; data?: ClientReportData; error?: string }> {
  try {
    // Fetch claim with all relations
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      include: {
        Property: true,
        ClaimContact: true,
        Organization: {
          include: {
            BrandingUpload: {
              take: 1,
              orderBy: { uploadedAt: "desc" },
            },
          },
        },
      },
    });

    if (!claim) {
      return { success: false, error: "Claim not found" };
    }

    if (claim.orgId !== orgId) {
      return { success: false, error: "Access denied" };
    }

    // Find homeowner contact
    const homeowner = claim.ClaimContact.find((c) => c.role === "HOMEOWNER");

    // Find adjuster contact
    const adjuster = claim.ClaimContact.find((c) => c.role === "ADJUSTER");

    // Find agent contact
    const agent = claim.ClaimContact.find((c) => c.role === "AGENT");

    // Assemble client data
    const clientData: ClientReportData = {
      homeowner: {
        name: homeowner ? `${homeowner.firstName} ${homeowner.lastName}` : "Homeowner",
        firstName: homeowner?.firstName || "Homeowner",
        lastName: homeowner?.lastName || "",
        email: homeowner?.email || undefined,
        phone: homeowner?.phone || undefined,
        address: claim.Property?.address || "",
        city: claim.Property?.city || "",
        state: claim.Property?.state || "",
        zipCode: claim.Property?.zipCode || "",
      },
      property: {
        address: claim.Property?.address || "",
        city: claim.Property?.city || "",
        state: claim.Property?.state || "",
        zipCode: claim.Property?.zipCode || "",
        yearBuilt: claim.Property?.yearBuilt || undefined,
        squareFootage: claim.Property?.squareFeet || undefined,
        stories: claim.Property?.stories || undefined,
        roofSquares: claim.Property?.roofSquares || undefined,
      },
      claim: {
        claimNumber: claim.claimNumber || undefined,
        claimId: claim.id,
        dateOfLoss: claim.dateOfLoss || undefined,
        lossType: claim.lossType,
        status: claim.status,
        createdAt: claim.createdAt,
      },
      adjuster: adjuster
        ? {
            name: `${adjuster.firstName} ${adjuster.lastName}`,
            company: adjuster.company || "Insurance Company",
            email: adjuster.email || undefined,
            phone: adjuster.phone || undefined,
          }
        : undefined,
      agent: agent
        ? {
            name: `${agent.firstName} ${agent.lastName}`,
            company: agent.company || "Insurance Agency",
            email: agent.email || undefined,
            phone: agent.phone || undefined,
          }
        : undefined,
      carrier: claim.carrier
        ? {
            name: claim.carrier,
            policyNumber: claim.policyNumber || undefined,
          }
        : undefined,
      organization: {
        name: claim.Organization.name,
        phone: claim.Organization.phone || undefined,
        email: claim.Organization.email || undefined,
        website: claim.Organization.website || undefined,
        licenseNumber: claim.Organization.licenseNumber || undefined,
      },
    };

    return { success: true, data: clientData };
  } catch (error) {
    logger.error("[Client Data] Failed to fetch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Format client data for PDF header
 */
export function formatClientDataForPDF(data: ClientReportData): any {
  return {
    homeowner: {
      name: data.homeowner.name,
      address: `${data.homeowner.address}, ${data.homeowner.city}, ${data.homeowner.state} ${data.homeowner.zipCode}`,
      contact: [data.homeowner.email, data.homeowner.phone].filter(Boolean).join(" • "),
    },
    claim: {
      number: data.claim.claimNumber || data.claim.claimId,
      dateOfLoss: data.claim.dateOfLoss?.toLocaleDateString() || "N/A",
      type: data.claim.lossType,
      status: data.claim.status,
    },
    property: {
      address: `${data.property.address}, ${data.property.city}, ${data.property.state} ${data.property.zipCode}`,
      details: [
        data.property.yearBuilt ? `Built ${data.property.yearBuilt}` : null,
        data.property.stories ? `${data.property.stories} stories` : null,
        data.property.squareFootage
          ? `${data.property.squareFootage.toLocaleString()} sq ft`
          : null,
      ]
        .filter(Boolean)
        .join(" • "),
    },
    contacts: {
      adjuster: data.adjuster
        ? {
            name: data.adjuster.name,
            company: data.adjuster.company,
            contact: [data.adjuster.email, data.adjuster.phone].filter(Boolean).join(" • "),
          }
        : undefined,
      agent: data.agent
        ? {
            name: data.agent.name,
            company: data.agent.company,
            contact: [data.agent.email, data.agent.phone].filter(Boolean).join(" • "),
          }
        : undefined,
    },
    carrier: data.carrier
      ? {
          name: data.carrier.name,
          policy: data.carrier.policyNumber,
        }
      : undefined,
    company: {
      name: data.organization.name,
      contact: [data.organization.phone, data.organization.email, data.organization.website]
        .filter(Boolean)
        .join(" • "),
      license: data.organization.licenseNumber,
    },
  };
}

/**
 * Generate client data summary
 */
export function generateClientDataSummary(data: ClientReportData): string {
  const lines: string[] = [];

  lines.push("CLIENT & CLAIM INFORMATION");
  lines.push("═".repeat(60));
  lines.push("");

  // Homeowner
  lines.push("HOMEOWNER:");
  lines.push(`  ${data.homeowner.name}`);
  lines.push(`  ${data.homeowner.address}`);
  lines.push(`  ${data.homeowner.city}, ${data.homeowner.state} ${data.homeowner.zipCode}`);
  if (data.homeowner.email || data.homeowner.phone) {
    lines.push(`  ${[data.homeowner.email, data.homeowner.phone].filter(Boolean).join(" • ")}`);
  }
  lines.push("");

  // Claim
  lines.push("CLAIM DETAILS:");
  lines.push(`  Claim Number: ${data.claim.claimNumber || data.claim.claimId}`);
  lines.push(`  Date of Loss: ${data.claim.dateOfLoss?.toLocaleDateString() || "Not specified"}`);
  lines.push(`  Loss Type: ${data.claim.lossType}`);
  lines.push(`  Status: ${data.claim.status}`);
  lines.push("");

  // Property
  lines.push("PROPERTY:");
  lines.push(`  ${data.property.address}`);
  lines.push(`  ${data.property.city}, ${data.property.state} ${data.property.zipCode}`);
  if (data.property.yearBuilt) {
    lines.push(`  Year Built: ${data.property.yearBuilt}`);
  }
  if (data.property.stories) {
    lines.push(`  Stories: ${data.property.stories}`);
  }
  if (data.property.squareFootage) {
    lines.push(`  Square Footage: ${data.property.squareFootage.toLocaleString()}`);
  }
  lines.push("");

  // Adjuster
  if (data.adjuster) {
    lines.push("ADJUSTER:");
    lines.push(`  ${data.adjuster.name}`);
    lines.push(`  ${data.adjuster.company}`);
    if (data.adjuster.email || data.adjuster.phone) {
      lines.push(`  ${[data.adjuster.email, data.adjuster.phone].filter(Boolean).join(" • ")}`);
    }
    lines.push("");
  }

  // Carrier
  if (data.carrier) {
    lines.push("INSURANCE CARRIER:");
    lines.push(`  ${data.carrier.name}`);
    if (data.carrier.policyNumber) {
      lines.push(`  Policy: ${data.carrier.policyNumber}`);
    }
    lines.push("");
  }

  // Company
  lines.push("PREPARED BY:");
  lines.push(`  ${data.organization.name}`);
  if (data.organization.licenseNumber) {
    lines.push(`  License: ${data.organization.licenseNumber}`);
  }
  if (data.organization.phone || data.organization.email || data.organization.website) {
    lines.push(
      `  ${[data.organization.phone, data.organization.email, data.organization.website].filter(Boolean).join(" • ")}`
    );
  }

  return lines.join("\n");
}
