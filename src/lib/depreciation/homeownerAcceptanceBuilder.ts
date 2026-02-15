// lib/depreciation/homeownerAcceptanceBuilder.ts
/**
 * 🔥 PHASE 13.4 - HOMEOWNER ACCEPTANCE BUILDER
 *
 * Generates homeowner completion acceptance with:
 * - Acknowledgment of completed work
 * - Satisfaction confirmation
 * - Authorization to release depreciation
 * - Digital signature
 */

import prisma from "@/lib/prisma";

export interface HomeownerAcceptance {
  homeowner: {
    name: string;
    address: string;
  };
  claim: {
    claimNumber: string;
    lossDate: string;
    completionDate: string;
  };
  contractor: {
    name: string;
    license?: string;
  };

  // Acceptance Statements
  workCompletionAcknowledgment: string;
  materialsConfirmation: string;
  satisfactionStatement: string;
  depreciationAuthorization: string;

  // Additional Confirmations
  cleanupConfirmation: string;
  warrantyAcknowledgment: string;

  // Signature
  signature: {
    signedBy: string;
    signedOn: string;
    signatureType: "DIGITAL" | "MANUAL";
    ipAddress?: string;
  };

  generatedDate: string;
}

export async function buildHomeownerAcceptance(
  claim_id: string,
  orgId: string,
  homeownerName?: string,
  signatureType: "DIGITAL" | "MANUAL" = "DIGITAL"
): Promise<HomeownerAcceptance> {
  console.log(`[Homeowner Acceptance Builder] Building for claim ${claimId}`);

  // Fetch claim data
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    include: {
      property: true,
    },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  // Fetch Org details
  const Org = await prisma.org.findUnique({
    where: { id: orgId },
  });

  const customerName = homeownerName || claim.insured_name || "Homeowner";
  const contractorName = Org?.name || "Contractor";
  const claimNumber = claim.claimNumber;
  const lossDate = claim.dateOfLoss?.toISOString().split("T")[0] || "";
  const completionDate = new Date().toISOString().split("T")[0];
  const address = claim.property
    ? `${claim.properties.street}, ${claim.properties.city}, ${claim.properties.state} ${claim.properties.zipCode}`
    : "";

  const acceptance: HomeownerAcceptance = {
    homeowner: {
      name: customerName,
      address,
    },
    claim: {
      claimNumber,
      lossDate,
      completionDate,
    },
    contractor: {
      name: contractorName,
      license: "",
    },
    workCompletionAcknowledgment: `I, ${customerName}, acknowledge that the roofing restoration work performed by ${contractorName} at the property located at ${address} has been completed as of ${completionDate}. The work includes tear-off of the existing roofing system, replacement of damaged materials, installation of new roofing materials, and final cleanup.`,
    materialsConfirmation: `I confirm that all materials used in the restoration are new, meet or exceed manufacturer specifications, and comply with local building code requirements. The contractor has provided documentation of materials used and manufacturer warranties.`,
    satisfactionStatement: `I am satisfied with the quality of work performed and confirm that all work has been completed to my satisfaction. The property has been left in clean condition with no debris remaining.`,
    depreciationAuthorization: `I hereby authorize the insurance carrier to release all recoverable depreciation associated with claim #${claimNumber} directly to ${contractorName}. This authorization is provided with full knowledge that the work has been completed per the scope of loss and applicable building codes.`,
    cleanupConfirmation: `I confirm that the contractor has completed all required cleanup, removed all debris, and left the property in excellent condition.`,
    warrantyAcknowledgment: `I acknowledge receipt of all manufacturer warranties and contractor workmanship warranty documentation.`,
    signature: {
      signedBy: customerName,
      signedOn: new Date().toISOString(),
      signatureType,
    },
    generatedDate: new Date().toISOString().split("T")[0],
  };

  console.log(
    `[Homeowner Acceptance Builder] Acceptance generated for ${customerName} - Claim ${claimNumber}`
  );

  return acceptance;
}
