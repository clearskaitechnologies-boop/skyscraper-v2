/**
 * PHASE 13.5 — CARRIER GATEWAY
 * Universal Carrier Routing & Delivery Engine
 *
 * This module:
 * - Detects insurance carriers from claims
 * - Routes documents to correct carriers inbox
 * - Auto-generates subject lines and body content
 * - Tracks delivery status
 * - Handles carriers-specific rules
 */

import prisma from "@/lib/prisma";

// Prisma singleton imported from @/lib/db/prisma

// ============================================
// TYPES & INTERFACES
// ============================================

export interface CarrierDetectionResult {
  carrierId: string | null;
  carrierName: string | null;
  carrierSlug: string | null;
  confidence: number; // 0-100
  detectionMethod: "claim_metadata" | "email_domain" | "policy_pattern" | "manual" | "unknown";
  suggestedInbox: string | null;
}

export interface DeliveryOptions {
  deliveryType:
    | "depreciation"
    | "supplement"
    | "inspection"
    | "report"
    | "invoice"
    | "weather"
    | "full_packet";
  recipientEmail?: string;
  recipientName?: string;
  ccEmails?: string[];
  attachments?: {
    filename: string;
    url: string;
    size: number;
    type: string;
  }[];
  customSubject?: string;
  customBody?: string;
  metadata?: Record<string, any>;
}

export interface CarrierDeliveryResult {
  success: boolean;
  deliveryId: string | null;
  status: string;
  sentAt?: Date;
  error?: string;
  trackingUrl?: string;
}

// ============================================
// CARRIER DETECTION ENGINE
// ============================================

/**
 * Detects carriers from claim data
 * Uses multiple detection methods and returns confidence score
 */
export async function detectCarrier(
  claim_id: string,
  orgId: string
): Promise<CarrierDetectionResult> {
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    include: {
      property: true,
    },
  });

  if (!claim) {
    return {
      carrierId: null,
      carrierName: null,
      carrierSlug: null,
      confidence: 0,
      detectionMethod: "unknown",
      suggestedInbox: null,
    };
  }

  // Method 1: Check if carriers is stored directly on claim
  if (claim.carriers) {
    const carriers = await findCarrierByName(claim.carriers);
    if (carriers) {
      return {
        carrierId: carriers.id,
        carrierName: carriers.name,
        carrierSlug: carriers.slug,
        confidence: 100,
        detectionMethod: "claim_metadata",
        suggestedInbox: carriers.defaultInbox,
      };
    }
  }

  // Method 2: Extract from adjuster email domain
  if (claim.adjusterEmail) {
    const domain = extractDomain(claim.adjusterEmail);
    const carriers = await findCarrierByEmailDomain(domain);
    if (carriers) {
      return {
        carrierId: carriers.id,
        carrierName: carriers.name,
        carrierSlug: carriers.slug,
        confidence: 90,
        detectionMethod: "email_domain",
        suggestedInbox: carriers.defaultInbox,
      };
    }
  }

  // Method 3: Pattern match policy number
  if (claim.policyNumber) {
    const carriers = await findCarrierByPolicyPattern(claim.policyNumber);
    if (carriers) {
      return {
        carrierId: carriers.id,
        carrierName: carriers.name,
        carrierSlug: carriers.slug,
        confidence: 75,
        detectionMethod: "policy_pattern",
        suggestedInbox: carriers.defaultInbox,
      };
    }
  }

  // No carriers detected
  return {
    carrierId: null,
    carrierName: claim.carriers || null,
    carrierSlug: null,
    confidence: 0,
    detectionMethod: "unknown",
    suggestedInbox: null,
  };
}

// ============================================
// CARRIER ROUTING ENGINE
// ============================================

/**
 * Routes delivery to correct carriers inbox based on delivery type
 */
export async function routeToCarrier(
  claim_id: string,
  orgId: string,
  deliveryType: DeliveryOptions["deliveryType"]
): Promise<{
  recipientEmail: string;
  recipientName: string;
  carrierName: string;
}> {
  const detection = await detectCarrier(claimId, orgId);

  if (!detection.carrierId) {
    // Fallback: use adjuster email from claim
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
      select: { adjusterEmail: true, adjusterName: true, carriers: true },
    });

    return {
      recipientEmail: claim?.adjusterEmail || "",
      recipientName: claim?.adjusterName || "Claims Department",
      carrierName: claim?.carriers || "Insurance Carrier",
    };
  }

  // Get carriers record
  const carriers = await prisma.carriers.findUnique({
    where: { id: detection.carrierId },
  });

  if (!carriers) {
    throw new Error("Carrier not found");
  }

  // Route based on delivery type
  let inbox = carriers.defaultInbox;

  switch (deliveryType) {
    case "supplement":
      inbox = carriers.supplementInbox || carriers.defaultInbox;
      break;
    case "depreciation":
      inbox = carriers.depreciationInbox || carriers.defaultInbox;
      break;
    case "inspection":
      inbox = carriers.inspectionInbox || carriers.defaultInbox;
      break;
    default:
      inbox = carriers.defaultInbox;
  }

  return {
    recipientEmail: inbox,
    recipientName: `${carriers.name} Claims Department`,
    carrierName: carriers.name,
  };
}

// ============================================
// SUBJECT LINE GENERATOR
// ============================================

/**
 * Generates carriers-ready subject line
 */
export async function generateSubjectLine(
  claim_id: string,
  orgId: string,
  deliveryType: DeliveryOptions["deliveryType"]
): Promise<string> {
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    select: {
      claimNumber: true,
      carriers: true,
      property: { select: { street: true } },
    },
  });

  if (!claim) {
    return "Claims Documentation";
  }

  const carrierName = claim.carriers?.toUpperCase() || "INSURANCE CARRIER";
  const claimNum = claim.claimNumber || "N/A";

  const typeLabels = {
    depreciation: "Final Invoice & Depreciation Release",
    supplement: "Supplement Request",
    inspection: "Inspection Report",
    report: "Claims Report",
    invoice: "Final Invoice",
    weather: "Weather Verification",
    full_packet: "Complete Claims Package",
  };

  const typeLabel = typeLabels[deliveryType] || "Claims Documentation";

  return `${carrierName} | Claim #${claimNum} | ${typeLabel}`;
}

// ============================================
// EMAIL BODY GENERATOR
// ============================================

/**
 * Generates professional email body content
 */
export async function generateEmailBody(
  claim_id: string,
  orgId: string,
  deliveryType: DeliveryOptions["deliveryType"],
  attachmentCount: number = 0
): Promise<string> {
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    include: {
      property: true,
    },
  });

  if (!claim) {
    return "Please see attached claims documentation.";
  }

  const Org = await prisma.org.findUnique({ where: { id: orgId } });
  const orgName = Org?.name || "Contractor";
  const adjusterName = claim.adjusterName || "Claims Adjuster";
  const address = claim.properties?.street || "Property Address";
  const claimNum = claim.claimNumber || "N/A";

  const templates = {
    depreciation: `Dear ${adjusterName},

Please find attached the Final Invoice and Depreciation Release Package for:

**Claim #${claimNum}**
**Property:** ${address}

This package includes:
✓ Final Invoice with itemized line items
✓ Contractor Completion Statement
✓ Homeowner Acceptance & Depreciation Authorization
✓ Supplemental documentation
✓ Photo appendix
✓ Weather verification

All work has been completed in accordance with manufacturer specifications and local building codes. The homeowner has signed the depreciation release authorization.

Please process the depreciation payment at your earliest convenience.

Best regards,
${orgName}`,

    supplement: `Dear ${adjusterName},

Please review the attached Supplement Request for:

**Claim #${claimNum}**
**Property:** ${address}

The supplement includes:
✓ Itemized list of additional scope items
✓ Justification for each line item
✓ Code citations and requirements
✓ Photographic evidence
✓ Timeline documentation

All items were discovered during the course of work and are necessary for proper completion per code requirements.

Please review and approve at your earliest convenience.

Best regards,
${orgName}`,

    inspection: `Dear ${adjusterName},

Please find attached the Inspection Report for:

**Claim #${claimNum}**
**Property:** ${address}

This comprehensive report includes damage assessment, code requirements, and photographic documentation.

Best regards,
${orgName}`,

    report: `Dear ${adjusterName},

Please see attached documentation for Claim #${claimNum} at ${address}.

Included: ${attachmentCount} document(s)

Best regards,
${orgName}`,

    invoice: `Dear ${adjusterName},

Please find attached the Final Invoice for Claim #${claimNum} at ${address}.

All work has been completed per scope of work.

Best regards,
${orgName}`,

    weather: `Dear ${adjusterName},

Please find attached Weather Verification Report for Claim #${claimNum}.

This report confirms the storm event and damage causation.

Best regards,
${orgName}`,

    full_packet: `Dear ${adjusterName},

Please find attached the Complete Claims Package for:

**Claim #${claimNum}**
**Property:** ${address}

This package includes all documentation necessary for claim processing and settlement.

Best regards,
${orgName}`,
  };

  return templates[deliveryType] || templates.report;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractDomain(email: string): string {
  const parts = email.toLowerCase().split("@");
  return parts[1] || "";
}

async function findCarrierByName(name: string): Promise<any> {
  const normalized = name.toLowerCase().trim();
  return prisma.carriers.findFirst({
    where: {
      OR: [
        { name: { contains: normalized, mode: "insensitive" } },
        { slug: normalized.replace(/\s+/g, "") },
      ],
      isActive: true,
    },
  });
}

async function findCarrierByEmailDomain(domain: string): Promise<any> {
  const carriers = await prisma.carriers.findMany({
    where: { isActive: true },
  });

  for (const carriers of carriers) {
    const domains = (carriers.emailDomains as string[]) || [];
    if (domains.some((d) => domain.includes(d.toLowerCase()))) {
      return carriers;
    }
  }

  return null;
}

async function findCarrierByPolicyPattern(policyNumber: string): Promise<any> {
  const carriers = await prisma.carriers.findMany({
    where: { isActive: true },
  });

  for (const carriers of carriers) {
    const patterns = (carriers.policyPatterns as string[]) || [];
    for (const pattern of patterns) {
      try {
        const regex = new RegExp(pattern, "i");
        if (regex.test(policyNumber)) {
          return carriers;
        }
      } catch (e) {
        // Invalid regex pattern, skip
        continue;
      }
    }
  }

  return null;
}

// ============================================
// CARRIER DATABASE SEEDERS
// ============================================

/**
 * Seeds common carriers into database
 * Run once during setup
 */
export async function seedCommonCarriers() {
  const carriers = [
    {
      name: "State Farm",
      slug: "statefarm",
      defaultInbox: "claims@statefarm.com",
      supplementInbox: "supplemental@statefarm.com",
      depreciationInbox: "depreciation@statefarm.com",
      emailDomains: ["statefarm.com", "sf.com"],
      policyPatterns: ["^[0-9]{2}-[A-Z]{2,3}-[0-9]{4}$"],
    },
    {
      name: "Allstate",
      slug: "allstate",
      defaultInbox: "claims@allstate.com",
      supplementInbox: "supplements@allstate.com",
      depreciationInbox: "depreciation@allstate.com",
      emailDomains: ["allstate.com"],
      policyPatterns: ["^[0-9]{6}-[A-Z]{2}$"],
    },
    {
      name: "USAA",
      slug: "usaa",
      defaultInbox: "claims@usaa.com",
      emailDomains: ["usaa.com"],
      portalSupportsApi: true,
      apiEndpoint: "https://api.usaa.com/claims",
    },
    {
      name: "Farmers",
      slug: "farmers",
      defaultInbox: "claims@farmersinsurance.com",
      emailDomains: ["farmersinsurance.com", "farmers.com"],
    },
    {
      name: "Liberty Mutual",
      slug: "libertymutual",
      defaultInbox: "claims@libertymutual.com",
      emailDomains: ["libertymutual.com"],
    },
    {
      name: "Travelers",
      slug: "travelers",
      defaultInbox: "claims@travelers.com",
      emailDomains: ["travelers.com"],
    },
    {
      name: "Nationwide",
      slug: "nationwide",
      defaultInbox: "claims@nationwide.com",
      emailDomains: ["nationwide.com"],
    },
  ];

  for (const carriers of carriers) {
    await prisma.carriers.upsert({
      where: { slug: carriers.slug },
      update: carriers,
      create: carriers,
    });
  }

  console.log("✅ Seeded common carriers");
}
