// ============================================================================
// CLAIMS PACKET TEMPLATES - FIELD DEFINITIONS
// ============================================================================
// Two versions: Insurance (adjuster-ready) vs Retail (homeowner-friendly)
// ============================================================================

export interface ClaimPacketData {
  // Cover Sheet
  insured_name: string;
  propertyAddress: string;
  carrier?: string; // Optional for retail version
  claimNumber?: string;
  policyNumber?: string;
  dateOfLoss: string;
  reportedCause: string;
  inspectionDate: string;
  preparedBy: string;
  preparedPhone: string;
  preparedEmail: string;

  // Weather/Event Data
  eventType: "hail" | "wind" | "storm" | "fire" | "water" | "other";
  eventTypeOther?: string;
  weatherSource: string[];
  maxHailSize?: string;
  maxWindSpeed?: string;
  stormDirection?: string;
  meetsThreshold?: boolean;
  weatherNotes?: string;

  // Field Inspection
  roofType: "shingle" | "tile" | "metal" | "mod-bit" | "tpo" | "spf" | "other";
  roofTypeOther?: string;
  observedDamage: string[];
  generalNotes?: string;

  // Photos (auto-generated pages)
  photos: Array<{
    url: string;
    caption: string;
    index: number;
  }>;

  // Scope/Estimate
  scopeNotes?: string;
  replacementRequired?: boolean;
  repairFeasible?: boolean;
  repairNotFeasibleReason?: string;

  // Code References
  applicableCodes: string[];
  repairLimitationClause?: boolean;
  repairsCompliant?: boolean;
  codeNotes?: string;

  // Contractor Letter
  contractorName: string;
  contractorLicense: string;
  contractorCompany: string;
  recommendedAction: "replace" | "repair" | "further-inspection";

  // Supplement (Insurance only)
  supplementItems?: string[];
  supplementReason?: string[];
  supplementNotes?: string;

  // ========== RETAIL VERSION FIELDS (10-Page Structure) ==========
  // PAGE 1: Cover Sheet (already covered above + estimate type)
  estimateType?: "retail-cash" | "financing" | "insurance-pending";

  // PAGE 3: Recommended Repairs / Options
  recommendedRepairAction?:
    | "full-replacement"
    | "sectional-repair"
    | "maintenance-recoat"
    | "emergency-tarp";
  estimateRangeLow?: number;
  estimateRangeHigh?: number;
  includesTearOff?: boolean;
  includesNewRoofSystem?: boolean;
  includesUnderlaymentUpgrade?: boolean;
  includesFlashingVentReplacements?: boolean;
  includesWarrantiedInstall?: boolean;
  includesOptionalCoating?: boolean;
  includesSkylightReplacement?: boolean;
  financingAvailable?: boolean;
  warrantyOption?: "5yr-labor" | "10yr-labor" | "manufacturer-system";

  // PAGE 7: Project Timeline & Process
  timelineInspectionCompleted?: string;
  timelineProposalMaterialSelection?: string;
  timelineSchedulingPermit?: string;
  timelineTearOffInstall?: string;
  timelineFinalWalkthrough?: string;
  typicalDurationDays?: number;

  // PAGE 8: Roof System & Material Options
  materialChoice?:
    | "architectural-shingle"
    | "tile"
    | "metal"
    | "mod-bit"
    | "tpo-pvc"
    | "spray-foam";
  shingleType?: "30yr" | "50yr";
  tileType?: "concrete" | "clay" | "stone-coated";
  metalType?: "standing-seam" | "r-panel";
  coolRoofRated?: boolean;
  heatReflectiveCoating?: boolean;
  atticVentilationUpgrade?: boolean;
  radiantBarrierAddOn?: boolean;

  // PAGE 9: Warranty & Support
  serviceHotline?: string;
  warrantyEmail?: string;

  // ========== PHASE 1A: NEW RETAIL FIELDS ==========

  // FINANCING OPTIONS PAGE (NEW)
  financingPartners?: string[]; // ["Sunlight Financial", "GreenSky", "Hearth"]
  monthlyPaymentEstimateLow?: number;
  monthlyPaymentEstimateHigh?: number;
  financingTermMonths?: number; // 60, 120, 180
  financingAPR?: number; // 0, 4.99, 8.99
  financingApplicationQRCode?: string; // QR code data URL
  financingContactPhone?: string;
  financingContactEmail?: string;

  // "WHY US?" CREDIBILITY PAGE (NEW)
  companyBio?: string; // Short paragraph about the company
  yearEstablished?: number;
  licenseNumbers?: string[]; // ["ROC123456", "AZ-CR-12345"]
  certifications?: string[]; // ["GAF Master Elite", "CertainTeed SELECT ShingleMaster"]
  insuranceCarrier?: string; // "State Farm Commercial"
  insurancePolicyNumber?: string;
  bbbRating?: "A+" | "A" | "A-" | "B+" | "B" | "Not Rated";
  bbbAccredited?: boolean;
  customerTestimonials?: Array<{
    name: string;
    location: string;
    quote: string;
    rating: number; // 1-5
  }>;
  awardsBadges?: string[]; // ["Angi Super Service Award 2024", "Best of Phoenix 2023"]

  // ENHANCED SIGNATURE PAGE (UPDATED)
  clientPrintedName?: string; // New: separate from signature
  clientEmail?: string; // New: for e-signature notification
  clientPhone?: string; // New: for follow-up
  termsAccepted?: boolean; // "I agree to the scope and terms"
  termsAcceptedDate?: string;
  signatureQRCode?: string; // QR code linking to e-signature portal
  witnessName?: string; // Optional witness signature
  witnessSignature?: string;
  witnessDate?: string;

  // PAGE 10: Signature & Authorization (ORIGINAL - kept for compatibility)
  clientName?: string;
  clientSignature?: string;
  clientSignatureDate?: string;

  // ========== PHASE 1A: NEW CLAIMS FIELDS ==========

  // DIAGRAM & MEASUREMENTS PAGE (NEW)
  roofDiagramImageUrl?: string; // Upload or generated diagram
  roofTotalSquares?: number;
  roofSlopes?: Array<{
    slopeName: string; // "North", "South", "East", "West"
    pitch?: string; // "4/12", "6/12"
    squares?: number;
    wastePercent?: number;
  }>;
  roofComponentBreakdown?: {
    fieldSquares?: number;
    ridgeLF?: number;
    hipLF?: number;
    valleyLF?: number;
    eaveFlashingLF?: number;
    rakeFlashingLF?: number;
    parapetLF?: number;
    parapetHeightFT?: number;
  };

  // SCOPE OF LOSS (XACTIMATE FORMAT) PAGE (NEW)
  scopeLineItems?: Array<{
    lineNumber: number;
    description: string; // "R&R Shingles", "Install Ice & Water Shield"
    quantity: number;
    unit: "SQ" | "LF" | "EA" | "SF";
    unitPrice: number;
    totalPrice: number;
    xactimateCode?: string; // "RSG", "RFG", etc.
    codeNotes?: string;
  }>;
  scopeSubtotal?: number;
  scopeOverheadPercent?: number; // 10
  scopeProfitPercent?: number; // 10
  scopeOverheadAmount?: number;
  scopeProfitAmount?: number;
  scopeTaxPercent?: number;
  scopeTaxAmount?: number;
  scopeGrandTotal?: number;

  // O&P JUSTIFICATION PAGE (NEW)
  opJustificationReason?: string; // Custom explanation
  opIndustryStandard?: boolean; // NRCA, HAAG, etc.
  opProjectComplexity?: "simple" | "moderate" | "complex" | "highly-complex";
  opRequiresSpecialEquipment?: boolean;
  opRequiresSafetyMeasures?: boolean;
  opMultiDayProject?: boolean;
  opIndustryReferences?: string[]; // ["NRCA Bulletin #7", "HAAG Certification Manual"]

  // POLICY LANGUAGE REFERENCES PAGE (NEW)
  policyType?: "HO3" | "HO5" | "DP3" | "Commercial";
  policyExcerpts?: Array<{
    section: string; // "Section I - Dwelling Coverage"
    excerpt: string; // Relevant policy language
    interpretation: string; // How it applies to this claim
  }>;
  codeUpgradeCoverage?: boolean;
  matchingClause?: boolean;
  depreciationApplied?: boolean;
  rcvClaim?: boolean; // Replacement Cost Value vs ACV
  deductibleAmount?: number;

  // MANUFACTURER SPECIFICATIONS PAGE (NEW)
  manufacturerSpecs?: Array<{
    productName: string; // "GAF Timberline HDZ"
    manufacturer: string; // "GAF"
    modelNumber?: string;
    warrantyYears?: number;
    codeApprovals?: string[]; // ["FM 4470", "UL 2218 Class 4", "Miami-Dade"]
    windRating?: string; // "130 mph"
    fireRating?: string; // "Class A"
    specSheetUrl?: string; // PDF link or uploaded file
  }>;

  // ASSIGNMENT OF BENEFITS (AOB/DTP) PAGE (NEW)
  aobContractorAuthorized?: boolean;
  aobDateSigned?: string;
  aobHomeownerSignature?: string;
  aobHomeownerPrintedName?: string;
  dtpDirectionToPayAccepted?: boolean;
  dtpPayeeCompany?: string; // Contractor company name
  dtpPayeeAddress?: string;
  dtpPayeeEIN?: string; // Tax ID
  dtpWitnessName?: string;
  dtpWitnessSignature?: string;
  dtpWitnessDate?: string;
  aobLegalLanguage?: string; // Auto-populated or custom
}

export type PacketVersion = "insurance" | "retail";

export const PACKET_HEADERS = {
  insurance: "SkaiScraper™ Claim Intelligence Report",
  retail: "SkaiScraper™ Property Damage Packet",
} as const;

export const PACKET_SUBTITLES = {
  insurance: "Insurance Carrier Submission Packet – Master Template v1.0",
  retail: "Professional Property Assessment Report – Master Template v1.0",
} as const;

export const PACKET_FOOTERS = {
  insurance: "Generated by SkaiScraper™ AI Claims Engine",
  retail: "Powered by SkaiScraper™ Smart Estimates",
} as const;

export const PACKET_CONFIDENTIALITY = {
  insurance: "CONFIDENTIAL – FOR CLAIMS USE ONLY",
  retail: "CONFIDENTIAL – FOR PROPERTY OWNER USE",
} as const;

// Field visibility by version
export const FIELD_VISIBILITY: Record<string, { insurance: boolean; retail: boolean }> = {
  carrier: { insurance: true, retail: false },
  claimNumber: { insurance: true, retail: false },
  policyNumber: { insurance: true, retail: false },
  weatherPage: { insurance: true, retail: true }, // Optional toggle for retail
  supplementPage: { insurance: true, retail: false },
  contractorLetter: { insurance: true, retail: true },
  codePage: { insurance: true, retail: true },
};

// Event type options
export const EVENT_TYPES = [
  { value: "hail", label: "Hail" },
  { value: "wind", label: "Wind" },
  { value: "storm", label: "Storm" },
  { value: "fire", label: "Fire" },
  { value: "water", label: "Water" },
  { value: "other", label: "Other" },
] as const;

// Weather sources
export const WEATHER_SOURCES = [
  "NWS Bulletin",
  "NOAA Storm Database",
  "Radar Hail Swath Map",
  "3rd-Party Weather Tool",
] as const;

// Roof types
export const ROOF_TYPES = [
  { value: "shingle", label: "Shingle" },
  { value: "tile", label: "Tile" },
  { value: "metal", label: "Metal" },
  { value: "mod-bit", label: "Modified Bitumen" },
  { value: "tpo", label: "TPO" },
  { value: "spf", label: "SPF" },
  { value: "other", label: "Other" },
] as const;

// Observed damage types
export const DAMAGE_TYPES = [
  "Hail Impact Marks",
  "Wind Uplift / Creased Shingles",
  "Granule Loss",
  "Broken Tiles",
  "Membrane Fractures",
  "Exposed Fiberglass Mat",
  "Soft Metal Dents",
  "HVAC / Flashing Impact Damage",
  "Skylight Damage",
  "Fascia / Soffit Damage",
  "Interior Leak Evidence",
  "Active Water Intrusion",
] as const;

// Retail-specific damage types (homeowner-friendly language)
export const RETAIL_DAMAGE_TYPES = [
  "Aging / Wear",
  "Storm Damage (Hail/Wind)",
  "Leaks / Water Stains",
  "Coating Failure",
  "Cracked Tile / Shingle Loss",
  "UV / Heat Deterioration",
  "Skylight / Flashing Issues",
  "Fascia / Stucco Damage",
  "Interior Damage Present",
] as const;

// Retail repair action options
export const REPAIR_ACTIONS = [
  { value: "full-replacement", label: "Full Roof Replacement" },
  { value: "sectional-repair", label: "Sectional Repair" },
  { value: "maintenance-recoat", label: "Maintenance + Recoat" },
  { value: "emergency-tarp", label: "Temporary Emergency Tarp / Leak Stop" },
] as const;

// Warranty options
export const WARRANTY_OPTIONS = [
  { value: "5yr-labor", label: "5-Yr Labor" },
  { value: "10yr-labor", label: "10-Yr Labor" },
  { value: "manufacturer-system", label: "Manufacturer System Warranty" },
] as const;

// Material choice options
export const MATERIAL_CHOICES = [
  { value: "architectural-shingle", label: "Architectural Shingle (30yr / 50yr)" },
  { value: "tile", label: "Tile (Concrete / Clay / Stone-Coated)" },
  { value: "metal", label: "Metal (Standing Seam / R-Panel)" },
  { value: "mod-bit", label: "Modified Bitumen" },
  { value: "tpo-pvc", label: "TPO / PVC / Commercial Membrane" },
  { value: "spray-foam", label: "Spray Foam + Elastomeric Coating" },
] as const;

// Applicable codes
export const APPLICABLE_CODES = [
  "IBC 2021 / IRC 2021",
  "ARMA Installation Guidelines",
  "NRCA Repair Standards",
  "Manufacturer Warranty Requirements",
  "OSHA Safety Standards",
] as const;

// Supplement reasons
export const SUPPLEMENT_REASONS = [
  "Code Upgrade",
  "Manufacturer Requirement",
  "Hidden / Non-Visible Damage",
  "Safety / OSHA Requirement",
  "Incorrect Carrier Scope",
] as const;

// Phase 1A: Financing options
export const FINANCING_PARTNERS = [
  "Sunlight Financial",
  "GreenSky",
  "Hearth",
  "Microf",
  "FTL Finance",
  "EnerBank USA",
  "Foundation Finance",
] as const;

export const FINANCING_TERMS = [
  { months: 60, label: "5 Years (60 months)" },
  { months: 120, label: "10 Years (120 months)" },
  { months: 180, label: "15 Years (180 months)" },
  { months: 240, label: "20 Years (240 months)" },
] as const;

export const FINANCING_APR_OPTIONS = [
  { value: 0, label: "0% APR (Promotional)" },
  { value: 4.99, label: "4.99% APR" },
  { value: 6.99, label: "6.99% APR" },
  { value: 8.99, label: "8.99% APR" },
  { value: 12.99, label: "12.99% APR" },
] as const;

// Phase 1A: BBB ratings
export const BBB_RATINGS = ["A+", "A", "A-", "B+", "B", "Not Rated"] as const;

// Phase 1A: Scope units
export const SCOPE_UNITS = [
  { value: "SQ", label: "Squares" },
  { value: "LF", label: "Linear Feet" },
  { value: "EA", label: "Each" },
  { value: "SF", label: "Square Feet" },
] as const;

// Phase 1A: Policy types
export const POLICY_TYPES = [
  { value: "HO3", label: "HO3 (Homeowner Special Form)" },
  { value: "HO5", label: "HO5 (Comprehensive Form)" },
  { value: "DP3", label: "DP3 (Dwelling Fire Policy)" },
  { value: "Commercial", label: "Commercial Property Policy" },
] as const;

// Phase 1A: Project complexity
export const PROJECT_COMPLEXITY = [
  { value: "simple", label: "Simple (1-story, basic shingle)" },
  { value: "moderate", label: "Moderate (2-story, standard features)" },
  { value: "complex", label: "Complex (multi-level, tile/metal)" },
  { value: "highly-complex", label: "Highly Complex (steep slopes, custom materials)" },
] as const;

// Blank template (for new packets)
export const BLANK_PACKET: ClaimPacketData = {
  insured_name: "",
  propertyAddress: "",
  carrier: "",
  claimNumber: "",
  policyNumber: "",
  dateOfLoss: "",
  reportedCause: "",
  inspectionDate: "",
  preparedBy: "",
  preparedPhone: "",
  preparedEmail: "",
  eventType: "hail",
  weatherSource: [],
  roofType: "shingle",
  observedDamage: [],
  photos: [],
  applicableCodes: [],
  contractorName: "",
  contractorLicense: "",
  contractorCompany: "",
  recommendedAction: "replace",
  // Retail fields
  estimateType: "retail-cash",
  recommendedRepairAction: "full-replacement",
  estimateRangeLow: 0,
  estimateRangeHigh: 0,
  includesTearOff: false,
  includesNewRoofSystem: false,
  includesUnderlaymentUpgrade: false,
  includesFlashingVentReplacements: false,
  includesWarrantiedInstall: false,
  includesOptionalCoating: false,
  includesSkylightReplacement: false,
  financingAvailable: false,
  warrantyOption: "5yr-labor",
  timelineInspectionCompleted: "",
  timelineProposalMaterialSelection: "",
  timelineSchedulingPermit: "",
  timelineTearOffInstall: "",
  timelineFinalWalkthrough: "",
  typicalDurationDays: 0,
  materialChoice: "architectural-shingle",
  coolRoofRated: false,
  heatReflectiveCoating: false,
  atticVentilationUpgrade: false,
  radiantBarrierAddOn: false,
  serviceHotline: "",
  warrantyEmail: "",
  clientName: "",
  clientSignature: "",
  clientSignatureDate: "",

  // Phase 1A: New Retail fields
  financingPartners: [],
  monthlyPaymentEstimateLow: 0,
  monthlyPaymentEstimateHigh: 0,
  financingTermMonths: 60,
  financingAPR: 0,
  financingApplicationQRCode: "",
  financingContactPhone: "",
  financingContactEmail: "",
  companyBio: "",
  yearEstablished: undefined,
  licenseNumbers: [],
  certifications: [],
  insuranceCarrier: "",
  insurancePolicyNumber: "",
  bbbRating: "Not Rated",
  bbbAccredited: false,
  customerTestimonials: [],
  awardsBadges: [],
  clientPrintedName: "",
  clientEmail: "",
  clientPhone: "",
  termsAccepted: false,
  termsAcceptedDate: "",
  signatureQRCode: "",
  witnessName: "",
  witnessSignature: "",
  witnessDate: "",

  // Phase 1A: New Claims fields
  roofDiagramImageUrl: "",
  roofTotalSquares: 0,
  roofSlopes: [],
  roofComponentBreakdown: {},
  scopeLineItems: [],
  scopeSubtotal: 0,
  scopeOverheadPercent: 10,
  scopeProfitPercent: 10,
  scopeOverheadAmount: 0,
  scopeProfitAmount: 0,
  scopeTaxPercent: 0,
  scopeTaxAmount: 0,
  scopeGrandTotal: 0,
  opJustificationReason: "",
  opIndustryStandard: true,
  opProjectComplexity: "moderate",
  opRequiresSpecialEquipment: false,
  opRequiresSafetyMeasures: false,
  opMultiDayProject: false,
  opIndustryReferences: [],
  policyType: "HO3",
  policyExcerpts: [],
  codeUpgradeCoverage: false,
  matchingClause: false,
  depreciationApplied: false,
  rcvClaim: true,
  deductibleAmount: 0,
  manufacturerSpecs: [],
  aobContractorAuthorized: false,
  aobDateSigned: "",
  aobHomeownerSignature: "",
  aobHomeownerPrintedName: "",
  dtpDirectionToPayAccepted: false,
  dtpPayeeCompany: "",
  dtpPayeeAddress: "",
  dtpPayeeEIN: "",
  dtpWitnessName: "",
  dtpWitnessSignature: "",
  dtpWitnessDate: "",
  aobLegalLanguage: "",
};
