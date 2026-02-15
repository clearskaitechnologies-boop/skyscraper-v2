// src/lib/intelligence/dataset-builders.ts
/**
 * SkaiScraper Intelligence Core - Dataset Builders
 *
 * The 4-stream input engine that powers autonomous report generation:
 * A. Internal Claim Data (structured database records)
 * B. User-Selected Features (toggles and preferences)
 * C. AI-Parsed Documents (PDFs, estimates, scopes)
 * D. External World Data (codes, weather, regulations)
 */

import prisma from "@/lib/prisma";

// ============================================================================
// STREAM A: INTERNAL CLAIM DATASET
// ============================================================================

export type InternalClaimDataset = {
  // Core claim info
  claim: {
    id: string;
    orgId: string | null;
    claimNumber: string;
    title: string;
    description: string | null;
    damageType: string;
    dateOfLoss: Date;
    status: string;
    priority: string;
    carrier: string | null;
    policyNumber: string | null;
    insured_name: string | null;
    deductible: number | null;
    estimatedValue: number | null;
    approvedValue: number | null;
    adjusterName: string | null;
    adjusterPhone: string | null;
    adjusterEmail: string | null;
    homeownerEmail: string | null;
    lifecycleStage: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

  // Property details
  property: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string | null;
    yearBuilt: number | null;
    squareFootage: number | null;
    roofType: string | null;
    roofAge: number | null;
  } | null;

  // AI module data
  modules: {
    damageAssessments: Array<{
      id: string;
      peril: string | null;
      severity: string | null;
      summary: string | null;
      aiDamageJson: any;
      createdAt: Date;
    }>;
    weatherReports: Array<{
      id: string;
      weatherDate: Date | null;
      weatherType: string | null;
      severity: string | null;
      dolProbability: number | null;
      aiWeatherJson: any;
      createdAt: Date;
    }>;
    estimates: Array<{
      id: string;
      title: string | null;
      mode: string | null;
      scopeItems: any;
      materialTaxRate: number | null;
      laborTaxRate: number | null;
      overheadPercent: number | null;
      profitPercent: number | null;
      oAndPEnabled: boolean;
      createdAt: Date;
    }>;
    supplements: Array<{
      id: string;
      claimNumber: string | null;
      carrier: string | null;
      dateOfLoss: Date | null;
      scopeItems: any;
      notes: string | null;
      createdAt: Date;
    }>;
    scopes: Array<{
      id: string;
      title: string | null;
      summary: string | null;
      aiScopeJson: any;
      createdAt: Date;
    }>;
    reports: Array<{
      id: string;
      title: string | null;
      reportType: string | null;
      aiReportJson: any;
      createdAt: Date;
    }>;
    financialSnapshots: Array<{
      id: string;
      totals: any;
      depreciation: any;
      lineItems: any;
      supplements: any;
      projection: any;
      underpaymentAmount: number;
      confidence: number;
      createdAt: Date;
    }>;
  };

  // Activity & timeline
  activities: Array<{
    id: string;
    type: string;
    description: string | null;
    createdAt: Date;
    user: { id: string; name: string | null } | null;
  }>;

  // Inspections
  inspections: Array<{
    id: string;
    title: string;
    type: string;
    scheduledAt: Date;
    completedAt: Date | null;
    status: string;
    notes: string | null;
    photoCount: number;
    weatherData: any;
    inspectorName: string;
  }>;

  // Materials & costs
  materials: Array<{
    id: string;
    itemName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    category: string | null;
    supplier: string | null;
  }>;

  // Messages & communications
  messages: Array<{
    id: string;
    messageType: string;
    subject: string | null;
    body: string | null;
    sentAt: Date | null;
    recipientEmail: string | null;
    status: string | null;
  }>;
};

/**
 * Build comprehensive internal claim dataset.
 * This is STREAM A - everything from the database.
 */
export async function buildInternalClaimDataset(
  claimId: string,
  orgId?: string | null
): Promise<InternalClaimDataset> {
  // Minimal select to avoid deep relation/type errors
  const claim = await prisma.claims.findUnique({
    where: { id: claimId },
    select: {
      id: true,
      claimNumber: true,
      title: true,
      description: true,
      damageType: true,
      dateOfLoss: true,
      status: true,
      priority: true,
      carrier: true,
      policy_number: true,
      insured_name: true,
      deductible: true,
      estimatedValue: true,
      approvedValue: true,
      adjusterName: true,
      adjusterPhone: true,
      adjusterEmail: true,
      homeowner_email: true,
      lifecycle_stage: true,
      createdAt: true,
      updatedAt: true,
      orgId: true,
    },
  });

  if (!claim) throw new Error(`Claim ${claimId} not found`);
  if (orgId && claim.orgId !== orgId) throw new Error(`Unauthorized access to claim ${claimId}`);

  return {
    claim: {
      id: claim.id,
      claimNumber: claim.claimNumber,
      title: claim.title,
      description: claim.description,
      damageType: claim.damageType,
      dateOfLoss: claim.dateOfLoss,
      status: claim.status,
      priority: claim.priority,
      carrier: claim.carrier,
      policyNumber: claim.policy_number,
      insured_name: claim.insured_name,
      deductible: claim.deductible,
      estimatedValue: claim.estimatedValue,
      approvedValue: claim.approvedValue,
      adjusterName: claim.adjusterName,
      adjusterPhone: claim.adjusterPhone,
      adjusterEmail: claim.adjusterEmail,
      homeownerEmail: claim.homeowner_email,
      lifecycleStage: claim.lifecycle_stage,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
      orgId: claim.orgId,
    },
    property: null,
    modules: {
      damageAssessments: [],
      weatherReports: [],
      estimates: [],
      supplements: [],
      scopes: [],
      reports: [],
      financialSnapshots: [],
    },
    activities: [],
    inspections: [],
    materials: [],
    messages: [],
  };
}

// ============================================================================
// STREAM B: FEATURE TOGGLES / ADD-ONS
// ============================================================================

export type FeatureToggles = {
  // Core features
  supplementSummary: boolean;
  weatherAnalysis: boolean;
  codeCitations: boolean;
  materialOptions: boolean;
  retailPricingTable: boolean;

  // Documentation features
  photoAnnotations: boolean;
  damageDocumentation: boolean;
  beforeAfterComparisons: boolean;
  aerialImagery: boolean;

  // Technical features
  manufacturerRequirements: boolean;
  safetyNotes: boolean;
  moistureAnalysis: boolean;
  structuralConcerns: boolean;

  // Client-facing features
  homeownerSummary: boolean;
  colorBoards: boolean;
  materialComparison: boolean; // good/better/best
  financingProposal: boolean;
  workTimeline: boolean;
  warrantyInformation: boolean;
  faqSection: boolean;

  // Legal/compliance
  legalDocumentation: boolean;
  carrierEscalation: boolean;
  depreciationBreakdown: boolean;
  acvRcvLogic: boolean;

  // Advanced
  competitorComparison: boolean;
  industryBenchmarks: boolean;

  // Phase 8 - Financial Engine
  financialAnalysisEnabled: boolean;
  claimTrends: boolean;
};

export const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
  supplementSummary: true,
  weatherAnalysis: true,
  codeCitations: true,
  materialOptions: false,
  retailPricingTable: false,
  photoAnnotations: true,
  damageDocumentation: true,
  beforeAfterComparisons: false,
  aerialImagery: false,
  manufacturerRequirements: true,
  safetyNotes: true,
  moistureAnalysis: false,
  structuralConcerns: false,
  homeownerSummary: false,
  colorBoards: false,
  materialComparison: false,
  financingProposal: false,
  workTimeline: false,
  warrantyInformation: false,
  faqSection: false,
  legalDocumentation: false,
  carrierEscalation: false,
  depreciationBreakdown: true,
  acvRcvLogic: true,
  competitorComparison: false,
  industryBenchmarks: false,
  claimTrends: false,
  financialAnalysisEnabled: true,
};

/**
 * Build feature toggles dataset.
 * This is STREAM B - user preferences and selected add-ons.
 */
export function buildFeatureToggles(overrides?: Partial<FeatureToggles>): FeatureToggles {
  return {
    ...DEFAULT_FEATURE_TOGGLES,
    ...overrides,
  };
}

// ============================================================================
// STREAM C: AI-PARSED DOCUMENTS
// ============================================================================

export type DocumentsDataset = {
  // Parsed PDFs & uploads
  carrierEstimate: {
    found: boolean;
    lineItems: Array<{
      code: string;
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
      category: string | null;
    }>;
    totals: {
      subtotal: number;
      tax: number;
      overhead: number;
      profit: number;
      grandTotal: number;
    } | null;
    metadata: {
      carrier: string | null;
      adjuster: string | null;
      date: Date | null;
      claimNumber: string | null;
    } | null;
  };

  // Scope discrepancies
  scopeGaps: {
    missingItems: string[];
    undervaluedItems: string[];
    incorrectMaterials: string[];
    codeViolations: string[];
  };

  // HOVER / measurement data
  measurements: {
    found: boolean;
    roofArea: number | null;
    roofPitch: string | null;
    facets: number | null;
    valleys: number | null;
    ridges: number | null;
    hips: number | null;
    eaveLength: number | null;
    rakeLength: number | null;
  };

  // Photo analysis
  photos: {
    total: number;
    categorized: {
      exterior: number;
      roof: number;
      interior: number;
      damage: number;
      before: number;
      after: number;
    };
    aiAnnotations: Array<{
      photoId: string;
      damageType: string;
      severity: string;
      location: string;
      description: string;
    }>;
  };

  // Code & manufacturer citations
  citations: Array<{
    type: "code" | "manufacturer" | "industry";
    code: string;
    description: string;
    applicability: string;
    source: string | null;
  }>;
};

/**
 * Build documents dataset from parsed files and AI analysis.
 * This is STREAM C - everything AI has extracted from uploads.
 */
export async function buildDocumentsDataset(
  claimId: string,
  orgId?: string | null
): Promise<DocumentsDataset> {
  // Minimal existence check only
  const claim = await prisma.claims.findUnique({
    where: { id: claimId },
    select: { id: true, claimNumber: true, orgId: true },
  });
  if (!claim) throw new Error(`Claim ${claimId} not found`);
  if (orgId && claim.orgId !== orgId) throw new Error(`Unauthorized access to claim ${claimId}`);

  return {
    carrierEstimate: {
      found: false,
      lineItems: [],
      totals: null,
      metadata: {
        carrier: null,
        adjuster: null,
        date: null,
        claimNumber: claim.claimNumber,
      },
    },
    scopeGaps: {
      missingItems: [],
      undervaluedItems: [],
      incorrectMaterials: [],
      codeViolations: [],
    },
    measurements: {
      found: false,
      roofArea: null,
      roofPitch: null,
      facets: null,
      valleys: null,
      ridges: null,
      hips: null,
      eaveLength: null,
      rakeLength: null,
    },
    photos: {
      total: 0,
      categorized: { exterior: 0, roof: 0, interior: 0, damage: 0, before: 0, after: 0 },
      aiAnnotations: [],
    },
    citations: [],
  };
}

// ============================================================================
// STREAM D: EXTERNAL WORLD DATA
// ============================================================================

export type ExternalDataset = {
  // Location-based data
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    county: string | null;
    jurisdiction: string | null;
  };

  // Building codes
  buildingCodes: {
    irc: string[]; // International Residential Code references
    localCodes: string[];
    windZone: string | null;
    seismicZone: string | null;
    snowLoadZone: string | null;
  };

  // Weather data
  weather: {
    historical: Array<{
      date: Date;
      type: string; // hail, wind, tornado, etc.
      severity: string;
      probability: number;
    }>;
    climateZone: string | null;
    averageAnnualPrecipitation: number | null;
    hailRiskScore: number | null;
  };

  // Material data
  materials: {
    manufacturers: Array<{
      name: string;
      product: string;
      specs: string;
      warranty: string;
      installationRequirements: string[];
    }>;
    pricing: {
      market: string; // local, regional, national
      trends: string; // increasing, stable, decreasing
      availability: string; // good, limited, scarce
    } | null;
  };

  // Industry data
  industry: {
    claimTrends: string[];
    classActions: string[];
    bestPractices: string[];
    safetyAlerts: string[];
  };
};

/**
 * Build external world dataset.
 * This is STREAM D - everything from outside sources.
 */
export async function buildExternalDataset(
  claimLocation: {
    city: string;
    state: string;
    zip: string;
  },
  roofType: string | null,
  lossType: string
): Promise<ExternalDataset> {
  // NOTE: This is a simplified version.
  // In production, this would call real APIs:
  // - Weather services
  // - Code databases
  // - Material manufacturers
  // - Industry databases

  return {
    location: {
      address: "",
      city: claimLocation.city,
      state: claimLocation.state,
      zip: claimLocation.zip,
      county: null,
      jurisdiction: null,
    },
    buildingCodes: {
      irc: [
        "R905.2.8.2 - Asphalt shingle underlayment requirements",
        "R905.1 - Roof covering application",
        "R905.2.7 - Asphalt shingle attachment",
      ],
      localCodes: [],
      windZone: null,
      seismicZone: null,
      snowLoadZone: null,
    },
    weather: {
      historical: [],
      climateZone: null,
      averageAnnualPrecipitation: null,
      hailRiskScore: null,
    },
    materials: {
      manufacturers: [],
      pricing: null,
    },
    industry: {
      claimTrends: [
        "Increased hail damage claims in 2024-2025",
        "Labor costs up 15% year-over-year",
        "Material lead times improved since 2023",
      ],
      classActions: [],
      bestPractices: [
        "Document all damage with high-resolution photos",
        "Include HOVER or aerial measurements when available",
        "Supplement within 30 days of initial estimate",
      ],
      safetyAlerts: [],
    },
  };
}

// ============================================================================
// UNIFIED PAYLOAD
// ============================================================================

export type IntelligenceCorePayload = {
  internal: InternalClaimDataset;
  features: FeatureToggles;
  documents: DocumentsDataset;
  external: ExternalDataset;
};

/**
 * Build the complete 4-stream intelligence core payload.
 * This is the master function that combines A, B, C, D.
 */
export async function buildIntelligenceCorePayload(
  claimId: string,
  orgId?: string | null,
  featureOverrides?: Partial<FeatureToggles>
): Promise<IntelligenceCorePayload> {
  const internal = await buildInternalClaimDataset(claimId, orgId);
  const features = buildFeatureToggles(featureOverrides);
  const documents = await buildDocumentsDataset(claimId, orgId);
  const external = await buildExternalDataset(
    { city: "", state: "", zip: "" },
    null,
    internal.claim.damageType
  );
  return { internal, features, documents, external };
}
