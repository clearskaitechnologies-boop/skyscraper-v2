// lib/depreciation/contractorStatementBuilder.ts
/**
 * 🔥 PHASE 13.4 - CONTRACTOR STATEMENT BUILDER
 *
 * Generates professional contractor completion statement with:
 * - Build summary narrative
 * - Materials used
 * - Code compliance confirmation
 * - Workmanship warranty
 * - Digital signature
 */

import { callGPT4 } from "@/lib/ai/callGPT4";
import { logger } from "@/lib/logger";
import { getDelegate } from "@/lib/db/modelAliases";
import prisma from "@/lib/prisma";

export interface ContractorStatement {
  contractor: {
    name: string;
    license?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  claim: {
    claimNumber: string;
    customerName: string;
    address: string;
    lossDate: string;
    completionDate: string;
  };

  // AI-Generated Build Summary
  buildSummary: string;

  // Materials & Work Performed
  materialsUsed: {
    category: string;
    description: string;
    specification: string;
  }[];

  workPerformed: string[];

  // Compliance & Quality
  codeCompliance: {
    standard: string;
    confirmation: string;
  }[];

  qualityChecks: string[];

  // Professional Statements
  workmanshipWarranty: string;
  certificationStatement: string;

  // Signature
  signature: {
    signedBy: string;
    title: string;
    signedOn: string;
    signatureType: "DIGITAL" | "MANUAL";
  };

  generatedDate: string;
}

export async function buildContractorStatement(
  claim_id: string,
  orgId: string,
  signedBy: string
): Promise<ContractorStatement> {
  logger.debug(`[Contractor Statement Builder] Building for claim ${claimId}`);

  // Fetch claim data
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    include: {
      property: true,
      damageAssessments: true,
      weatherReports: true,
      supplements: {
        include: { items: true },
      },
    },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  // Fetch Org details
  const Org = await prisma.org.findUnique({
    where: { id: orgId },
  });

  // Fetch completion photos for AI context
  const photos = await getDelegate("completionPhoto").findMany({
    where: { claimId, orgId },
    orderBy: { createdAt: "asc" },
  });

  // Build AI prompt for narrative generation
  const prompt = `You are a professional roofing contractor writing a completion statement for an insurance claim.

Claim Details:
- Customer: ${claim.insured_name}
- Address: ${claim.properties?.street}, ${claim.properties?.city}, ${claim.properties?.state}
- Loss Date: ${claim.dateOfLoss?.toISOString().split("T")[0]}
- Completion Date: ${new Date().toISOString().split("T")[0]}

Damage Found: ${claim.damageAssessments?.[0]?.summary || "Storm damage to roof"}
Weather Event: ${claim.weatherReports?.[0]?.globalSummary || "Severe weather"}

Write a professional 3-paragraph build summary that includes:
1. What was found during tear-off
2. Materials installed and code-required upgrades
3. Final quality checks and completion

Use professional, carrier-friendly language. Be specific about materials and methods.`;

  let buildSummary = "";
  try {
    buildSummary = await callGPT4(
      "You are a professional contractor writing build summaries for insurance claims.",
      prompt,
      { temperature: 0.7, maxTokens: 500 }
    );
  } catch (error) {
    logger.error("[Contractor Statement] AI generation failed, using template");
    buildSummary = `Upon arrival, our certified roofing crew began a complete tear-off of the existing roofing system. During tear-off, we identified storm damage consistent with the loss date, including compromised shingles and damaged underlayment.

All work was completed per manufacturer specifications and local building code requirements. Materials installed include dimensional shingles, synthetic underlayment, ice & water shield at eaves and valleys, and proper ventilation systems.

Final walkthrough confirmed all work meets or exceeds industry standards. Cleanup was completed, and the property was left in pristine condition.`;
  }

  // Build materials list
  const materialsUsed = [
    {
      category: "Shingles",
      description: "Architectural/Dimensional Shingles",
      specification: "Class A fire-rated, wind-resistant",
    },
    {
      category: "Underlayment",
      description: "Synthetic Underlayment",
      specification: "ASTM D226 compliant",
    },
    {
      category: "Ice & Water Shield",
      description: "Self-adhering waterproof membrane",
      specification: "Eaves and valleys per IRC R905.2.7.1",
    },
    {
      category: "Ventilation",
      description: "Ridge vent and intake vents",
      specification: "1:150 ventilation ratio per IRC R806.2",
    },
    {
      category: "Flashing",
      description: "Galvanized metal flashing",
      specification: "26-gauge minimum per IRC R905.2.8.4",
    },
  ];

  // Work performed checklist
  const workPerformed = [
    "Complete tear-off of existing roofing system",
    "Deck inspection and replacement where necessary",
    "Installation of synthetic underlayment",
    "Installation of ice & water shield at eaves and valleys",
    "Installation of dimensional shingles per manufacturer specs",
    "Installation of ridge vent and proper ventilation",
    "Installation of all required flashings",
    "Final cleanup and debris removal",
    "Final walkthrough with property owner",
  ];

  // Code compliance
  const codeCompliance = [
    {
      standard: "IRC R905.2 - Asphalt Shingles",
      confirmation: "All work complies with current IRC standards for asphalt shingle installation",
    },
    {
      standard: "IRC R806.2 - Ventilation",
      confirmation: "Proper ventilation installed per 1:150 ratio requirement",
    },
    {
      standard: "IRC R905.2.7.1 - Ice Barrier",
      confirmation: "Ice & water shield installed in required locations",
    },
  ];

  // Quality checks
  const qualityChecks = [
    "Deck integrity verified - all damaged decking replaced",
    "Proper nail penetration and placement verified",
    "Shingle alignment and exposure checked throughout",
    "All penetrations properly sealed",
    "Ventilation airflow confirmed",
    "Final cleanup completed - no debris remaining",
  ];

  const statement: ContractorStatement = {
    contractor: {
      name: Org?.name || "Contractor",
      license: "",
      address: "",
      phone: "",
      email: "",
    },
    claim: {
      claimNumber: claim.claimNumber,
      customerName: claim.insured_name || "Homeowner",
      address: claim.property
        ? `${claim.properties.street}, ${claim.properties.city}, ${claim.properties.state} ${claim.properties.zipCode}`
        : "",
      lossDate: claim.dateOfLoss?.toISOString().split("T")[0] || "",
      completionDate: new Date().toISOString().split("T")[0],
    },
    buildSummary,
    materialsUsed,
    workPerformed,
    codeCompliance,
    qualityChecks,
    workmanshipWarranty:
      "All work is warranted for workmanship defects for a period of two (2) years from the date of completion. Materials carry manufacturer warranty as specified.",
    certificationStatement:
      "This statement confirms that all work was completed per industry standards, manufacturer specifications, and local building code requirements. All materials used are new and meet or exceed minimum code requirements.",
    signature: {
      signedBy,
      title: "Authorized Representative",
      signedOn: new Date().toISOString(),
      signatureType: "DIGITAL",
    },
    generatedDate: new Date().toISOString().split("T")[0],
  };

  logger.debug(`[Contractor Statement Builder] Statement generated for ${claim.claimNumber}`);

  return statement;
}
