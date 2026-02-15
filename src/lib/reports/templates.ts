// lib/reports/templates.ts

import { ReportSectionId, ReportType } from "./types";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  reportType: ReportType;
  sections: ReportSectionId[];
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Built-in templates
export const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: "insurance-full",
    name: "Full Insurance Claim Report",
    description: "Complete claim report with all insurance sections",
    reportType: "INSURANCE_CLAIM",
    isDefault: true,
    sections: [
      "COVER",
      "CLAIM_SNAPSHOT",
      "CLIENT_SNAPSHOT",
      "MAPS_AND_PHOTOS",
      "WEATHER_QUICK_DOL",
      "WEATHER_FULL",
      "AI_DAMAGE",
      "ESTIMATE_INITIAL",
      "DEPRECIATION",
      "MATERIALS",
      "CODE_REQUIREMENTS",
      "WARRANTY_DETAILS",
      "TIMELINE",
      "OCR_DOCS",
      "AI_SUMMARY_CLAIM",
    ],
  },
  {
    id: "insurance-quick",
    name: "Quick Insurance Report",
    description: "Essential claim information only",
    reportType: "INSURANCE_CLAIM",
    sections: [
      "COVER",
      "CLAIM_SNAPSHOT",
      "MAPS_AND_PHOTOS",
      "WEATHER_QUICK_DOL",
      "AI_DAMAGE",
      "ESTIMATE_INITIAL",
      "AI_SUMMARY_CLAIM",
    ],
  },
  {
    id: "retail-full",
    name: "Full Retail Proposal",
    description: "Complete homeowner proposal with all details",
    reportType: "RETAIL_PROPOSAL",
    isDefault: true,
    sections: [
      "COVER",
      "CLIENT_SNAPSHOT",
      "MAPS_AND_PHOTOS",
      "MATERIALS",
      "CODE_REQUIREMENTS",
      "WARRANTY_DETAILS",
      "TIMELINE",
      "AI_SUMMARY_RETAIL",
    ],
  },
  {
    id: "retail-simple",
    name: "Simple Retail Quote",
    description: "Basic proposal for quick estimates",
    reportType: "RETAIL_PROPOSAL",
    sections: ["COVER", "CLIENT_SNAPSHOT", "MAPS_AND_PHOTOS", "MATERIALS", "AI_SUMMARY_RETAIL"],
  },
  {
    id: "supplement-standard",
    name: "Standard Supplement",
    description: "Additional work and materials documentation",
    reportType: "SUPPLEMENT_PACKAGE",
    isDefault: true,
    sections: [
      "COVER",
      "CLAIM_SNAPSHOT",
      "MAPS_AND_PHOTOS",
      "AI_DAMAGE",
      "ESTIMATE_SUPPLEMENT",
      "MATERIALS",
      "AI_SUMMARY_CLAIM",
    ],
  },
];

export function getTemplatesByType(type: ReportType): ReportTemplate[] {
  return DEFAULT_TEMPLATES.filter((t) => t.reportType === type);
}

export function getTemplateById(id: string): ReportTemplate | undefined {
  return DEFAULT_TEMPLATES.find((t) => t.id === id);
}

export function getDefaultTemplate(type: ReportType): ReportTemplate {
  const defaultTemplate = DEFAULT_TEMPLATES.find((t) => t.reportType === type && t.isDefault);
  return defaultTemplate || DEFAULT_TEMPLATES[0];
}
