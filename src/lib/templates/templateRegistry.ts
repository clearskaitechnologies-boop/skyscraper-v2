/**
 * Template Registry - Complete Marketplace
 * All 28 professional templates with metadata
 */

export interface TemplateDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnailKey: string; // R2 key or public path
  previewMode: "claim" | "retail";
  intendedUse: string;
  version: string;
}

export const TEMPLATE_CATEGORIES = {
  ROOFING: "Roofing",
  RESTORATION: "Restoration",
  SUPPLEMENTS: "Supplements",
  RETAIL: "Retail & Quotes",
  LEGAL: "Legal & Appraisal",
  SPECIALTY: "Specialty Reports",
} as const;

export const ALL_TEMPLATES: TemplateDefinition[] = [
  // ═══════════════════════════════════════════════════════════
  // ROOFING (6 templates)
  // ═══════════════════════════════════════════════════════════
  {
    id: "roof-damage-comp",
    slug: "comprehensive-roof-damage",
    title: "Comprehensive Roof Damage Report",
    description:
      "Complete roof inspection with weather verification, code compliance, and detailed scope. Ideal for hail, wind, and storm claims.",
    category: TEMPLATE_CATEGORIES.ROOFING,
    tags: ["roof", "storm", "hail", "wind", "inspection"],
    thumbnailKey: "templates/roof-damage-comp/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "2.0.0",
  },
  {
    id: "hail-certification",
    slug: "hail-damage-certification",
    title: "Hail Damage Certification",
    description:
      "Certified hail damage assessment with hailstone size verification and impact pattern analysis. HAAG certified methodology.",
    category: TEMPLATE_CATEGORIES.ROOFING,
    tags: ["hail", "certification", "roof", "storm"],
    thumbnailKey: "templates/hail-certification/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.5.0",
  },
  {
    id: "roof-inspection-premium",
    slug: "roofing-inspection-premium",
    title: "Premium Roofing Inspection",
    description:
      "Professional roof inspection report with thermal imaging, moisture detection, and code compliance verification.",
    category: TEMPLATE_CATEGORIES.ROOFING,
    tags: ["roof", "inspection", "thermal", "moisture"],
    thumbnailKey: "templates/roofing-inspection-premium/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "2.1.0",
  },
  {
    id: "roof-coating-analysis",
    slug: "roof-coating-analysis",
    title: "Roof Coating System Analysis",
    description:
      "Detailed analysis of roof coating systems including adhesion testing, thickness measurements, and warranty compliance.",
    category: TEMPLATE_CATEGORIES.ROOFING,
    tags: ["roof", "coating", "commercial", "warranty"],
    thumbnailKey: "templates/roof-coating-analysis/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.0.0",
  },
  {
    id: "flat-roof-assessment",
    slug: "flat-roof-assessment",
    title: "Commercial Flat Roof Assessment",
    description:
      "Commercial flat roof evaluation with core sampling, moisture scans, and membrane integrity testing.",
    category: TEMPLATE_CATEGORIES.ROOFING,
    tags: ["commercial", "flat-roof", "membrane", "moisture"],
    thumbnailKey: "templates/flat-roof-assessment/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.3.0",
  },
  {
    id: "skylight-repair-scope",
    slug: "skylight-repair-scope",
    title: "Skylight Damage & Repair Scope",
    description:
      "Specialized skylight inspection and repair scope including leak detection and flashing analysis.",
    category: TEMPLATE_CATEGORIES.ROOFING,
    tags: ["skylight", "roof", "leak", "repair"],
    thumbnailKey: "templates/skylight-repair-scope/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.0.0",
  },

  // ═══════════════════════════════════════════════════════════
  // RESTORATION (8 templates)
  // ═══════════════════════════════════════════════════════════
  {
    id: "water-damage-assessment",
    slug: "water-damage-assessment",
    title: "Water Damage Assessment Report",
    description:
      "Comprehensive water intrusion report with moisture mapping, mold detection, and drying protocols. IICRC S500 compliant.",
    category: TEMPLATE_CATEGORIES.RESTORATION,
    tags: ["water", "moisture", "mold", "drying", "iicrc"],
    thumbnailKey: "templates/water-damage-assessment/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "2.0.0",
  },
  {
    id: "fire-smoke-damage",
    slug: "fire-smoke-damage",
    title: "Fire & Smoke Damage Report",
    description:
      "Fire damage assessment with smoke penetration analysis, structural integrity, and content inventory.",
    category: TEMPLATE_CATEGORIES.RESTORATION,
    tags: ["fire", "smoke", "structural", "contents"],
    thumbnailKey: "templates/fire-smoke-damage/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.8.0",
  },
  {
    id: "mold-remediation",
    slug: "mold-remediation-protocol",
    title: "Mold Remediation Protocol",
    description:
      "Mold inspection and remediation protocol with air quality testing, containment procedures, and clearance testing plan. IICRC S520 compliant.",
    category: TEMPLATE_CATEGORIES.RESTORATION,
    tags: ["mold", "remediation", "air-quality", "iicrc"],
    thumbnailKey: "templates/mold-remediation/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.6.0",
  },
  {
    id: "wind-damage-assessment",
    slug: "wind-damage-assessment",
    title: "Wind Damage Assessment",
    description:
      "Wind and tornado damage report with structural analysis, debris impact assessment, and wind speed estimation.",
    category: TEMPLATE_CATEGORIES.RESTORATION,
    tags: ["wind", "tornado", "structural", "debris"],
    thumbnailKey: "templates/wind-damage-assessment/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.5.0",
  },
  {
    id: "lightning-strike",
    slug: "lightning-strike-assessment",
    title: "Lightning Strike Assessment",
    description:
      "Lightning damage evaluation including electrical system testing, surge damage documentation, and fire investigation.",
    category: TEMPLATE_CATEGORIES.RESTORATION,
    tags: ["lightning", "electrical", "surge", "fire"],
    thumbnailKey: "templates/lightning-strike/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.2.0",
  },
  {
    id: "vandalism-breakin",
    slug: "vandalism-break-in-report",
    title: "Vandalism & Break-In Report",
    description:
      "Property damage documentation for vandalism and break-ins with security recommendation and loss inventory.",
    category: TEMPLATE_CATEGORIES.RESTORATION,
    tags: ["vandalism", "break-in", "security", "inventory"],
    thumbnailKey: "templates/vandalism-breakin/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.0.0",
  },
  {
    id: "weather-correlation",
    slug: "weather-correlation-premium",
    title: "Weather Correlation Report",
    description:
      "Advanced weather verification with NOAA data, storm tracking, and causation analysis for insurance claims.",
    category: TEMPLATE_CATEGORIES.RESTORATION,
    tags: ["weather", "noaa", "storm", "verification"],
    thumbnailKey: "templates/weather-correlation-premium/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "2.2.0",
  },
  {
    id: "commercial-property",
    slug: "commercial-property-assessment",
    title: "Commercial Property Assessment",
    description:
      "Professional commercial property damage assessment and repair scope for multi-unit and business properties.",
    category: TEMPLATE_CATEGORIES.RESTORATION,
    tags: ["commercial", "property", "multi-unit", "business"],
    thumbnailKey: "templates/commercial-property/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.4.0",
  },

  // ═══════════════════════════════════════════════════════════
  // SUPPLEMENTS (5 templates)
  // ═══════════════════════════════════════════════════════════
  {
    id: "supplement-line-item",
    slug: "supplement-line-item-premium",
    title: "Line Item Supplement Request",
    description:
      "Detailed supplement documentation with line item justifications, photos, and pricing comparisons.",
    category: TEMPLATE_CATEGORIES.SUPPLEMENTS,
    tags: ["supplement", "line-item", "justification", "pricing"],
    thumbnailKey: "templates/supplement-line-item-premium/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.9.0",
  },
  {
    id: "carrier-rebuttal",
    slug: "carrier-rebuttal-premium",
    title: "Carrier Rebuttal Letter",
    description:
      "Professional carrier rebuttal with technical analysis, code references, and expert opinions.",
    category: TEMPLATE_CATEGORIES.SUPPLEMENTS,
    tags: ["carrier", "rebuttal", "letter", "expert"],
    thumbnailKey: "templates/carrier-rebuttal-premium/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "2.0.0",
  },
  {
    id: "depreciation-analysis",
    slug: "depreciation-analysis-premium",
    title: "Depreciation Analysis Report",
    description:
      "Detailed depreciation challenge with material lifecycle analysis and actual cash value review.",
    category: TEMPLATE_CATEGORIES.SUPPLEMENTS,
    tags: ["depreciation", "acv", "rcv", "analysis"],
    thumbnailKey: "templates/depreciation-analysis-premium/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.7.0",
  },
  {
    id: "code-upgrade-justification",
    slug: "code-upgrade-justification",
    title: "Code Upgrade Justification",
    description:
      "Building code upgrade documentation with ordinance references and cost breakdowns.",
    category: TEMPLATE_CATEGORIES.SUPPLEMENTS,
    tags: ["code", "upgrade", "ordinance", "compliance"],
    thumbnailKey: "templates/code-upgrade-justification/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.3.0",
  },
  {
    id: "hidden-damage-report",
    slug: "hidden-damage-report",
    title: "Hidden Damage Disclosure",
    description:
      "Documentation of concealed damage discovered during repairs with scope revision justification.",
    category: TEMPLATE_CATEGORIES.SUPPLEMENTS,
    tags: ["hidden", "concealed", "discovery", "scope"],
    thumbnailKey: "templates/hidden-damage-report/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.1.0",
  },

  // ═══════════════════════════════════════════════════════════
  // RETAIL & QUOTES (5 templates)
  // ═══════════════════════════════════════════════════════════
  {
    id: "contractor-estimate",
    slug: "contractor-estimate-premium",
    title: "Professional Contractor Estimate",
    description:
      "Branded retail estimate for residential and commercial projects with detailed line items and financing options.",
    category: TEMPLATE_CATEGORIES.RETAIL,
    tags: ["estimate", "quote", "retail", "contractor"],
    thumbnailKey: "templates/contractor-estimate-premium/thumbnail.png",
    previewMode: "retail",
    intendedUse: "retail",
    version: "2.3.0",
  },
  {
    id: "roof-replacement-quote",
    slug: "roof-replacement-quote",
    title: "Roof Replacement Quote",
    description:
      "Detailed roof replacement quote with material options, warranty comparison, and payment terms.",
    category: TEMPLATE_CATEGORIES.RETAIL,
    tags: ["roof", "replacement", "quote", "warranty"],
    thumbnailKey: "templates/roof-replacement-quote/thumbnail.png",
    previewMode: "retail",
    intendedUse: "retail",
    version: "1.8.0",
  },
  {
    id: "maintenance-proposal",
    slug: "maintenance-proposal",
    title: "Preventive Maintenance Proposal",
    description:
      "Comprehensive maintenance plan proposal with inspection schedule and service agreement.",
    category: TEMPLATE_CATEGORIES.RETAIL,
    tags: ["maintenance", "preventive", "service", "agreement"],
    thumbnailKey: "templates/maintenance-proposal/thumbnail.png",
    previewMode: "retail",
    intendedUse: "retail",
    version: "1.0.0",
  },
  {
    id: "repair-authorization",
    slug: "repair-authorization",
    title: "Repair Authorization Form",
    description:
      "Homeowner authorization form with scope description, pricing, and terms & conditions.",
    category: TEMPLATE_CATEGORIES.RETAIL,
    tags: ["authorization", "form", "repair", "agreement"],
    thumbnailKey: "templates/repair-authorization/thumbnail.png",
    previewMode: "retail",
    intendedUse: "retail",
    version: "1.2.0",
  },
  {
    id: "warranty-certificate",
    slug: "warranty-certificate",
    title: "Workmanship Warranty Certificate",
    description:
      "Professional warranty certificate with coverage details and maintenance requirements.",
    category: TEMPLATE_CATEGORIES.RETAIL,
    tags: ["warranty", "certificate", "workmanship", "guarantee"],
    thumbnailKey: "templates/warranty-certificate/thumbnail.png",
    previewMode: "retail",
    intendedUse: "retail",
    version: "1.1.0",
  },

  // ═══════════════════════════════════════════════════════════
  // LEGAL & APPRAISAL (4 templates)
  // ═══════════════════════════════════════════════════════════
  {
    id: "appraisal-umpire",
    slug: "appraisal-umpire-report",
    title: "Appraisal & Umpire Report",
    description:
      "Independent appraisal report for dispute resolution with detailed scope analysis and valuation.",
    category: TEMPLATE_CATEGORIES.LEGAL,
    tags: ["appraisal", "umpire", "dispute", "valuation"],
    thumbnailKey: "templates/appraisal-umpire/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.5.0",
  },
  {
    id: "expert-witness",
    slug: "expert-witness-report",
    title: "Expert Witness Report",
    description:
      "Litigation support report with technical analysis, causation opinion, and professional credentials.",
    category: TEMPLATE_CATEGORIES.LEGAL,
    tags: ["expert", "witness", "litigation", "testimony"],
    thumbnailKey: "templates/expert-witness/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.4.0",
  },
  {
    id: "pre-litigation-demand",
    slug: "pre-litigation-demand",
    title: "Pre-Litigation Demand Letter",
    description:
      "Professional demand letter with detailed claim summary, documentation, and settlement terms.",
    category: TEMPLATE_CATEGORIES.LEGAL,
    tags: ["demand", "letter", "litigation", "settlement"],
    thumbnailKey: "templates/pre-litigation-demand/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.0.0",
  },
  {
    id: "bad-faith-documentation",
    slug: "bad-faith-documentation",
    title: "Bad Faith Documentation",
    description:
      "Comprehensive bad faith claim documentation with timeline, policy violations, and damages.",
    category: TEMPLATE_CATEGORIES.LEGAL,
    tags: ["bad-faith", "documentation", "policy", "violations"],
    thumbnailKey: "templates/bad-faith-documentation/thumbnail.png",
    previewMode: "claim",
    intendedUse: "claim",
    version: "1.2.0",
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): TemplateDefinition | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get template by slug
 */
export function getTemplateBySlug(slug: string): TemplateDefinition | undefined {
  return ALL_TEMPLATES.find((t) => t.slug === slug);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): TemplateDefinition[] {
  return ALL_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  return Object.values(TEMPLATE_CATEGORIES);
}
