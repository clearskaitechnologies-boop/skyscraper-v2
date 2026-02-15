/**
 * Carrier Routing and Submission Requirements
 * Phase 18 - Carrier Integration
 */

export interface CarrierSubmissionRequirements {
  carrier: string;
  emailFormat?: string;
  requiresPortal?: boolean;
  portalUrl?: string;
  requiredDocuments: string[];
  emailSubjectFormat?: string;
  notes?: string;
}

/**
 * Get carrier-specific submission requirements
 */
export function getCarrierSubmissionRequirements(
  carrierName: string
): CarrierSubmissionRequirements {
  // Default requirements for all carriers
  const defaultRequirements: CarrierSubmissionRequirements = {
    carrier: carrierName,
    requiresPortal: false,
    requiredDocuments: [
      "estimate",
      "photos",
      "scope_of_work",
    ],
    emailSubjectFormat: "Supplement Request - {{claimNumber}}",
    notes: "Standard submission via email",
  };

  // Carrier-specific configurations
  const carrierConfigs: Record<string, Partial<CarrierSubmissionRequirements>> = {
    "State Farm": {
      requiresPortal: true,
      portalUrl: "https://www.statefarm.com/",
      requiredDocuments: ["estimate", "photos", "scope_of_work", "cover_letter"],
    },
    "Allstate": {
      emailFormat: "claims@allstate.com",
      requiredDocuments: ["estimate", "photos", "weather_report"],
    },
    "USAA": {
      requiresPortal: true,
      portalUrl: "https://www.usaa.com/",
      requiredDocuments: ["estimate", "photos", "scope_of_work", "depreciation_schedule"],
    },
    "Farmers": {
      emailFormat: "supplements@farmersinsurance.com",
      requiredDocuments: ["estimate", "photos"],
    },
  };

  const config = carrierConfigs[carrierName] || {};

  return {
    ...defaultRequirements,
    ...config,
    carrier: carrierName,
  };
}

/**
 * Validate submission package meets carrier requirements
 */
export function validateSubmissionPackage(
  carrier: string,
  documents: string[]
): { valid: boolean; missing: string[] } {
  const requirements = getCarrierSubmissionRequirements(carrier);
  const missing = requirements.requiredDocuments.filter(
    (doc) => !documents.includes(doc)
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Format email subject for carrier
 */
export function formatCarrierEmailSubject(
  carrier: string,
  claimNumber: string,
  supplementNumber?: string
): string {
  const requirements = getCarrierSubmissionRequirements(carrier);
  let subject = requirements.emailSubjectFormat || "Supplement Request - {{claimNumber}}";

  subject = subject.replace("{{claimNumber}}", claimNumber);
  if (supplementNumber) {
    subject = subject.replace("{{supplementNumber}}", supplementNumber);
  }

  return subject;
}
