/**
 * PHASE 41: Carrier Rules Database
 * 
 * Comprehensive carrier-specific compliance rules for major insurance carriers.
 * These rules determine what line items are allowed, required, or denied by each carrier.
 */

export interface CarrierRule {
  carrierName: string;
  requiresStarterRake: boolean;
  allowsIceAndWater: boolean;
  dripEdgeRequired: boolean;
  overheadProfitAllowed: boolean;
  wasteLimitPercent?: number;
  lineItemLimits: string[]; // Format: "CODE <= MAX_AMOUNT/UNIT"
  requiredItems: string[]; // Line item codes that MUST be included
  deniedItems: string[]; // Line item codes that will be automatically denied
  codeUpgradeRules: string[];
  notes: string[];
  documentationRequirements: string[];
}

/**
 * Carrier-specific compliance rules
 * Based on industry standards and carrier guidelines
 */
export const CARRIER_RULES: Record<string, CarrierRule> = {
  "State Farm": {
    carrierName: "State Farm",
    requiresStarterRake: true,
    allowsIceAndWater: true,
    dripEdgeRequired: true,
    overheadProfitAllowed: true,
    wasteLimitPercent: 15,
    lineItemLimits: [
      "RFG220 <= 350/SQ", // Architectural shingles max price
      "RFG110 <= 250/SQ", // 3-tab shingles max price
      "RFG410 <= 8/LF",   // Drip edge max price
      "RFG330 <= 12/LF",  // Starter strip max price
    ],
    requiredItems: [
      "RFG330", // Starter strip
      "RFG410", // Drip edge
      "RFG210", // Underlayment
    ],
    deniedItems: [
      // State Farm rarely denies standard items
    ],
    codeUpgradeRules: [
      "Must provide building permit if structure >500 SF",
      "Deck replacement requires photos of rot/damage",
      "Ventilation upgrades require IRC 2021 citation",
    ],
    notes: [
      "State Farm requires clear photo proof of deck damage before approval",
      "O&P allowed when 3+ trades are involved",
      "Ice and water shield allowed in cold climates (2+ rows)",
      "Starter strip required on all eave and rake edges",
      "Will request itemized breakdown for any line item >$5000",
    ],
    documentationRequirements: [
      "Photos of all damaged areas",
      "Detailed scope of work",
      "Proof of deck damage (if claiming replacement)",
      "Building permit (for structural changes)",
    ],
  },

  "Farmers": {
    carrierName: "Farmers",
    requiresStarterRake: false,
    allowsIceAndWater: true,
    dripEdgeRequired: true,
    overheadProfitAllowed: false, // STRICT: Must prove GC supervision
    wasteLimitPercent: 10,
    lineItemLimits: [
      "RFG220 <= 325/SQ",
      "RFG110 <= 225/SQ",
      "RFG410 <= 7/LF",
      "RFG330 <= 10/LF",
    ],
    requiredItems: [
      "RFG410", // Drip edge mandatory
      "RFG210", // Underlayment
    ],
    deniedItems: [
      "RFG910", // Code upgrade items often denied without proof
    ],
    codeUpgradeRules: [
      "O&P denied unless GC provides subcontractor contracts",
      "Ventilation upgrades denied unless code violation cited",
      "Deck replacement requires engineer report if >25% damaged",
    ],
    notes: [
      "Farmers denies O&P unless GC proves active supervision of 3+ subs",
      "Starter strip on rake edges often denied (not code required)",
      "Ice and water shield limited to 1 row unless wind-driven rain documented",
      "Waste factor capped at 10% - provide justification for higher",
      "Very strict on code upgrade documentation",
    ],
    documentationRequirements: [
      "Photos from multiple angles",
      "Subcontractor agreements (for O&P)",
      "Building code citations (for upgrades)",
      "Material invoices (for verification)",
    ],
  },

  "USAA": {
    carrierName: "USAA",
    requiresStarterRake: true,
    allowsIceAndWater: true,
    dripEdgeRequired: true,
    overheadProfitAllowed: true,
    wasteLimitPercent: 10, // STRICT: 10% maximum
    lineItemLimits: [
      "RFG220 <= 340/SQ",
      "RFG110 <= 240/SQ",
      "RFG410 <= 7.5/LF",
      "RFG330 <= 11/LF",
    ],
    requiredItems: [
      "RFG330", // Starter strip
      "RFG410", // Drip edge
      "RFG210", // Underlayment
    ],
    deniedItems: [
      // USAA is generally fair but strict on quantities
    ],
    codeUpgradeRules: [
      "Ventilation upgrades reviewed carefully - must cite IRC section",
      "Deck replacement requires detailed photos + moisture readings",
      "Solar panel removal/reinstall requires licensed electrician invoice",
    ],
    notes: [
      "USAA reviews ventilation upgrades very carefully - cite IRC 806.2",
      "Waste factor MUST NOT exceed 10% without exceptional justification",
      "O&P allowed for complex projects with 3+ trades",
      "Very responsive to code citations and engineer reports",
      "Fair carrier but requires detailed documentation",
    ],
    documentationRequirements: [
      "Comprehensive photo documentation",
      "IRC/IBC code citations for upgrades",
      "Licensed contractor certifications",
      "Detailed measurements and calculations",
    ],
  },

  "Allstate": {
    carrierName: "Allstate",
    requiresStarterRake: true,
    allowsIceAndWater: false, // STRICT: Often denied unless proven necessary
    dripEdgeRequired: true,
    overheadProfitAllowed: false, // Very strict
    wasteLimitPercent: 8, // VERY STRICT
    lineItemLimits: [
      "RFG220 <= 310/SQ",
      "RFG110 <= 220/SQ",
      "RFG410 <= 6.5/LF",
      "RFG330 <= 9/LF",
    ],
    requiredItems: [
      "RFG410", // Drip edge
      "RFG210", // Underlayment (felt only, synthetic often denied)
    ],
    deniedItems: [
      "RFG215", // Ice and water shield (unless proven necessary)
      "RFG910", // Code upgrades without explicit proof
      "RFG920", // Non-code required ventilation
    ],
    codeUpgradeRules: [
      "Code upgrades denied unless building inspector requires in writing",
      "Must provide letter from AHJ (Authority Having Jurisdiction)",
      "Deck replacement rarely approved without engineer involvement",
    ],
    notes: [
      "Allstate is VERY strict on code upgrade proof - need AHJ letter",
      "Ice and water shield often denied - must prove wind-driven rain damage",
      "O&P almost always denied - exceptional circumstances only",
      "Waste factor capped at 8% - highly scrutinized",
      "Remove unnecessary upgrades before submission",
      "Synthetic underlayment often rejected in favor of felt",
      "Most difficult carrier to negotiate with",
    ],
    documentationRequirements: [
      "Authority Having Jurisdiction (AHJ) letters for code upgrades",
      "Building inspector reports",
      "Engineer structural reports",
      "Extensive photo documentation",
      "Proof of necessity for ALL upgrades",
    ],
  },

  "Liberty Mutual": {
    carrierName: "Liberty Mutual",
    requiresStarterRake: true,
    allowsIceAndWater: true,
    dripEdgeRequired: true,
    overheadProfitAllowed: true,
    wasteLimitPercent: 12,
    lineItemLimits: [
      "RFG220 <= 335/SQ",
      "RFG110 <= 235/SQ",
      "RFG410 <= 7/LF",
      "RFG330 <= 10.5/LF",
    ],
    requiredItems: [
      "RFG330", // Starter strip
      "RFG410", // Drip edge
      "RFG210", // Underlayment
    ],
    deniedItems: [],
    codeUpgradeRules: [
      "Reasonable on code upgrades with proper documentation",
      "Building permit required for structural work",
    ],
    notes: [
      "Liberty Mutual is generally reasonable and fair",
      "O&P allowed with proper justification",
      "Code upgrades approved with building code citations",
      "Responsive to contractor estimates",
    ],
    documentationRequirements: [
      "Standard photo documentation",
      "Building code citations when applicable",
      "Licensed contractor information",
    ],
  },

  "Nationwide": {
    carrierName: "Nationwide",
    requiresStarterRake: true,
    allowsIceAndWater: true,
    dripEdgeRequired: true,
    overheadProfitAllowed: true,
    wasteLimitPercent: 12,
    lineItemLimits: [
      "RFG220 <= 330/SQ",
      "RFG110 <= 230/SQ",
      "RFG410 <= 7/LF",
      "RFG330 <= 10/LF",
    ],
    requiredItems: [
      "RFG330", // Starter strip
      "RFG410", // Drip edge
      "RFG210", // Underlayment
    ],
    deniedItems: [],
    codeUpgradeRules: [
      "Fair on code upgrades with documentation",
      "Ventilation upgrades approved with IRC citation",
    ],
    notes: [
      "Nationwide is fair and cooperative",
      "O&P allowed for complex projects",
      "Reasonable waste factors accepted",
      "Good communication with contractors",
    ],
    documentationRequirements: [
      "Standard documentation requirements",
      "Photos of damage",
      "Code citations for upgrades",
    ],
  },
};

/**
 * Get carrier rules by name (case-insensitive)
 */
export function getCarrierRules(carrierName: string): CarrierRule | null {
  const normalized = carrierName.trim();
  
  // Exact match
  if (CARRIER_RULES[normalized]) {
    return CARRIER_RULES[normalized];
  }
  
  // Case-insensitive match
  const key = Object.keys(CARRIER_RULES).find(
    k => k.toLowerCase() === normalized.toLowerCase()
  );
  
  return key ? CARRIER_RULES[key] : null;
}

/**
 * Get all supported carrier names
 */
export function getSupportedCarriers(): string[] {
  return Object.keys(CARRIER_RULES);
}

/**
 * Check if a carrier is supported
 */
export function isCarrierSupported(carrierName: string): boolean {
  return getCarrierRules(carrierName) !== null;
}

/**
 * Get carrier strictness score (0-10, 10 = most strict)
 */
export function getCarrierStrictnessScore(carrierName: string): number {
  const rules = getCarrierRules(carrierName);
  if (!rules) return 5; // Default middle score
  
  let score = 0;
  
  // Factors that increase strictness
  if (!rules.overheadProfitAllowed) score += 3;
  if (!rules.allowsIceAndWater) score += 2;
  if (rules.wasteLimitPercent && rules.wasteLimitPercent < 10) score += 2;
  if (rules.deniedItems.length > 0) score += 1;
  if (rules.codeUpgradeRules.some(r => r.includes("denied"))) score += 2;
  
  return Math.min(score, 10);
}
