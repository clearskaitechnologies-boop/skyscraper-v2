/**
 * Report Section Ordering Intelligence
 *
 * AI determines optimal report section order based on:
 * - Damage type
 * - Audience (homeowner/adjuster/contractor)
 * - Claim complexity
 */

export type ReportAudience = "homeowner" | "adjuster" | "contractor" | "engineer";
export type DamageType = "hail" | "wind" | "combined" | "age" | "other";
export type ClaimComplexity = "simple" | "moderate" | "complex" | "catastrophic";

export interface ReportSection {
  id: string;
  name: string;
  priority: number; // 1-10
  required: boolean;
  recommended: boolean;
}

export interface SectionOrderingParams {
  damageType: DamageType;
  audience: ReportAudience;
  complexity: ClaimComplexity;
  hasCATEvent?: boolean;
  hasCompliance?: boolean;
  hasMaterials?: boolean;
  hasWeather?: boolean;
}

/**
 * Determine optimal section order for report
 */
export function determineOptimalOrder(params: SectionOrderingParams): ReportSection[] {
  const sections: ReportSection[] = [];

  // 1. Cover Page (always first)
  sections.push({
    id: "cover",
    name: "Cover Page",
    priority: 10,
    required: true,
    recommended: true,
  });

  // 2. Table of Contents (always second)
  sections.push({
    id: "toc",
    name: "Table of Contents",
    priority: 9,
    required: true,
    recommended: true,
  });

  // 3. Executive Summary (always third)
  sections.push({
    id: "executive_summary",
    name: "Executive Summary",
    priority: 8,
    required: true,
    recommended: true,
  });

  // 4. Weather/DOL Analysis (high priority for adjusters, CAT events)
  if (params.hasWeather) {
    const weatherPriority = params.audience === "adjuster" || params.hasCATEvent ? 7 : 6;
    sections.push({
      id: "weather",
      name: "Weather Analysis - Date of Loss",
      priority: weatherPriority,
      required: false,
      recommended: params.audience === "adjuster" || params.hasCATEvent === true,
    });
  }

  // 5. Property Details
  sections.push({
    id: "property",
    name: "Property Information",
    priority: 6,
    required: true,
    recommended: true,
  });

  // 6. Photo Gallery (higher priority for wind/hail, visual damage)
  const photoPriority = ["hail", "wind", "combined"].includes(params.damageType) ? 7 : 5;
  sections.push({
    id: "photos",
    name: "Annotated Photo Gallery",
    priority: photoPriority,
    required: true,
    recommended: true,
  });

  // 7. AI Damage Analysis (core section)
  sections.push({
    id: "damage_analysis",
    name: "AI Damage Analysis",
    priority: 7,
    required: true,
    recommended: true,
  });

  // 8. Severity Scoring (important for adjusters)
  sections.push({
    id: "severity",
    name: "Severity Assessment",
    priority: params.audience === "adjuster" ? 6 : 5,
    required: true,
    recommended: true,
  });

  // 9. Material Recommendations (high priority for homeowners)
  if (params.hasMaterials) {
    const materialPriority = params.audience === "homeowner" ? 7 : 5;
    sections.push({
      id: "materials",
      name: "Material Recommendations",
      priority: materialPriority,
      required: false,
      recommended: params.audience === "homeowner",
    });
  }

  // 10. Code Compliance (critical for contractors/engineers)
  if (params.hasCompliance) {
    const compliancePriority =
      params.audience === "contractor" || params.audience === "engineer" ? 7 : 5;
    sections.push({
      id: "compliance",
      name: "Code & Compliance Analysis",
      priority: compliancePriority,
      required: false,
      recommended: params.audience === "contractor" || params.audience === "engineer",
    });
  }

  // 11. Repair Scope (important for contractors)
  sections.push({
    id: "repair_scope",
    name: "Recommended Repair Scope",
    priority: params.audience === "contractor" ? 7 : 6,
    required: true,
    recommended: true,
  });

  // 12. Line Items (critical for adjusters/contractors)
  sections.push({
    id: "line_items",
    name: "Detailed Line Items",
    priority: params.audience === "adjuster" || params.audience === "contractor" ? 6 : 4,
    required: false,
    recommended: params.audience === "adjuster" || params.audience === "contractor",
  });

  // 13. Cost Estimates (important for all)
  sections.push({
    id: "cost_estimates",
    name: "Cost Estimates",
    priority: 6,
    required: true,
    recommended: true,
  });

  // 14. Timeline (moderate priority)
  sections.push({
    id: "timeline",
    name: "Project Timeline",
    priority: 4,
    required: false,
    recommended: params.complexity !== "simple",
  });

  // 15. Disclaimers (always last)
  sections.push({
    id: "disclaimers",
    name: "Important Disclaimers",
    priority: 1,
    required: true,
    recommended: true,
  });

  // Sort by priority (descending), then alphabetically
  return sections.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get recommended sections for audience
 */
export function getRecommendedSections(audience: ReportAudience): string[] {
  const recommendations: Record<ReportAudience, string[]> = {
    homeowner: [
      "cover",
      "toc",
      "executive_summary",
      "photos",
      "damage_analysis",
      "materials",
      "repair_scope",
      "cost_estimates",
      "disclaimers",
    ],
    adjuster: [
      "cover",
      "toc",
      "executive_summary",
      "weather",
      "property",
      "photos",
      "damage_analysis",
      "severity",
      "line_items",
      "cost_estimates",
      "disclaimers",
    ],
    contractor: [
      "cover",
      "toc",
      "executive_summary",
      "property",
      "damage_analysis",
      "compliance",
      "repair_scope",
      "line_items",
      "cost_estimates",
      "timeline",
      "disclaimers",
    ],
    engineer: [
      "cover",
      "toc",
      "executive_summary",
      "property",
      "photos",
      "damage_analysis",
      "severity",
      "compliance",
      "repair_scope",
      "disclaimers",
    ],
  };

  return recommendations[audience];
}

/**
 * Generate section order explanation
 */
export function explainSectionOrder(params: SectionOrderingParams): string {
  const lines: string[] = [];

  lines.push("REPORT SECTION ORDERING LOGIC");
  lines.push("═".repeat(60));
  lines.push("");

  lines.push(`Target Audience: ${params.audience.toUpperCase()}`);
  lines.push(`Damage Type: ${params.damageType.toUpperCase()}`);
  lines.push(`Claim Complexity: ${params.complexity.toUpperCase()}`);
  lines.push("");

  lines.push("ORDERING STRATEGY:");

  if (params.audience === "homeowner") {
    lines.push("  Focus: Visual impact, material selection, cost clarity");
    lines.push("  Priority: Photos → Materials → Costs");
  } else if (params.audience === "adjuster") {
    lines.push("  Focus: Verification, documentation, coverage determination");
    lines.push("  Priority: Weather → Analysis → Line Items");
  } else if (params.audience === "contractor") {
    lines.push("  Focus: Scope accuracy, compliance, execution plan");
    lines.push("  Priority: Compliance → Scope → Timeline");
  } else if (params.audience === "engineer") {
    lines.push("  Focus: Technical analysis, structural assessment, code review");
    lines.push("  Priority: Analysis → Compliance → Severity");
  }

  lines.push("");
  lines.push("RATIONALE:");
  lines.push("  • Always start with Executive Summary for quick overview");
  if (params.hasWeather && (params.audience === "adjuster" || params.hasCATEvent)) {
    lines.push("  • Weather section early for claim verification");
  }
  if (["hail", "wind", "combined"].includes(params.damageType)) {
    lines.push("  • Photo gallery prioritized for visual damage documentation");
  }
  if (params.audience === "homeowner" && params.hasMaterials) {
    lines.push("  • Material recommendations prominent for homeowner decision-making");
  }
  if (
    (params.audience === "contractor" || params.audience === "engineer") &&
    params.hasCompliance
  ) {
    lines.push("  • Compliance section elevated for professional execution");
  }
  lines.push("  • Cost estimates near end after full context established");
  lines.push("  • Disclaimers always last for legal protection");

  return lines.join("\n");
}

/**
 * Filter sections based on available data
 */
export function filterAvailableSections(
  allSections: ReportSection[],
  availableData: {
    hasPhotos: boolean;
    hasWeather: boolean;
    hasMaterials: boolean;
    hasCompliance: boolean;
    hasLineItems: boolean;
  }
): ReportSection[] {
  return allSections.filter((section) => {
    switch (section.id) {
      case "photos":
        return availableData.hasPhotos;
      case "weather":
        return availableData.hasWeather;
      case "materials":
        return availableData.hasMaterials;
      case "compliance":
        return availableData.hasCompliance;
      case "line_items":
        return availableData.hasLineItems;
      default:
        return true; // Include all other sections
    }
  });
}
