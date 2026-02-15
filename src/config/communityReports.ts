/**
 * Canonical Community Reports Configuration
 * Single source of truth for pricing, templates, and report types
 */

export interface CommunityReportConfig {
  id: string;
  type: "HAIL" | "WIND" | "ROOF_INSPECTION" | "WEATHER_VERIFICATION";
  title: string;
  priceCents: number;
  sku: string;
  city: string;
  state: string;
  eventDate: string;
  severityTags: string[];
  description: string;
  engineTemplateKey: string;
  features: string[];
}

/**
 * Production Community Reports Catalog
 */
export const COMMUNITY_REPORTS: CommunityReportConfig[] = [
  {
    id: "report-prescott-hail-2024",
    type: "HAIL",
    title: "Hail Damage Assessment - Prescott Valley",
    priceCents: 15000, // $150.00
    sku: "COMM_REPORT_PRESCOTT_HAIL_2024",
    city: "Prescott Valley",
    state: "AZ",
    eventDate: "2024-07-15",
    severityTags: ["High Severity", "Verified by NOAA"],
    description:
      "Comprehensive analysis of hail damage from July 2024 storm event. Includes NOAA weather verification, damage pattern analysis, and insurance-ready documentation.",
    engineTemplateKey: "hail_damage_assessment",
    features: [
      "NOAA Weather Data Verification",
      "High-Resolution Damage Photos",
      "Insurance Carrier Format",
      "AI-Generated Loss Summary",
      "Expert Review Included",
    ],
  },
  {
    id: "report-phoenix-wind-2024",
    type: "WIND",
    title: "Wind & Monsoon Damage Report - Phoenix Metro",
    priceCents: 12500, // $125.00
    sku: "COMM_REPORT_PHOENIX_WIND_2024",
    city: "Phoenix",
    state: "AZ",
    eventDate: "2024-08-22",
    severityTags: ["Medium Severity", "Monsoon Season"],
    description:
      "Detailed monsoon season damage assessment with weather verification. Covers wind damage, rain intrusion, and structural impact from August 2024 storm.",
    engineTemplateKey: "wind_damage_assessment",
    features: [
      "Monsoon Event Verification",
      "Wind Speed Analysis",
      "Water Intrusion Documentation",
      "Structural Integrity Assessment",
      "Ready for Adjuster Review",
    ],
  },
  {
    id: "report-tucson-roof-2024",
    type: "ROOF_INSPECTION",
    title: "Roof Inspection & Weather Verification - Tucson",
    priceCents: 17500, // $175.00
    sku: "COMM_REPORT_TUCSON_ROOF_2024",
    city: "Tucson",
    state: "AZ",
    eventDate: "2024-09-10",
    severityTags: ["High Severity", "Full Inspection"],
    description:
      "Complete roof inspection with NOAA weather data correlation. Includes material analysis, age assessment, and comprehensive damage documentation.",
    engineTemplateKey: "roof_inspection_full",
    features: [
      "Complete Roof Material Analysis",
      "Age & Condition Assessment",
      "Weather Correlation Report",
      "Replacement Cost Estimation",
      "Warranty Documentation Review",
    ],
  },
];

/**
 * Get report config by SKU
 */
export function getReportBySku(sku: string): CommunityReportConfig | null {
  return COMMUNITY_REPORTS.find((r) => r.sku === sku) || null;
}

/**
 * Get report config by ID
 */
export function getReportById(id: string): CommunityReportConfig | null {
  return COMMUNITY_REPORTS.find((r) => r.id === id) || null;
}

/**
 * Get reports by city
 */
export function getReportsByCity(city: string): CommunityReportConfig[] {
  return COMMUNITY_REPORTS.filter((r) => r.city.toLowerCase() === city.toLowerCase());
}

/**
 * Get reports by type
 */
export function getReportsByType(type: CommunityReportConfig["type"]): CommunityReportConfig[] {
  return COMMUNITY_REPORTS.filter((r) => r.type === type);
}

/**
 * Format price for display
 */
export function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}
