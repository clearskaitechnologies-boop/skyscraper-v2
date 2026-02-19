/**
 * AI Code Compliance API
 *
 * Checks damage assessments against building codes (IRC/IBC).
 * Returns compliance status, violations, and recommendations.
 *
 * FULL NATIONAL COVERAGE: All 50 states + DC
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { z } from "zod";

import { safeOrgContext } from "@/lib/auth/orgContext";
import {
  checkBuildingCodes,
  getLocalCodes,
  getStateInfo,
  getStateList,
} from "@/lib/compliance/code-checker";

const ComplianceRequestSchema = z.object({
  claimId: z.string().optional(),
  damageType: z.string(),
  propertyType: z.enum(["residential", "commercial"]),
  state: z.string().length(2),
  county: z.string().optional(),
  yearBuilt: z.number().optional(),
  existingMaterials: z.array(z.string()).optional(),
  proposedRepairs: z.array(z.string()).optional(),
  trade: z.enum(["roofing", "siding", "windows", "gutters", "all"]).optional(),
});

export interface CodeRequirement {
  code: string;
  section: string;
  title: string;
  description: string;
  applicability: string;
}

export interface Violation {
  id: string;
  severity: "info" | "warning" | "violation" | "critical";
  code: string;
  section: string;
  description: string;
  remediation: string;
}

export interface StateInfoResponse {
  edition: string;
  windZone?: "basic" | "high" | "hurricane";
  seismicZone?: "A" | "B" | "C" | "D" | "E";
  iceBarrier?: boolean;
  snowLoad?: boolean;
  fireZone?: boolean;
}

export interface ComplianceResponse {
  success: boolean;
  compliant: boolean;
  jurisdiction: {
    state: string;
    county?: string;
    codeEdition: string;
  };
  stateInfo?: StateInfoResponse;
  requirements: CodeRequirement[];
  violations: Violation[];
  recommendations: string[];
  permitRequired: boolean;
  permitNotes?: string;
  cached?: boolean;
  cachedAt?: string;
}

/**
 * POST /api/ai/code-compliance
 *
 * Check repair proposal against building codes
 */
export async function POST(req: NextRequest) {
  try {
    const orgCtx = await safeOrgContext();
    if (orgCtx.status !== "ok") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const input = ComplianceRequestSchema.parse(body);

    // Use the comprehensive code-checker
    const complianceResult = await checkBuildingCodes(
      input.state,
      input.county,
      input.damageType,
      input.trade
    );

    // Get local codes for PDF table
    const localCodes = await getLocalCodes(input.state, input.county, input.trade);

    // Get state info for badges
    const stateInfo = getStateInfo(input.state);

    // Map violations to API format
    const violations: Violation[] = complianceResult.violations.map((v) => ({
      id: crypto.randomUUID(),
      severity:
        v.severity === "critical"
          ? "critical"
          : v.severity === "error"
            ? "violation"
            : v.severity === "warning"
              ? "warning"
              : "info",
      code: v.code,
      section: v.section,
      description: v.description,
      remediation: v.remediation,
    }));

    // Add material-specific checks
    if (input.existingMaterials?.includes("3-tab") && input.yearBuilt && input.yearBuilt < 2000) {
      violations.push({
        id: crypto.randomUUID(),
        severity: "info",
        code: "IRC",
        section: "R905.2",
        description: "Existing 3-tab shingles may not meet current wind resistance requirements",
        remediation: "Consider upgrading to architectural shingles rated for higher wind speeds",
      });
    }

    // Build requirements from local codes
    const requirements: CodeRequirement[] = localCodes.codes.map((code) => ({
      code: code.code.split(" ")[0] || "IRC",
      section: code.code,
      title: code.code,
      description: code.requirement,
      applicability: code.applicableStates?.join(", ") || "All states",
    }));

    // Determine permit requirements
    const { permitRequired, permitNotes } = checkPermitRequirements(input);

    const response: ComplianceResponse = {
      success: true,
      compliant: complianceResult.compliant,
      jurisdiction: {
        state: input.state,
        county: input.county,
        codeEdition: complianceResult.codeEdition,
      },
      stateInfo: stateInfo
        ? {
            edition: stateInfo.edition,
            windZone: stateInfo.windZone,
            seismicZone: stateInfo.seismicZone,
            iceBarrier: stateInfo.iceBarrier,
            snowLoad: stateInfo.snowLoad,
            fireZone: stateInfo.fireZone,
          }
        : undefined,
      requirements,
      violations,
      recommendations: complianceResult.recommendations,
      permitRequired,
      permitNotes,
      cached: complianceResult.cached,
      cachedAt: complianceResult.cachedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("[Code Compliance] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to check compliance",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Check permit requirements
 */
function checkPermitRequirements(input: z.infer<typeof ComplianceRequestSchema>): {
  permitRequired: boolean;
  permitNotes?: string;
} {
  const permitRequired = true;
  let permitNotes =
    "Building permit typically required for roof replacement. Check with local building department.";

  if (input.state === "TX") {
    permitNotes =
      "Texas: Permit requirements vary by city. Most major cities require permits for re-roofing.";
  } else if (input.state === "FL") {
    permitNotes =
      "Florida: Permit required for all roofing work. Notice of Commencement required for projects over $2,500.";
  } else if (input.state === "CA") {
    permitNotes =
      "California: Permit required. Must comply with Title 24 energy standards and CALGreen.";
  }

  return { permitRequired, permitNotes };
}

/**
 * GET /api/ai/code-compliance
 *
 * Get supported code types, jurisdictions, and state info
 */
export async function GET() {
  const states = getStateList();
  const stateDetails: Record<string, ReturnType<typeof getStateInfo>> = {};

  for (const state of states) {
    stateDetails[state] = getStateInfo(state);
  }

  return NextResponse.json({
    supportedCodes: [
      "IRC 2021",
      "IRC 2020",
      "IRC 2018",
      "IBC 2021",
      "FBC 2023 (7th Edition)",
      "CBC 2022 (Title 24)",
      "ORSC 2021",
    ],
    supportedStates: states,
    stateCount: states.length,
    stateDetails,
    damageTypes: [
      "roof_hail",
      "roof_wind",
      "roof_age",
      "siding_damage",
      "window_damage",
      "gutter_damage",
      "structural_damage",
      "water_intrusion",
      "fire_damage",
    ],
    trades: ["roofing", "siding", "windows", "gutters", "all"],
    version: "2.0.0",
    lastUpdated: "2026-02",
    coverage: "All 50 US states + DC",
  });
}
