/**
 * CANONICAL REPORT SECTION REGISTRY
 *
 * Single source of truth for:
 * - Template configuration
 * - AI prompt generation
 * - PDF rendering
 * - Proposals, Claims, Supplements, Rebuttals
 *
 * Each section defines:
 * - sectionKey: Unique identifier
 * - defaultTitle: Display name
 * - variants: Layout options (min 2 per section)
 * - placeholders: Data binding fields
 * - aiRole: AI purpose/context
 * - aiGoal: Specific AI instruction intent
 * - pdfLayoutHint: Rendering guidance
 * - allowedDataShape: Expected data structure
 */

export interface ReportSectionDefinition {
  sectionKey: string;
  defaultTitle: string;
  variants: {
    key: string;
    label: string;
    description: string;
  }[];
  placeholders: string[];
  aiRole: string;
  aiGoal: string;
  pdfLayoutHint: string;
  allowedDataShape: Record<string, string>;
  category:
    | "header"
    | "content"
    | "evidence"
    | "analysis"
    | "technical"
    | "financial"
    | "legal"
    | "footer";
}

/**
 * ALL 13 CANONICAL SECTIONS
 * Order matters - this is the default section sequence
 */
export const REPORT_SECTIONS: ReportSectionDefinition[] = [
  // 1. COVER PAGE
  {
    sectionKey: "cover",
    defaultTitle: "Cover Page",
    variants: [
      {
        key: "full-hero-photo",
        label: "Full Hero Photo",
        description: "Large cover photo with overlay text and branding",
      },
      {
        key: "logo-header",
        label: "Logo Header",
        description: "Minimal cover with logo, claim metadata, and clean typography",
      },
    ],
    placeholders: [
      "companyLogo",
      "claimNumber",
      "propertyAddress",
      "insured_name",
      "date",
      "coverPhoto",
    ],
    aiRole: "header",
    aiGoal: "Generate professional cover page content with accurate claim metadata",
    pdfLayoutHint: "Full page, centered, with branding prominence",
    allowedDataShape: {
      companyLogo: "string (URL)",
      claimNumber: "string",
      propertyAddress: "string",
      insured_name: "string",
      date: "string (ISO date)",
      coverPhoto: "string (URL) | optional",
    },
    category: "header",
  },

  // 2. TABLE OF CONTENTS
  {
    sectionKey: "toc",
    defaultTitle: "Table of Contents",
    variants: [
      {
        key: "auto",
        label: "Auto-Generated",
        description: "Automatically generated from active sections",
      },
      {
        key: "manual",
        label: "Manual Editable",
        description: "Manually editable with custom entries",
      },
    ],
    placeholders: [],
    aiRole: "navigation",
    aiGoal: "Generate accurate table of contents with page numbers",
    pdfLayoutHint: "Left-aligned list with dots/lines to page numbers",
    allowedDataShape: {
      sections: "Array<{ title: string; page: number }>",
    },
    category: "header",
  },

  // 3. EXECUTIVE SUMMARY
  {
    sectionKey: "executive-summary",
    defaultTitle: "Executive Summary",
    variants: [
      {
        key: "neutral-ai",
        label: "Neutral AI Summary",
        description: "Objective, carrier-aligned tone for balanced reporting",
      },
      {
        key: "advocacy-ai",
        label: "Advocacy Summary",
        description: "Evidence-driven, contractor-advocacy tone with strong positioning",
      },
      {
        key: "bullet-summary",
        label: "Bullet Point Summary",
        description: "Concise bullet-point format for quick executive review",
      },
    ],
    placeholders: ["lossSummary", "recommendation", "claimOutcome", "keyFindings"],
    aiRole: "summary",
    aiGoal:
      "Synthesize claim findings into clear, actionable executive summary. Adjust tone per variant.",
    pdfLayoutHint: "2-3 paragraphs or 8-12 bullets, prominent positioning",
    allowedDataShape: {
      lossSummary: "string (200-300 words)",
      recommendation: "string",
      claimOutcome: "string",
      keyFindings: "Array<string>",
    },
    category: "content",
  },

  // 4. WEATHER VERIFICATION
  {
    sectionKey: "weather-verification",
    defaultTitle: "Loss & Weather Verification",
    variants: [
      {
        key: "storm-timeline",
        label: "Storm Timeline",
        description: "Chronological storm event timeline with weather data",
      },
      {
        key: "multi-source-verification",
        label: "Multi-Source Verification",
        description: "Cross-referenced verification from NOAA, VisualCrossing, CoreLogic",
      },
    ],
    placeholders: [
      "dateOfLoss",
      "stormType",
      "hailSize",
      "windSpeed",
      "weatherSource",
      "confidenceLevel",
    ],
    aiRole: "verification",
    aiGoal:
      "Present verifiable weather data with high confidence. Cite sources. Establish storm correlation.",
    pdfLayoutHint: "Timeline or data table with source citations",
    allowedDataShape: {
      dateOfLoss: "string (ISO date)",
      stormType: "string",
      hailSize: "string | number",
      windSpeed: "string | number",
      weatherSource: "Array<string>",
      confidenceLevel: '"high" | "medium" | "low"',
    },
    category: "evidence",
  },

  // 5. ADJUSTER / CONTRACTOR NOTES
  {
    sectionKey: "adjuster-notes",
    defaultTitle: "Adjuster & Contractor Notes",
    variants: [
      {
        key: "chronological",
        label: "Chronological",
        description: "Time-ordered notes from all parties",
      },
      {
        key: "side-by-side",
        label: "Side-by-Side Comparison",
        description: "Two-column layout comparing adjuster vs contractor perspectives",
      },
    ],
    placeholders: ["adjusterNote", "contractorNote", "timestamp", "author"],
    aiRole: "notes",
    aiGoal: "Organize and present notes clearly. Highlight discrepancies if side-by-side.",
    pdfLayoutHint: "Timeline or two-column table",
    allowedDataShape: {
      adjusterNote: "string",
      contractorNote: "string",
      timestamp: "string (ISO datetime)",
      author: "string",
    },
    category: "content",
  },

  // 6. PHOTO EVIDENCE
  {
    sectionKey: "photo-evidence",
    defaultTitle: "Photo Evidence",
    variants: [
      {
        key: "grid-labeled",
        label: "Grid Layout with Labels",
        description: "Photo grid with captions and damage type tags",
      },
      {
        key: "room-by-room",
        label: "Room-by-Room Documentation",
        description: "Photos organized by property location/room",
      },
    ],
    placeholders: ["photoId", "photoUrl", "caption", "damageType", "location"],
    aiRole: "evidence",
    aiGoal: "Generate accurate captions. Tag damage types. Do NOT interpret or assess severity.",
    pdfLayoutHint: "2-4 photos per page with captions, or room-grouped sections",
    allowedDataShape: {
      photoId: "string",
      photoUrl: "string (URL)",
      caption: "string",
      damageType: "string",
      location: "string | optional",
    },
    category: "evidence",
  },

  // 7. TEST CUTS / CORES / MEASUREMENTS
  {
    sectionKey: "test-cuts",
    defaultTitle: "Test Cuts & Measurements",
    variants: [
      {
        key: "table",
        label: "Measurement Table",
        description: "Tabular format with location, measurement, findings",
      },
      {
        key: "annotated-photos",
        label: "Annotated Photos",
        description: "Photos with measurement overlays and annotations",
      },
    ],
    placeholders: ["measurement", "location", "finding", "photoUrl"],
    aiRole: "technical",
    aiGoal: "Present measurements clearly. Link to photos. Highlight non-compliance or findings.",
    pdfLayoutHint: "Table or annotated images",
    allowedDataShape: {
      measurement: "string | number",
      location: "string",
      finding: "string",
      photoUrl: "string (URL) | optional",
    },
    category: "technical",
  },

  // 8. SCOPE & LINE-ITEM MATRIX
  {
    sectionKey: "scope-matrix",
    defaultTitle: "Scope & Line-Item Matrix",
    variants: [
      {
        key: "xactimate-style",
        label: "Xactimate-Style Table",
        description: "Familiar line-item table format for adjusters",
      },
      {
        key: "repair-vs-replace",
        label: "Repair vs Replace Matrix",
        description: "Decision matrix showing repair vs replacement analysis",
      },
    ],
    placeholders: ["scopeItem", "repairCost", "replaceCost", "quantity", "unit"],
    aiRole: "pricing",
    aiGoal: "Generate detailed scope matrix. Explain repair vs replace logic when applicable.",
    pdfLayoutHint: "Multi-column table with totals",
    allowedDataShape: {
      scopeItem: "string",
      repairCost: "number",
      replaceCost: "number",
      quantity: "number",
      unit: "string",
    },
    category: "financial",
  },

  // 9. CODE COMPLIANCE & MANUFACTURER REQUIREMENTS
  {
    sectionKey: "code-compliance",
    defaultTitle: "Code Compliance & Manufacturer Requirements",
    variants: [
      {
        key: "jurisdiction-first",
        label: "Jurisdiction-Based",
        description: "Organized by local building codes and regulations",
      },
      {
        key: "manufacturer-first",
        label: "Manufacturer-Based",
        description: "Organized by manufacturer installation requirements",
      },
    ],
    placeholders: ["codeSection", "requirement", "nonComplianceReason", "citation"],
    aiRole: "code-analysis",
    aiGoal: "Cite codes clearly. Explain non-compliance in plain language. Use jurisdiction data.",
    pdfLayoutHint: "List or table with code citations and explanations",
    allowedDataShape: {
      codeSection: "string",
      requirement: "string",
      nonComplianceReason: "string | optional",
      citation: "string",
    },
    category: "legal",
  },

  // 10. COMPARATIVE PRICING / MARKET DATA
  {
    sectionKey: "pricing-comparison",
    defaultTitle: "Comparative Pricing & Market Data",
    variants: [
      {
        key: "regional-average",
        label: "Regional Average Pricing",
        description: "Compare to regional market averages",
      },
      {
        key: "supplier-quotes",
        label: "Supplier Quote Comparison",
        description: "Show actual supplier quotes and pricing",
      },
    ],
    placeholders: ["itemCode", "regionalPrice", "supplierPrice", "variance"],
    aiRole: "market-analysis",
    aiGoal: "Present pricing data objectively. Explain variances without advocacy.",
    pdfLayoutHint: "Comparison table with variance indicators",
    allowedDataShape: {
      itemCode: "string",
      regionalPrice: "number",
      supplierPrice: "number",
      variance: "number (percentage)",
    },
    category: "financial",
  },

  // 11. SUPPLEMENTS & VARIANCES
  {
    sectionKey: "supplements",
    defaultTitle: "Supplements & Variances",
    variants: [
      {
        key: "delta-only",
        label: "Delta Summary",
        description: "Show only changes from original estimate",
      },
      {
        key: "timeline",
        label: "Change Order Timeline",
        description: "Chronological supplement timeline with justifications",
      },
    ],
    placeholders: ["originalAmount", "revisedAmount", "justification", "changeDate"],
    aiRole: "delta-analysis",
    aiGoal: "Clearly show deltas. Justify each change. Reference photos/codes when applicable.",
    pdfLayoutHint: "Delta table or timeline with justifications",
    allowedDataShape: {
      originalAmount: "number",
      revisedAmount: "number",
      justification: "string",
      changeDate: "string (ISO date)",
    },
    category: "financial",
  },

  // 12. SIGNATURE PAGE & DISCLAIMERS
  {
    sectionKey: "signature-page",
    defaultTitle: "Signature Page",
    variants: [
      {
        key: "digital-signature",
        label: "Digital Signature",
        description: "Digital signature capture with timestamp",
      },
      {
        key: "affidavit",
        label: "Affidavit Format",
        description: "Legal affidavit format with notary fields",
      },
    ],
    placeholders: ["signerName", "signatureImage", "date", "title"],
    aiRole: "signature",
    aiGoal: "Generate appropriate disclaimers and signature fields. Legal compliance focus.",
    pdfLayoutHint: "Signature lines, date fields, legal text",
    allowedDataShape: {
      signerName: "string",
      signatureImage: "string (data URL) | optional",
      date: "string (ISO date)",
      title: "string",
    },
    category: "footer",
  },

  // 13. ATTACHMENTS INDEX
  {
    sectionKey: "attachments-index",
    defaultTitle: "Attachments & Appendices",
    variants: [
      {
        key: "auto",
        label: "Auto-Indexed",
        description: "Automatically indexed from uploaded documents",
      },
      {
        key: "manual",
        label: "Manual Appendix",
        description: "Manually curated attachment list",
      },
    ],
    placeholders: ["attachmentTitle", "pageNumber", "documentType"],
    aiRole: "appendix",
    aiGoal: "Generate accurate attachment index with page references.",
    pdfLayoutHint: "Numbered list or table with page references",
    allowedDataShape: {
      attachmentTitle: "string",
      pageNumber: "number",
      documentType: "string",
    },
    category: "footer",
  },
];

/**
 * UTILITY FUNCTIONS
 */

export function getSectionByKey(key: string): ReportSectionDefinition | undefined {
  return REPORT_SECTIONS.find((section) => section.sectionKey === key);
}

export function getDefaultSectionOrder(): string[] {
  return REPORT_SECTIONS.map((section) => section.sectionKey);
}

export function getSectionsByCategory(
  category: ReportSectionDefinition["category"]
): ReportSectionDefinition[] {
  return REPORT_SECTIONS.filter((section) => section.category === category);
}

export function getVariantLabel(sectionKey: string, variantKey: string): string | undefined {
  const section = getSectionByKey(sectionKey);
  const variant = section?.variants.find((v) => v.key === variantKey);
  return variant?.label;
}

export function validateSectionData(
  sectionKey: string,
  data: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const section = getSectionByKey(sectionKey);
  if (!section) {
    return { valid: false, errors: [`Unknown section: ${sectionKey}`] };
  }

  const errors: string[] = [];
  const requiredFields = section.placeholders;

  // Check for missing required fields
  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * EXPORT METADATA
 */
export const SECTION_REGISTRY_VERSION = "v1.0.0";
export const TOTAL_SECTIONS = REPORT_SECTIONS.length;

export const SECTION_CATEGORIES = [
  "header",
  "content",
  "evidence",
  "analysis",
  "technical",
  "financial",
  "legal",
  "footer",
] as const;
