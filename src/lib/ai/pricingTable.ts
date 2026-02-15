/**
 * PHASE 40: Pricing Table
 * 
 * Base pricing for common roofing line items.
 * Prices are averages for Arizona market (2025).
 */

export interface PricingItem {
  unitPrice: number;
  unit: string;
  description: string;
}

export const BASE_PRICING: Record<string, PricingItem> = {
  // Roofing General
  RFG220: {
    unitPrice: 325.0,
    unit: "SQ",
    description: "Remove & Replace Architectural Shingles",
  },
  RFG300: {
    unitPrice: 4.5,
    unit: "LF",
    description: "Ridge Cap Shingles",
  },
  RFG310: {
    unitPrice: 5.25,
    unit: "LF",
    description: "Hip Cap Shingles",
  },

  // Drip Edge
  DRP100: {
    unitPrice: 4.0,
    unit: "LF",
    description: "Aluminum Drip Edge",
  },

  // Penetrations
  PJK100: {
    unitPrice: 65.0,
    unit: "EA",
    description: "Pipe Jack Flashing",
  },

  // Ventilation
  VNT200: {
    unitPrice: 95.0,
    unit: "EA",
    description: "Roof Vent (Static)",
  },
  VNT250: {
    unitPrice: 125.0,
    unit: "EA",
    description: "Roof Vent (Power)",
  },

  // Underlayment
  UND100: {
    unitPrice: 85.0,
    unit: "SQ",
    description: "Synthetic Underlayment",
  },
  UND150: {
    unitPrice: 45.0,
    unit: "SQ",
    description: "Felt Underlayment (#30)",
  },

  // Starter & Accessories
  STR100: {
    unitPrice: 3.0,
    unit: "LF",
    description: "Starter Strip",
  },

  // Valley
  VAL100: {
    unitPrice: 12.0,
    unit: "LF",
    description: "Valley Flashing (Metal)",
  },
  VAL200: {
    unitPrice: 6.5,
    unit: "LF",
    description: "Valley Flashing (Woven)",
  },

  // Decking
  DEC100: {
    unitPrice: 125.0,
    unit: "SQ",
    description: "Plywood Decking Replacement (7/16\")",
  },
  DEC150: {
    unitPrice: 145.0,
    unit: "SQ",
    description: "Plywood Decking Replacement (1/2\")",
  },

  // Special Charges
  STEEP: {
    unitPrice: 75.0,
    unit: "SQ",
    description: "Steep Pitch Charge (>7/12)",
  },
  SAFETY: {
    unitPrice: 50.0,
    unit: "SQ",
    description: "Safety Equipment Charge",
  },

  // Chimney Flashing
  CHM100: {
    unitPrice: 285.0,
    unit: "EA",
    description: "Chimney Flashing",
  },

  // Skylights
  SKY100: {
    unitPrice: 350.0,
    unit: "EA",
    description: "Skylight Reflashing",
  },
  SKY200: {
    unitPrice: 850.0,
    unit: "EA",
    description: "Skylight Replacement",
  },
};

/**
 * Get pricing for a specific code
 */
export function getPricing(code: string): PricingItem | null {
  return BASE_PRICING[code] || null;
}

/**
 * Check if a code exists in pricing table
 */
export function hasPricing(code: string): boolean {
  return code in BASE_PRICING;
}

/**
 * Get all available codes
 */
export function getAllCodes(): string[] {
  return Object.keys(BASE_PRICING);
}
