/**
 * Section Registry
 * Central definition of all report sections used across templates
 */

export interface ReportSection {
  key: string;
  label: string;
  description: string;
  category: "EVIDENCE" | "ANALYSIS" | "NARRATIVE" | "TECHNICAL";
  requiredFor: string[];
}

export const REPORT_SECTION_REGISTRY: Record<string, ReportSection> = {
  photo_evidence: {
    key: "photo_evidence",
    label: "Photo Evidence",
    description: "Visual documentation of property damage",
    category: "EVIDENCE",
    requiredFor: ["CLAIM_MASTER", "SUPPLEMENT", "REBUTTAL"],
  },
  executive_summary: {
    key: "executive_summary",
    label: "Executive Summary",
    description: "High-level overview and recommendations",
    category: "NARRATIVE",
    requiredFor: ["CLAIM_MASTER", "PROPOSAL"],
  },
  scope_matrix: {
    key: "scope_matrix",
    label: "Scope of Work Matrix",
    description: "Detailed breakdown of damage items and costs",
    category: "TECHNICAL",
    requiredFor: ["CLAIM_MASTER", "SUPPLEMENT", "PROPOSAL"],
  },
  weather_verification: {
    key: "weather_verification",
    label: "Weather Verification",
    description: "Historical weather data supporting damage timeline",
    category: "ANALYSIS",
    requiredFor: ["CLAIM_MASTER", "REBUTTAL"],
  },
  damage_timeline: {
    key: "damage_timeline",
    label: "Damage Timeline",
    description: "Chronological sequence of events",
    category: "ANALYSIS",
    requiredFor: ["CLAIM_MASTER", "REBUTTAL"],
  },
  code_compliance: {
    key: "code_compliance",
    label: "Code Compliance Analysis",
    description: "Building code requirements and upgrades",
    category: "TECHNICAL",
    requiredFor: ["CLAIM_MASTER", "SUPPLEMENT"],
  },
  carrier_correspondence: {
    key: "carrier_correspondence",
    label: "Carrier Correspondence",
    description: "Communication history with insurance carrier",
    category: "NARRATIVE",
    requiredFor: ["REBUTTAL"],
  },
  legal_precedent: {
    key: "legal_precedent",
    label: "Legal Precedent",
    description: "Case law and policy language supporting claim",
    category: "NARRATIVE",
    requiredFor: ["REBUTTAL"],
  },
};

export function getSectionsByCategory(category: string) {
  return Object.values(REPORT_SECTION_REGISTRY).filter((s) => s.category === category);
}

export function getSectionsForDocType(docType: string) {
  return Object.values(REPORT_SECTION_REGISTRY).filter((s) => s.requiredFor.includes(docType));
}
