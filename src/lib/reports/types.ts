// lib/reports/types.ts

export type ReportType =
  | "INSURANCE_CLAIM"
  | "RETAIL_PROPOSAL"
  | "SUPPLEMENT_PACKAGE"
  | "WEATHER_ONLY"
  | "WARRANTY_DOC";

export type ReportSectionId =
  | "COVER"
  | "CLAIM_SNAPSHOT"
  | "CLIENT_SNAPSHOT"
  | "MAPS_AND_PHOTOS"
  | "WEATHER_QUICK_DOL"
  | "WEATHER_FULL"
  | "AI_DAMAGE"
  | "ESTIMATE_INITIAL"
  | "ESTIMATE_SUPPLEMENT"
  | "DEPRECIATION"
  | "MATERIALS"
  | "CODE_REQUIREMENTS"
  | "OCR_DOCS"
  | "WARRANTY_DETAILS"
  | "TIMELINE"
  | "AI_SUMMARY_CLAIM"
  | "AI_SUMMARY_RETAIL"
  | "SCOPE_OF_WORK"
  | "RETAIL_PRICING"
  | "CUSTOMER_SIGNATURE";

export interface ReportConfig {
  orgId: string;
  claimId: string;
  type: ReportType;
  sections: ReportSectionId[];
  options?: {
    templateId?: string;
    warrantyOptionId?: string;
    customTitle?: string;
    customNotes?: string;
  };
}

// DEPRECIATION REPORT PAYLOAD (for PDF generation)
export interface DepreciationReportPayload {
  branding?: {
    companyName?: string;
    logoUrl?: string;
    colorPrimary?: string;
    colorAccent?: string;
    license?: string;
    phone?: string;
    website?: string;
  };
  claim: {
    claimNumber: string;
    address?: string;
    lossDate?: string;
    peril?: string;
    orgId?: string;
    insured_name?: string;
    propertyAddress?: string;
    carrierName?: string;
    stormDate?: string;
  };
  job?: {
    jobNumber?: string;
    completionDate?: string;
    descriptionOfWork?: string;
  };
  financials: {
    rcv?: number;
    acv?: number;
    deductible?: number;
    depreciation?: number;
    supplementsTotal?: number;
    totalDue?: number;
    rcvTotal?: number;
    acvPaid?: number;
  };
  notesToCarrier?: string;
  includeBuyerLetter?: boolean;
  includePhotos?: boolean;
  photos?: Array<{ url: string; caption: string }>;
}

// ORG BRANDING
export interface OrgBranding {
  name: string;
  logoUrl?: string;
  slogan?: string;
  motto?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  website?: string;
  phone?: string;
  email?: string;
  fullAddress?: string;
}

// CLAIM + CLIENT SNAPSHOT
export interface ClientAndClaimSnapshot {
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  carrier?: string;
  claimNumber?: string;
  policyNumber?: string;
  dateOfLoss?: string;
  causeOfLoss?: string;
  status?: string;
  propertyAddress: string;
}

// WEATHER
export interface WeatherSummary {
  quickDol?: {
    eventDate?: string;
    peril?: string;
    hailSizeInches?: number;
    windSpeedMph?: number;
    provider?: string;
    aiSummary?: string;
  };
  fullReport?: {
    events: Array<{
      date: string;
      peril: string;
      hailSizeInches?: number;
      windSpeedMph?: number;
      distanceMiles?: number;
    }>;
    aiNarrative?: string;
  };
}

// DAMAGE PHOTOS
export interface PhotoWithCaption {
  url: string;
  label?: string;
  location?: string;
  component?: string;
  severity?: "MINOR" | "MODERATE" | "SEVERE";
  recommendation?: string;
  causeTag?: string;
}

// DAMAGE SECTION
export interface DamageSectionData {
  photos: PhotoWithCaption[];
}

// ESTIMATES
export interface EstimateLineItem {
  lineNumber?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface EstimateSummary {
  totalRcv: number;
  totalAcv?: number;
  deductible?: number;
  priorPayments?: number;
  netClaim?: number;
}

export interface EstimateSectionData {
  initial?: {
    summary: EstimateSummary;
    lineItems: EstimateLineItem[];
  };
  supplement?: {
    summary: EstimateSummary;
    lineItems: EstimateLineItem[];
  };
}

// DEPRECIATION
export interface DepreciationItemData {
  label: string;
  ageYears: number;
  lifeExpectancyYears: number;
  condition: string;
  depreciationPercent: number;
  rcv: number;
  acv: number;
}

export interface DepreciationSectionData {
  items: DepreciationItemData[];
}

// MATERIALS
export interface MaterialItemData {
  category: string;
  name: string;
  vendorName?: string;
  color?: string;
  quantity?: number;
  unit?: string;
  isUpgrade?: boolean;
  specSheetUrl?: string;
}

export interface MaterialsSectionData {
  primarySystemName?: string;
  primaryColorName?: string;
  items: MaterialItemData[];
}

// WARRANTY
export interface WarrantySectionData {
  optionName?: string;
  durationYears?: number;
  isTransferable?: boolean;

  rawCoverageText?: string;
  rawExclusionsText?: string;
  rawMaintenanceReq?: string;

  aiSummaryIntro?: string;
  aiCoverageBullets?: string[];
  aiExclusionsBullets?: string[];
  aiMaintenanceBullets?: string[];
}

// TIMELINE
export interface TimelineSectionData {
  aiTimelineTitle?: string;
  aiTimelineSteps?: Array<{
    label: string;
    description: string;
  }>;
}

// OCR
export interface OcrDocData {
  title: string;
  sourceType: string;
  aiSummary?: string;
  pageCount?: number;
}

// AI SUMMARIES
export interface AiSummarySectionData {
  headline: string;
  bullets: string[];
  bodyParagraph?: string;
}

// FULL REPORT DATA
export interface ReportData {
  org: OrgBranding;
  claim: ClientAndClaimSnapshot;

  cover: {
    title: string;
    subtitle?: string;
    createdAt: string;
    frontPhotoUrl?: string;
    aerialPhotoUrl?: string;
  };

  mapsAndPhotos?: {
    frontPhotoUrl?: string;
    aerialPhotoUrl?: string;
    streetMapUrl?: string;
    mockupPhotoUrl?: string;
  };

  weather?: WeatherSummary;
  damage?: DamageSectionData;
  estimate?: EstimateSectionData;
  depreciation?: DepreciationSectionData;
  materials?: MaterialsSectionData;
  warranty?: WarrantySectionData;
  timeline?: TimelineSectionData;

  ocrDocs?: OcrDocData[];

  aiSummaryClaim?: AiSummarySectionData;
  aiSummaryRetail?: AiSummarySectionData;
}

// SUPPLEMENT TYPES
export interface SupplementLine {
  code?: string;
  description: string;
  qty: number;
  unit: string;
  unitRate: number;
  tax?: number;
  lineTotal: number;
}

export interface SupplementBranding {
  companyName: string;
  addressLine?: string;
  phone?: string;
  email?: string;
  website?: string;
  rocNumber?: string;
  logoUrl?: string | null;
  colorPrimary: string;
  colorAccent: string;
}

export interface SupplementReportPayload {
  branding: SupplementBranding;
  claim: {
    insured_name: string;
    claimNumber: string;
    propertyAddress: string;
    carrierName?: string;
    stormDate?: string;
  };
  estimateLines: SupplementLine[];
  rcvImpact?: {
    baseRcv: number;
    supplementRcv: number;
    newRcv: number;
  };
  narrative: string;
  photos: Array<{ url: string; caption: string }>;
}
