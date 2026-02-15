/**
 * Xactimate Line Item Code Library
 * For SkaiScraper Supplement Builder & Damage Builder
 * 
 * @module xactimate-codes
 * @description Complete library of Xactimate codes with justifications and IRC references
 */

export type XactimateUnit = 
  | "SQ"   // Squares (100 sq ft)
  | "LF"   // Linear Feet
  | "SF"   // Square Feet
  | "EA"   // Each
  | "HR"   // Hour
  | "DAY"  // Day
  | "CY"   // Cubic Yard
  | "TON"  // Ton

export type XactimateCategory =
  | "Roofing"
  | "Gutters"
  | "Siding"
  | "Windows"
  | "Doors"
  | "Paint"
  | "Drywall"
  | "Flooring"
  | "Structural"
  | "HVAC"
  | "Plumbing"
  | "Electrical"
  | "Fencing"
  | "Decking"
  | "Insulation"

export interface XactimateCode {
  code: string;
  name: string;
  category: XactimateCategory;
  unit: XactimateUnit;
  description: string;
  justification?: string;
  codeReferences?: string[]; // IRC codes, manufacturer specs
  requiredFor?: string[]; // e.g., ["asphalt_shingle", "tile"]
  manufacturer?: string;
  typicalUnitPrice?: number; // Rough estimate for calculations
}

// ============================================================================
// ROOFING CODES
// ============================================================================

export const ROOFING_CODES: XactimateCode[] = [
  {
    code: "RFG",
    name: "Roof - General",
    category: "Roofing",
    unit: "SQ",
    description: "Asphalt shingle roofing system",
    justification: "Industry standard for residential roofing",
    typicalUnitPrice: 350
  },
  {
    code: "RFG+IWS",
    name: "Ice & Water Shield",
    category: "Roofing",
    unit: "LF",
    description: "Self-adhesive waterproofing underlayment",
    justification: "Required by IRC R905.2.8.3 and manufacturer warranty. Must be installed at eaves, valleys, and penetrations.",
    codeReferences: ["IRC R905.2.8.3", "IRC R905.2.7"],
    requiredFor: ["asphalt_shingle", "tile", "metal"],
    typicalUnitPrice: 5
  },
  {
    code: "RFG+START",
    name: "Starter Strip",
    category: "Roofing",
    unit: "LF",
    description: "Starter course shingles at eaves and rakes",
    justification: "Required by manufacturer installation requirements and IRC R905.2.8.1 for proper shingle alignment and wind resistance.",
    codeReferences: ["IRC R905.2.8.1"],
    requiredFor: ["asphalt_shingle"],
    typicalUnitPrice: 3
  },
  {
    code: "RFG+UL",
    name: "Synthetic Underlayment",
    category: "Roofing",
    unit: "SQ",
    description: "Synthetic roofing underlayment",
    justification: "Required by IRC R905.2.7 for roof protection and secondary water barrier.",
    codeReferences: ["IRC R905.2.7"],
    typicalUnitPrice: 35
  },
  {
    code: "RFG+RIDGE",
    name: "Ridge Cap Shingles",
    category: "Roofing",
    unit: "LF",
    description: "Ridge cap shingles for roof ridge",
    justification: "Required for weather protection and manufacturer warranty compliance at all ridge lines.",
    requiredFor: ["asphalt_shingle"],
    typicalUnitPrice: 7
  },
  {
    code: "RFG+HIP",
    name: "Hip Cap Shingles",
    category: "Roofing",
    unit: "LF",
    description: "Hip cap shingles for roof hips",
    justification: "Required for weather protection at hip transitions and to maintain manufacturer warranty.",
    typicalUnitPrice: 7
  },
  {
    code: "RFG+DRIP",
    name: "Drip Edge",
    category: "Roofing",
    unit: "LF",
    description: "Metal drip edge at eaves and rakes",
    justification: "Required by IRC R905.2.8.5 and manufacturer warranty for proper water shedding and fascia protection.",
    codeReferences: ["IRC R905.2.8.5"],
    requiredFor: ["asphalt_shingle", "tile", "metal"],
    typicalUnitPrice: 2
  },
  {
    code: "RFG+VM",
    name: "Valley Metal",
    category: "Roofing",
    unit: "LF",
    description: "Metal valley flashing",
    justification: "Required for proper water drainage and code compliance per IRC R905.2.8.2.",
    codeReferences: ["IRC R905.2.8.2"],
    typicalUnitPrice: 12
  },
  {
    code: "RFG+JFLASH",
    name: "Step Flashing",
    category: "Roofing",
    unit: "EA",
    description: "Step flashing at wall intersections",
    justification: "Required by IRC R903.2 for water protection at vertical surfaces and wall/roof junctions.",
    codeReferences: ["IRC R903.2"],
    typicalUnitPrice: 8
  },
  {
    code: "RFG+VENT",
    name: "Roof Vent",
    category: "Roofing",
    unit: "EA",
    description: "Roof penetration vent boot",
    justification: "Required for proper ventilation and pipe penetration sealing per IRC R806.",
    codeReferences: ["IRC R806"],
    typicalUnitPrice: 35
  },
  {
    code: "RFG+TEAR",
    name: "Tear Off",
    category: "Roofing",
    unit: "SQ",
    description: "Remove existing roofing material",
    justification: "Required before new roof installation per manufacturer specs and to inspect decking.",
    typicalUnitPrice: 75
  },
  {
    code: "RFG+DECK",
    name: "Roof Decking",
    category: "Roofing",
    unit: "SF",
    description: "Plywood or OSB roof decking replacement",
    justification: "Required by IRC R803 for structural integrity when existing decking is damaged or rotted.",
    codeReferences: ["IRC R803"],
    typicalUnitPrice: 3
  },
  {
    code: "RFG+COMP",
    name: "Composition Shingles",
    category: "Roofing",
    unit: "SQ",
    description: "Architectural composition shingles",
    justification: "Standard roofing material replacement for storm damage.",
    typicalUnitPrice: 125
  }
];

// ============================================================================
// GUTTER CODES
// ============================================================================

export const GUTTER_CODES: XactimateCode[] = [
  {
    code: "GUTR",
    name: "Gutter - 5 inch K-style",
    category: "Gutters",
    unit: "LF",
    description: "5-inch K-style seamless gutter",
    justification: "Industry standard for residential drainage systems.",
    typicalUnitPrice: 8
  },
  {
    code: "GUTR+RA",
    name: "Gutter - Remove and Replace",
    category: "Gutters",
    unit: "LF",
    description: "Remove existing and install new gutter system",
    justification: "Required when existing gutters are damaged beyond repair from storm impact.",
    typicalUnitPrice: 12
  },
  {
    code: "GUTR+DL",
    name: "Gutter - Detach and Reset",
    category: "Gutters",
    unit: "LF",
    description: "Detach and reset existing gutter",
    justification: "Required when gutters must be temporarily removed for roof work.",
    typicalUnitPrice: 4
  },
  {
    code: "GUTR+HANG",
    name: "Gutter Hangers",
    category: "Gutters",
    unit: "EA",
    description: "Hidden gutter hangers",
    justification: "Required every 24 inches per manufacturer specifications for proper support.",
    typicalUnitPrice: 3
  },
  {
    code: "GUTR+DS",
    name: "Downspout",
    category: "Gutters",
    unit: "LF",
    description: "3x4 inch aluminum downspout",
    justification: "Required for proper water discharge from gutter system.",
    typicalUnitPrice: 6
  },
  {
    code: "GUTR+ELBOW",
    name: "Downspout Elbow",
    category: "Gutters",
    unit: "EA",
    description: "Downspout elbow fitting",
    justification: "Required for proper downspout routing around building features.",
    typicalUnitPrice: 8
  },
  {
    code: "GUTR+GUARD",
    name: "Gutter Guard",
    category: "Gutters",
    unit: "LF",
    description: "Gutter guard/leaf protection system",
    justification: "Recommended upgrade for debris protection and maintenance reduction.",
    typicalUnitPrice: 10
  }
];

// ============================================================================
// PAINT CODES
// ============================================================================

export const PAINT_CODES: XactimateCode[] = [
  {
    code: "PNT",
    name: "Paint - Exterior",
    category: "Paint",
    unit: "SF",
    description: "Exterior paint application",
    justification: "Required for matching existing finish after repairs per matching principles.",
    typicalUnitPrice: 2
  },
  {
    code: "PNT+BLND",
    name: "Paint - Blend",
    category: "Paint",
    unit: "SF",
    description: "Paint blend to match existing",
    justification: "Required to maintain aesthetic continuity per matching and blending principles.",
    typicalUnitPrice: 2.5
  },
  {
    code: "PNT+PRMR",
    name: "Primer",
    category: "Paint",
    unit: "SF",
    description: "Exterior primer application",
    justification: "Required by manufacturer for proper paint adhesion to new or bare surfaces.",
    typicalUnitPrice: 1.5
  },
  {
    code: "PNT+SPOT",
    name: "Spot Paint",
    category: "Paint",
    unit: "SF",
    description: "Spot paint repair",
    justification: "Required for localized damage repairs to maintain finish.",
    typicalUnitPrice: 3
  }
];

// ============================================================================
// WINDOW & SCREEN CODES
// ============================================================================

export const WINDOW_CODES: XactimateCode[] = [
  {
    code: "WDSCR",
    name: "Window Screen",
    category: "Windows",
    unit: "EA",
    description: "Window screen replacement",
    justification: "Storm damage to existing screens - commonly damaged in hail/wind events.",
    typicalUnitPrice: 35
  },
  {
    code: "WDTRIM",
    name: "Window Trim",
    category: "Windows",
    unit: "LF",
    description: "Exterior window trim replacement",
    justification: "Storm damage or required for water protection at window openings.",
    typicalUnitPrice: 8
  },
  {
    code: "WDCAS",
    name: "Window Casing",
    category: "Windows",
    unit: "LF",
    description: "Window casing trim",
    justification: "Required when existing casing is damaged or replaced.",
    typicalUnitPrice: 6
  }
];

// ============================================================================
// SIDING CODES
// ============================================================================

export const SIDING_CODES: XactimateCode[] = [
  {
    code: "SDG",
    name: "Siding - Vinyl",
    category: "Siding",
    unit: "SQ",
    description: "Vinyl siding replacement",
    justification: "Storm damage to existing siding - replace to match existing.",
    typicalUnitPrice: 450
  },
  {
    code: "SDG+HARDIE",
    name: "Siding - Fiber Cement",
    category: "Siding",
    unit: "SF",
    description: "Fiber cement siding (Hardie Board)",
    justification: "Matching existing material type per storm damage.",
    manufacturer: "James Hardie",
    typicalUnitPrice: 8
  },
  {
    code: "FASCIA",
    name: "Fascia Board",
    category: "Siding",
    unit: "LF",
    description: "Fascia board replacement",
    justification: "Storm damage or rot requiring replacement for structural integrity.",
    typicalUnitPrice: 10
  },
  {
    code: "SOFFIT",
    name: "Soffit",
    category: "Siding",
    unit: "SF",
    description: "Soffit panel replacement",
    justification: "Storm damage to soffit panels - replace to maintain ventilation and appearance.",
    typicalUnitPrice: 6
  },
  {
    code: "STUCCO",
    name: "Stucco Repair",
    category: "Siding",
    unit: "SF",
    description: "Stucco patch and repair",
    justification: "Storm damage to stucco exterior requiring patch and texture match.",
    typicalUnitPrice: 12
  }
];

// ============================================================================
// DRYWALL & INTERIOR CODES
// ============================================================================

export const INTERIOR_CODES: XactimateCode[] = [
  {
    code: "DWL",
    name: "Drywall",
    category: "Drywall",
    unit: "SF",
    description: "Drywall replacement",
    justification: "Water damage or structural damage requiring drywall replacement.",
    typicalUnitPrice: 3
  },
  {
    code: "DWL+TEX",
    name: "Drywall - Texture",
    category: "Drywall",
    unit: "SF",
    description: "Drywall texture application",
    justification: "Required to match existing texture after repairs.",
    typicalUnitPrice: 1.5
  },
  {
    code: "PNT+INT",
    name: "Paint - Interior",
    category: "Paint",
    unit: "SF",
    description: "Interior paint application",
    justification: "Required after drywall repairs to match existing finish.",
    typicalUnitPrice: 2
  }
];

// ============================================================================
// MASTER CODE DATABASE
// ============================================================================

export const ALL_XACTIMATE_CODES: XactimateCode[] = [
  ...ROOFING_CODES,
  ...GUTTER_CODES,
  ...PAINT_CODES,
  ...WINDOW_CODES,
  ...SIDING_CODES,
  ...INTERIOR_CODES
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Find a code by exact code match or name search
 */
export function findCodeByName(name: string): XactimateCode | undefined {
  const normalized = name.toUpperCase().trim();
  return ALL_XACTIMATE_CODES.find(
    (c) => c.code.toUpperCase() === normalized || 
           c.name.toLowerCase().includes(name.toLowerCase())
  );
}

/**
 * Get all codes for a specific category
 */
export function getCodesByCategory(category: XactimateCategory): XactimateCode[] {
  return ALL_XACTIMATE_CODES.filter((c) => c.category === category);
}

/**
 * Search codes by keyword (searches code, name, and description)
 */
export function searchCodes(query: string): XactimateCode[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  return ALL_XACTIMATE_CODES.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.justification?.toLowerCase().includes(q)
  );
}

/**
 * Get code by exact code match
 */
export function getCodeByCode(code: string): XactimateCode | undefined {
  return ALL_XACTIMATE_CODES.find(
    (c) => c.code.toUpperCase() === code.toUpperCase().trim()
  );
}

/**
 * Get required codes for a roof type
 */
export function getRequiredCodesForRoofType(roofType: string): XactimateCode[] {
  return ALL_XACTIMATE_CODES.filter(
    (c) => c.requiredFor && c.requiredFor.includes(roofType)
  );
}

/**
 * Calculate estimated total for line items
 */
export function calculateLineItemTotal(
  code: string,
  quantity: number
): number | null {
  const codeData = getCodeByCode(code);
  if (!codeData || !codeData.typicalUnitPrice) return null;
  
  return Math.round(codeData.typicalUnitPrice * quantity * 100) / 100;
}

/**
 * Get all available categories
 */
export function getAllCategories(): XactimateCategory[] {
  const categories = new Set<XactimateCategory>();
  ALL_XACTIMATE_CODES.forEach((c) => categories.add(c.category));
  return Array.from(categories);
}

/**
 * Validate if a unit matches the code's expected unit
 */
export function validateUnit(code: string, unit: XactimateUnit): boolean {
  const codeData = getCodeByCode(code);
  return codeData ? codeData.unit === unit : false;
}
