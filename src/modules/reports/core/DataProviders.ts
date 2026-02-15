// ============================================================================
// DATA PROVIDERS - Placeholder hooks for Phase 1
// ============================================================================
// These are stub implementations with mock data.
// Replace with real DB queries in Phase 2.
// ============================================================================

import type {
  BrandingConfig,
  CodeCitation,
  LineItem,
  PhotoItem,
  ReportMetadata,
  SupplementItem,
  WeatherData,
} from "../types";

/**
 * Fetch report branding (mock)
 */
export function useReportBranding(): BrandingConfig {
  return {
    logoUrl: "https://via.placeholder.com/200x60/1e40af/ffffff?text=SkaiScraper",
    brandColor: "#1e40af",
    accentColor: "#3b82f6",
    companyName: "SkaiScraper Demo Co.",
    licenseNumber: "ROC #123456",
    website: "https://skaiscrape.com",
    phone: "(555) 123-4567",
    email: "contact@skaiscrape.com",
    address: "123 Main St, Phoenix, AZ 85001",
  };
}

/**
 * Fetch claim/report metadata (mock)
 */
export function useReportClaimData(): ReportMetadata {
  return {
    reportId: "demo-report-001",
    claimNumber: "CLM-2025-001234",
    policyNumber: "POL-987654321",
    dateOfLoss: "2025-01-15",
    adjusterName: "John Smith",
    inspectionDate: "2025-01-20",
    propertyAddress: "456 Oak Ave, Phoenix, AZ 85012",
    clientName: "Jane Homeowner",
    carrierName: "State Farm Insurance",
    preparedBy: "Mike Contractor",
    submittedDate: new Date().toISOString().split("T")[0],
  };
}

/**
 * Fetch weather verification data (mock)
 */
export function useReportWeather(): WeatherData {
  return {
    dateOfLoss: "2025-01-15",
    hailSize: "1.5 inches",
    windSpeed: "65 mph",
    source: "NOAA / Stormersite",
    verificationStatement:
      "A qualifying hail/wind event occurred within 6 hours of claimed loss on January 15, 2025.",
    mapUrls: [
      "https://via.placeholder.com/600x400/1e40af/ffffff?text=Hail+Map",
      "https://via.placeholder.com/600x400/3b82f6/ffffff?text=Wind+Contour",
    ],
  };
}

/**
 * Fetch photo evidence (mock)
 */
export function useReportPhotos(): PhotoItem[] {
  return [
    {
      id: "photo-001",
      url: "https://via.placeholder.com/800x600/1e40af/ffffff?text=Roof+Damage+1",
      caption: "Hail impact on shingle surface - field area",
      category: "field",
      locationTag: "North slope",
      takenAt: "2025-01-20T10:30:00Z",
    },
    {
      id: "photo-002",
      url: "https://via.placeholder.com/800x600/3b82f6/ffffff?text=Roof+Damage+2",
      caption: "Wind-lifted shingles - ridge area",
      category: "field",
      locationTag: "Ridge cap",
      takenAt: "2025-01-20T10:35:00Z",
    },
    {
      id: "photo-003",
      url: "https://via.placeholder.com/800x600/1e40af/ffffff?text=Soft+Metals",
      caption: "Hail dents on gutter and flashing",
      category: "soft-metals",
      locationTag: "East gutter",
      takenAt: "2025-01-20T10:40:00Z",
    },
    {
      id: "photo-004",
      url: "https://via.placeholder.com/800x600/3b82f6/ffffff?text=Test+Cut",
      caption: "Test cut revealing brittle granule loss",
      category: "test-cuts",
      locationTag: "West slope",
      takenAt: "2025-01-20T11:00:00Z",
    },
  ];
}

/**
 * Fetch line items (mock)
 */
export function useReportLineItems(): LineItem[] {
  return [
    {
      id: "line-001",
      description: "Tear-off existing roof system (30 sq)",
      quantity: 30,
      unit: "SQ",
      contractorPrice: 4500,
      carrierPrice: 3900,
      status: "approved",
      variance: 600,
    },
    {
      id: "line-002",
      description: "Install GAF Timberline HDZ shingles",
      quantity: 30,
      unit: "SQ",
      contractorPrice: 12000,
      carrierPrice: 11500,
      status: "approved",
      variance: 500,
    },
    {
      id: "line-003",
      description: "Ice & water shield (3' eave + valleys)",
      quantity: 8,
      unit: "ROLL",
      contractorPrice: 1200,
      carrierPrice: 800,
      status: "pending",
      variance: 400,
    },
    {
      id: "line-004",
      description: "Synthetic underlayment",
      quantity: 30,
      unit: "SQ",
      contractorPrice: 900,
      status: "new",
    },
    {
      id: "line-005",
      description: "Haul-off & dump fees",
      quantity: 1,
      unit: "LOT",
      contractorPrice: 750,
      carrierPrice: 500,
      status: "denied",
      variance: 250,
    },
  ];
}

/**
 * Fetch code compliance citations (mock)
 */
export function useReportCodes(): CodeCitation[] {
  return [
    {
      code: "IRC R905.2.7",
      description: "Ice Barrier Requirement",
      jurisdictionType: "IRC",
      requirementText:
        "Ice barrier required in areas where average daily temperature in January is 25°F or less.",
    },
    {
      code: "IBC 1507.2.8.1",
      description: "Underlayment Replacement",
      jurisdictionType: "IBC",
      requirementText:
        "Where the existing roof is removed down to the deck, new underlayment shall be installed per code.",
    },
    {
      code: "GAF Installation Manual",
      description: "Manufacturer Warranty Requirements",
      jurisdictionType: "Manufacturer",
      requirementText:
        "Use of GAF-approved synthetic underlayment is required to maintain warranty coverage.",
    },
    {
      code: "Phoenix Building Code 106.3",
      description: "Local Steep-Slope Requirements",
      jurisdictionType: "Local",
      requirementText:
        "Additional safety measures and fall protection required for roofs exceeding 6:12 pitch.",
    },
  ];
}

/**
 * Fetch supplements (mock)
 */
export function useReportSupplements(): SupplementItem[] {
  return [
    {
      description: "Additional decking replacement (hidden damage)",
      reasonCode: "Unseen damage discovered during tear-off",
      amount: 1250,
      justification:
        '12 sheets of 1/2" OSB required due to water damage not visible from exterior inspection.',
      attachments: ["decking-damage-photos.pdf"],
    },
    {
      description: "Code upgrade: Ice & water shield extension",
      reasonCode: "Code compliance upgrade",
      amount: 600,
      justification:
        'Local jurisdiction requires ice barrier to extend 36" past interior wall line. Original estimate only included eaves.',
      attachments: ["code-citation-106-3.pdf"],
    },
  ];
}
