/**
 * AI Photo Annotations API
 *
 * Analyzes photos using AI vision to detect damage and generate annotations.
 * Returns bounding boxes, damage classifications, and confidence scores.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { z } from "zod";

import { safeOrgContext } from "@/lib/auth/orgContext";

const AnnotationRequestSchema = z.object({
  photoUrl: z.string().url(),
  claimId: z.string().optional(),
  includeOverlay: z.boolean().optional().default(false),
});

export interface DamageAnnotation {
  id: string;
  type: string;
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  severity: "low" | "medium" | "high" | "critical";
  description: string;
}

export interface AnnotationResponse {
  success: boolean;
  photoUrl: string;
  annotations: DamageAnnotation[];
  summary: {
    totalDamageAreas: number;
    primaryDamageType: string;
    overallSeverity: string;
    estimatedRepairScope: string;
  };
  svgOverlay?: string;
}

/**
 * POST /api/ai/annotations
 *
 * Analyze a photo for damage and return annotations
 */
export async function POST(req: NextRequest) {
  try {
    const orgCtx = await safeOrgContext();
    if (orgCtx.status !== "ok") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { photoUrl, claimId, includeOverlay } = AnnotationRequestSchema.parse(body);

    // Call AI vision for damage analysis
    const annotations = await analyzePhotoForDamage(photoUrl);

    // Generate summary
    const summary = generateDamageSummary(annotations);

    // Optionally generate SVG overlay
    let svgOverlay: string | undefined;
    if (includeOverlay) {
      svgOverlay = generateSvgOverlay(annotations);
    }

    const response: AnnotationResponse = {
      success: true,
      photoUrl,
      annotations,
      summary,
      svgOverlay,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("[AI Annotations] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze photo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Analyze photo using AI vision model
 */
async function analyzePhotoForDamage(photoUrl: string): Promise<DamageAnnotation[]> {
  // TODO: Integrate with OpenAI Vision API
  // For now, return mock data structure that matches expected output

  const mockAnnotations: DamageAnnotation[] = [
    {
      id: crypto.randomUUID(),
      type: "hail_damage",
      label: "Hail Impact",
      confidence: 0.92,
      boundingBox: { x: 0.15, y: 0.2, width: 0.1, height: 0.08 },
      severity: "medium",
      description: "Circular depression consistent with hail impact damage",
    },
    {
      id: crypto.randomUUID(),
      type: "missing_shingle",
      label: "Missing Shingle",
      confidence: 0.88,
      boundingBox: { x: 0.45, y: 0.35, width: 0.12, height: 0.15 },
      severity: "high",
      description: "Exposed underlayment where shingle has been dislodged",
    },
    {
      id: crypto.randomUUID(),
      type: "granule_loss",
      label: "Granule Loss",
      confidence: 0.75,
      boundingBox: { x: 0.6, y: 0.5, width: 0.2, height: 0.18 },
      severity: "medium",
      description: "Significant granule displacement exposing asphalt substrate",
    },
  ];

  return mockAnnotations;
}

/**
 * Generate damage summary from annotations
 */
function generateDamageSummary(annotations: DamageAnnotation[]) {
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  const maxSeverity = annotations.reduce(
    (max, a) => (severityOrder[a.severity] > severityOrder[max] ? a.severity : max),
    "low" as "low" | "medium" | "high" | "critical"
  );

  const typeCount: Record<string, number> = {};
  annotations.forEach((a) => {
    typeCount[a.type] = (typeCount[a.type] || 0) + 1;
  });
  const primaryType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

  return {
    totalDamageAreas: annotations.length,
    primaryDamageType: primaryType.replace(/_/g, " "),
    overallSeverity: maxSeverity,
    estimatedRepairScope:
      annotations.length > 5
        ? "full_replacement"
        : annotations.length > 2
          ? "partial_repair"
          : "spot_repair",
  };
}

/**
 * Generate SVG overlay for annotations
 */
function generateSvgOverlay(annotations: DamageAnnotation[]): string {
  const circles = annotations
    .map((a, i) => {
      const cx = (a.boundingBox.x + a.boundingBox.width / 2) * 100;
      const cy = (a.boundingBox.y + a.boundingBox.height / 2) * 100;
      const r = Math.max(a.boundingBox.width, a.boundingBox.height) * 50;
      const color =
        a.severity === "critical"
          ? "#ef4444"
          : a.severity === "high"
            ? "#f97316"
            : a.severity === "medium"
              ? "#eab308"
              : "#22c55e";

      return `
      <circle cx="${cx}%" cy="${cy}%" r="${r}%" fill="none" stroke="${color}" stroke-width="2" opacity="0.8"/>
      <text x="${cx}%" y="${cy}%" text-anchor="middle" fill="${color}" font-size="12" dy=".3em">${i + 1}</text>
    `;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${circles}</svg>`;
}

/**
 * GET /api/ai/annotations
 *
 * Get annotation capabilities and supported damage types
 */
export async function GET() {
  return NextResponse.json({
    supportedDamageTypes: [
      "hail_damage",
      "wind_damage",
      "missing_shingle",
      "granule_loss",
      "cracked_shingle",
      "lifted_shingle",
      "exposed_nail",
      "flashing_damage",
      "gutter_damage",
      "soffit_damage",
      "water_damage",
      "moss_growth",
      "debris_impact",
    ],
    severityLevels: ["low", "medium", "high", "critical"],
    outputFormats: ["json", "svg_overlay"],
    version: "1.0.0",
  });
}
