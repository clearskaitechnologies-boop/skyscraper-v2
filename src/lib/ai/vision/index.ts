/**
 * Vision Analysis Module
 * Provides property image analysis functionality
 */

import { analyzeImage, type DamageReport } from "@/lib/ai/openai-vision";
import type { AiResponse } from "@/lib/api/aiResponse";

export interface VisionAnalysis {
  damageDetected: boolean;
  damageTypes: string[];
  severity: "none" | "minor" | "moderate" | "severe";
  confidence: number;
  details?: string;
  regions?: DamageRegion[];
}

export interface DamageRegion {
  type: string;
  location: string;
  severity: "minor" | "moderate" | "severe";
  description?: string;
}

/**
 * Analyze a property image for damage
 */
export async function analyzePropertyImage(
  imageUrl: string,
  options?: {
    focusAreas?: string[];
    claimId?: string;
    orgId?: string;
  }
): Promise<AiResponse<VisionAnalysis>> {
  try {
    // Use existing OpenAI vision analysis
    const result = await analyzeImage(imageUrl);

    if (!result.ok || !result.data) {
      return result as AiResponse<VisionAnalysis>;
    }

    const damageReport = result.data as DamageReport;

    // Transform to VisionAnalysis format
    const analysis: VisionAnalysis = {
      damageDetected: damageReport.damageDetected ?? false,
      damageTypes: damageReport.damageTypes ?? [],
      severity: (damageReport.severity ?? "none") as VisionAnalysis["severity"],
      confidence: damageReport.confidence ?? 0,
      details: damageReport.summary,
      regions: damageReport.regions?.map((r) => ({
        type: r.type,
        location: r.location,
        severity: r.severity as DamageRegion["severity"],
        description: r.description,
      })),
    };

    return {
      ok: true,
      data: analysis,
      errorType: undefined,
      error: undefined,
    };
  } catch (error: any) {
    return {
      ok: false,
      data: undefined,
      errorType: "INTERNAL",
      error: error.message || "Vision analysis failed",
    };
  }
}

export type { DamageReport };
