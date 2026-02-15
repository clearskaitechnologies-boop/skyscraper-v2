/**
 * Comprehensive Trade Types Configuration
 *
 * Master list of all trade types supported on SkaiScraper.
 * This should be the single source of truth for trade types across the platform.
 *
 * Categories:
 * - Construction & Building
 * - Systems & Utilities
 * - Specialty Services
 * - Restoration & Remediation
 * - Outdoor & Exterior
 * - Technology & Security
 * - Specialty Contractors
 */

export interface TradeType {
  value: string;
  label: string;
  category: TradeCategory;
  icon?: string;
  description?: string;
}

export type TradeCategory =
  | "Construction & Building"
  | "Systems & Utilities"
  | "Specialty Services"
  | "Restoration & Remediation"
  | "Outdoor & Exterior"
  | "Technology & Security"
  | "Specialty Contractors"
  | "Other";

/**
 * Master list of all trade types
 * Organized by category for better UX
 */
export const TRADE_TYPES: TradeType[] = [
  // ============================================
  // CONSTRUCTION & BUILDING
  // ============================================
  {
    value: "General Contracting",
    label: "General Contracting",
    category: "Construction & Building",
  },
  { value: "Roofing", label: "Roofing", category: "Construction & Building" },
  { value: "Framing", label: "Framing", category: "Construction & Building" },
  { value: "Drywall", label: "Drywall", category: "Construction & Building" },
  { value: "Insulation", label: "Insulation", category: "Construction & Building" },
  { value: "Siding", label: "Siding", category: "Construction & Building" },
  { value: "Windows & Doors", label: "Windows & Doors", category: "Construction & Building" },
  { value: "Flooring", label: "Flooring", category: "Construction & Building" },
  { value: "Tile & Stone", label: "Tile & Stone", category: "Construction & Building" },
  { value: "Carpentry", label: "Carpentry", category: "Construction & Building" },
  { value: "Cabinetry", label: "Cabinetry", category: "Construction & Building" },
  { value: "Countertops", label: "Countertops", category: "Construction & Building" },
  { value: "Masonry", label: "Masonry", category: "Construction & Building" },
  { value: "Concrete", label: "Concrete", category: "Construction & Building" },
  { value: "Foundation Repair", label: "Foundation Repair", category: "Construction & Building" },
  {
    value: "Structural Engineering",
    label: "Structural Engineering",
    category: "Construction & Building",
  },

  // ============================================
  // SYSTEMS & UTILITIES
  // ============================================
  { value: "Electrical", label: "Electrical", category: "Systems & Utilities" },
  { value: "Plumbing", label: "Plumbing", category: "Systems & Utilities" },
  { value: "HVAC", label: "HVAC", category: "Systems & Utilities" },
  { value: "Gas Lines", label: "Gas Lines", category: "Systems & Utilities" },
  { value: "Septic Systems", label: "Septic Systems", category: "Systems & Utilities" },
  { value: "Well Drilling", label: "Well Drilling", category: "Systems & Utilities" },
  { value: "Water Treatment", label: "Water Treatment", category: "Systems & Utilities" },
  { value: "Generators", label: "Generators", category: "Systems & Utilities" },

  // ============================================
  // SPECIALTY SERVICES
  // ============================================
  { value: "Painting", label: "Painting", category: "Specialty Services" },
  { value: "Stucco", label: "Stucco", category: "Specialty Services" },
  { value: "Plastering", label: "Plastering", category: "Specialty Services" },
  { value: "Wallpaper", label: "Wallpaper", category: "Specialty Services" },
  { value: "Acoustic Ceilings", label: "Acoustic Ceilings", category: "Specialty Services" },
  { value: "Crown Molding", label: "Crown Molding", category: "Specialty Services" },
  { value: "Trim Work", label: "Trim Work", category: "Specialty Services" },
  { value: "Hardwood Refinishing", label: "Hardwood Refinishing", category: "Specialty Services" },
  { value: "Epoxy Flooring", label: "Epoxy Flooring", category: "Specialty Services" },
  { value: "Garage Doors", label: "Garage Doors", category: "Specialty Services" },
  { value: "Gutters", label: "Gutters", category: "Specialty Services" },
  { value: "Awnings & Shades", label: "Awnings & Shades", category: "Specialty Services" },

  // ============================================
  // RESTORATION & REMEDIATION
  // ============================================
  {
    value: "Water Damage Restoration",
    label: "Water Damage Restoration",
    category: "Restoration & Remediation",
  },
  {
    value: "Fire Damage Restoration",
    label: "Fire Damage Restoration",
    category: "Restoration & Remediation",
  },
  { value: "Smoke Damage", label: "Smoke Damage", category: "Restoration & Remediation" },
  { value: "Mold Remediation", label: "Mold Remediation", category: "Restoration & Remediation" },
  { value: "Biohazard Cleanup", label: "Biohazard Cleanup", category: "Restoration & Remediation" },
  {
    value: "Asbestos Abatement",
    label: "Asbestos Abatement",
    category: "Restoration & Remediation",
  },
  {
    value: "Lead Paint Removal",
    label: "Lead Paint Removal",
    category: "Restoration & Remediation",
  },
  {
    value: "Storm Damage Repair",
    label: "Storm Damage Repair",
    category: "Restoration & Remediation",
  },
  {
    value: "Hail Damage Repair",
    label: "Hail Damage Repair",
    category: "Restoration & Remediation",
  },
  {
    value: "Wind Damage Repair",
    label: "Wind Damage Repair",
    category: "Restoration & Remediation",
  },
  {
    value: "Emergency Board-Up",
    label: "Emergency Board-Up",
    category: "Restoration & Remediation",
  },
  {
    value: "Contents Restoration",
    label: "Contents Restoration",
    category: "Restoration & Remediation",
  },
  { value: "Document Recovery", label: "Document Recovery", category: "Restoration & Remediation" },
  { value: "Odor Removal", label: "Odor Removal", category: "Restoration & Remediation" },

  // ============================================
  // OUTDOOR & EXTERIOR
  // ============================================
  { value: "Landscaping", label: "Landscaping", category: "Outdoor & Exterior" },
  { value: "Lawn Care", label: "Lawn Care", category: "Outdoor & Exterior" },
  { value: "Tree Service", label: "Tree Service", category: "Outdoor & Exterior" },
  { value: "Irrigation Systems", label: "Irrigation Systems", category: "Outdoor & Exterior" },
  { value: "Fencing", label: "Fencing", category: "Outdoor & Exterior" },
  { value: "Decks & Patios", label: "Decks & Patios", category: "Outdoor & Exterior" },
  { value: "Pergolas & Gazebos", label: "Pergolas & Gazebos", category: "Outdoor & Exterior" },
  { value: "Outdoor Kitchens", label: "Outdoor Kitchens", category: "Outdoor & Exterior" },
  { value: "Pavers & Hardscaping", label: "Pavers & Hardscaping", category: "Outdoor & Exterior" },
  { value: "Retaining Walls", label: "Retaining Walls", category: "Outdoor & Exterior" },
  { value: "Driveways", label: "Driveways", category: "Outdoor & Exterior" },
  { value: "Outdoor Lighting", label: "Outdoor Lighting", category: "Outdoor & Exterior" },
  { value: "Pool Contractor", label: "Pool Contractor", category: "Outdoor & Exterior" },
  { value: "Pool Service", label: "Pool Service", category: "Outdoor & Exterior" },
  { value: "Hot Tub & Spa", label: "Hot Tub & Spa", category: "Outdoor & Exterior" },
  { value: "Pressure Washing", label: "Pressure Washing", category: "Outdoor & Exterior" },
  { value: "Exterior Cleaning", label: "Exterior Cleaning", category: "Outdoor & Exterior" },

  // ============================================
  // TECHNOLOGY & SECURITY
  // ============================================
  {
    value: "Smart Home & Technology",
    label: "Smart Home & Technology",
    category: "Technology & Security",
  },
  { value: "Security Systems", label: "Security Systems", category: "Technology & Security" },
  { value: "Security Cameras", label: "Security Cameras", category: "Technology & Security" },
  { value: "Access Control", label: "Access Control", category: "Technology & Security" },
  { value: "Home Automation", label: "Home Automation", category: "Technology & Security" },
  { value: "Audio/Visual", label: "Audio/Visual", category: "Technology & Security" },
  {
    value: "Networking & Cabling",
    label: "Networking & Cabling",
    category: "Technology & Security",
  },
  { value: "Solar", label: "Solar", category: "Technology & Security" },
  { value: "EV Charging", label: "EV Charging", category: "Technology & Security" },
  { value: "Home Theater", label: "Home Theater", category: "Technology & Security" },

  // ============================================
  // SPECIALTY CONTRACTORS
  // ============================================
  { value: "Pest Control", label: "Pest Control", category: "Specialty Contractors" },
  { value: "Termite Treatment", label: "Termite Treatment", category: "Specialty Contractors" },
  { value: "Wildlife Removal", label: "Wildlife Removal", category: "Specialty Contractors" },
  { value: "Chimney Services", label: "Chimney Services", category: "Specialty Contractors" },
  {
    value: "Fireplace Installation",
    label: "Fireplace Installation",
    category: "Specialty Contractors",
  },
  { value: "Window Tinting", label: "Window Tinting", category: "Specialty Contractors" },
  { value: "Window Cleaning", label: "Window Cleaning", category: "Specialty Contractors" },
  { value: "House Cleaning", label: "House Cleaning", category: "Specialty Contractors" },
  { value: "Carpet Cleaning", label: "Carpet Cleaning", category: "Specialty Contractors" },
  { value: "Junk Removal", label: "Junk Removal", category: "Specialty Contractors" },
  { value: "Moving Services", label: "Moving Services", category: "Specialty Contractors" },
  { value: "Appliance Repair", label: "Appliance Repair", category: "Specialty Contractors" },
  {
    value: "Appliance Installation",
    label: "Appliance Installation",
    category: "Specialty Contractors",
  },
  { value: "Handyman", label: "Handyman", category: "Specialty Contractors" },
  { value: "Home Inspection", label: "Home Inspection", category: "Specialty Contractors" },
  { value: "Radon Testing", label: "Radon Testing", category: "Specialty Contractors" },
  { value: "Energy Auditor", label: "Energy Auditor", category: "Specialty Contractors" },
  { value: "Interior Design", label: "Interior Design", category: "Specialty Contractors" },
  { value: "Closet Organization", label: "Closet Organization", category: "Specialty Contractors" },
  { value: "Glass & Mirror", label: "Glass & Mirror", category: "Specialty Contractors" },
  { value: "Locksmith", label: "Locksmith", category: "Specialty Contractors" },
  { value: "Welding", label: "Welding", category: "Specialty Contractors" },
  { value: "Ironwork", label: "Ironwork", category: "Specialty Contractors" },

  // ============================================
  // OTHER (always last)
  // ============================================
  { value: "Other", label: "Other", category: "Other" },
];

/**
 * Get flat list of trade type values (for dropdowns)
 */
export function getTradeTypeValues(): string[] {
  return TRADE_TYPES.map((t) => t.value);
}

/**
 * Get trade types grouped by category
 */
export function getTradeTypesByCategory(): Record<TradeCategory, TradeType[]> {
  const grouped: Record<TradeCategory, TradeType[]> = {
    "Construction & Building": [],
    "Systems & Utilities": [],
    "Specialty Services": [],
    "Restoration & Remediation": [],
    "Outdoor & Exterior": [],
    "Technology & Security": [],
    "Specialty Contractors": [],
    Other: [],
  };

  for (const trade of TRADE_TYPES) {
    grouped[trade.category].push(trade);
  }

  return grouped;
}

/**
 * Simple flat list for backwards compatibility
 * Use this when you just need a string array of trade names
 */
export const TRADE_OPTIONS: string[] = TRADE_TYPES.map((t) => t.value);

/**
 * Get trade categories
 */
export const TRADE_CATEGORIES: TradeCategory[] = [
  "Construction & Building",
  "Systems & Utilities",
  "Specialty Services",
  "Restoration & Remediation",
  "Outdoor & Exterior",
  "Technology & Security",
  "Specialty Contractors",
  "Other",
];

/**
 * Find a trade type by value
 */
export function findTradeType(value: string): TradeType | undefined {
  return TRADE_TYPES.find((t) => t.value.toLowerCase() === value.toLowerCase());
}

/**
 * Search trade types by query
 */
export function searchTradeTypes(query: string): TradeType[] {
  const q = query.toLowerCase();
  return TRADE_TYPES.filter(
    (t) =>
      t.value.toLowerCase().includes(q) ||
      t.label.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
  );
}
