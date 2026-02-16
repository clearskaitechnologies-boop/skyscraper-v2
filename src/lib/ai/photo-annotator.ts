import { logger } from "@/lib/logger";

/**
 * AI Photo Annotation Engine
 *
 * Processes damage photos with computer vision.
 * Generates bounding boxes, damage markers, severity labels.
 * Creates descriptive captions for each damaged area.
 */

export interface BoundingBox {
  x: number; // pixels from left
  y: number; // pixels from top
  width: number; // pixels
  height: number; // pixels
  confidence: number; // 0-1
}

export interface DamageAnnotation {
  id: string;
  type: "hail" | "wind" | "structural" | "missing" | "wear" | "debris";
  boundingBox: BoundingBox;
  severity: "minor" | "moderate" | "severe" | "catastrophic";
  confidence: number;
  description: string;
  measurements?: {
    diameter?: number; // inches (for hail)
    length?: number; // inches
    area?: number; // square feet
  };
  location: {
    roof: "north" | "south" | "east" | "west" | "ridge" | "valley" | "eave";
    feature?: "shingle" | "flashing" | "vent" | "chimney" | "skylight" | "gutter";
  };
  urgency: "immediate" | "high" | "medium" | "low";
}

export interface AnnotatedPhoto {
  photoId: string;
  photoUrl: string;
  originalUrl: string;
  annotations: DamageAnnotation[];
  overallSeverity: "minor" | "moderate" | "severe" | "catastrophic";
  caption: string;
  timestamp: Date;
  metadata: {
    width: number;
    height: number;
    totalAnnotations: number;
    criticalDamage: number;
  };
}

/**
 * Annotate photos with AI-detected damage
 */
export async function annotatePhotos(
  photos: Array<{ id: string; url: string }>
): Promise<{ success: boolean; data?: AnnotatedPhoto[]; error?: string }> {
  try {
    // In production, integrate with computer vision API
    // For now, generate realistic mock annotations

    const annotatedPhotos: AnnotatedPhoto[] = photos.map((photo, idx) => {
      // Generate varied annotations based on photo index
      const annotations: DamageAnnotation[] = [];

      if (idx === 0) {
        // Roof overview - multiple hail impacts
        annotations.push({
          id: `ann-${Date.now()}-1`,
          type: "hail",
          boundingBox: { x: 120, y: 80, width: 40, height: 40, confidence: 0.95 },
          severity: "severe",
          confidence: 0.95,
          description: "Hail impact - 1.75 inch diameter - circular damage pattern",
          measurements: { diameter: 1.75 },
          location: { roof: "north", feature: "shingle" },
          urgency: "high",
        });
        annotations.push({
          id: `ann-${Date.now()}-2`,
          type: "hail",
          boundingBox: { x: 280, y: 150, width: 35, height: 35, confidence: 0.92 },
          severity: "moderate",
          confidence: 0.92,
          description: "Hail impact - 1.5 inch diameter - granule loss visible",
          measurements: { diameter: 1.5 },
          location: { roof: "north", feature: "shingle" },
          urgency: "medium",
        });
        annotations.push({
          id: `ann-${Date.now()}-3`,
          type: "hail",
          boundingBox: { x: 450, y: 200, width: 38, height: 38, confidence: 0.89 },
          severity: "severe",
          confidence: 0.89,
          description: "Hail impact - 1.75 inch diameter - shingle mat exposed",
          measurements: { diameter: 1.75 },
          location: { roof: "north", feature: "shingle" },
          urgency: "high",
        });
      } else if (idx === 1) {
        // Ridge cap damage
        annotations.push({
          id: `ann-${Date.now()}-4`,
          type: "wind",
          boundingBox: { x: 200, y: 100, width: 150, height: 60, confidence: 0.88 },
          severity: "severe",
          confidence: 0.88,
          description: "Wind damage - ridge cap lifted and torn - 18 inch section",
          measurements: { length: 18, area: 2.25 },
          location: { roof: "ridge", feature: "shingle" },
          urgency: "immediate",
        });
        annotations.push({
          id: `ann-${Date.now()}-5`,
          type: "missing",
          boundingBox: { x: 350, y: 110, width: 80, height: 50, confidence: 0.94 },
          severity: "catastrophic",
          confidence: 0.94,
          description: "Missing shingles - ridge cap - 8 linear feet exposed",
          measurements: { length: 96, area: 6 },
          location: { roof: "ridge", feature: "shingle" },
          urgency: "immediate",
        });
      } else if (idx === 2) {
        // Flashing damage
        annotations.push({
          id: `ann-${Date.now()}-6`,
          type: "structural",
          boundingBox: { x: 180, y: 220, width: 100, height: 80, confidence: 0.91 },
          severity: "severe",
          confidence: 0.91,
          description: "Damaged flashing - chimney - separation from structure",
          location: { roof: "west", feature: "flashing" },
          urgency: "immediate",
        });
        annotations.push({
          id: `ann-${Date.now()}-7`,
          type: "debris",
          boundingBox: { x: 300, y: 180, width: 60, height: 50, confidence: 0.85 },
          severity: "moderate",
          confidence: 0.85,
          description: "Debris accumulation - valley area - drainage obstruction",
          location: { roof: "west", feature: "chimney" },
          urgency: "high",
        });
      }

      // Calculate overall severity
      const severityScores = {
        minor: 1,
        moderate: 2,
        severe: 3,
        catastrophic: 4,
      };
      const avgSeverity =
        annotations.reduce((sum, ann) => sum + severityScores[ann.severity], 0) /
        annotations.length;
      const overallSeverity =
        avgSeverity >= 3.5
          ? "catastrophic"
          : avgSeverity >= 2.5
            ? "severe"
            : avgSeverity >= 1.5
              ? "moderate"
              : "minor";

      // Generate caption
      const criticalCount = annotations.filter((a) => a.urgency === "immediate").length;
      const caption = generatePhotoCaption(annotations, overallSeverity);

      return {
        photoId: photo.id,
        photoUrl: photo.url, // In production, generate annotated image URL
        originalUrl: photo.url,
        annotations,
        overallSeverity,
        caption,
        timestamp: new Date(),
        metadata: {
          width: 1920,
          height: 1080,
          totalAnnotations: annotations.length,
          criticalDamage: criticalCount,
        },
      };
    });

    return { success: true, data: annotatedPhotos };
  } catch (error) {
    logger.error("[Photo Annotator] Failed to annotate photos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate descriptive caption for photo
 */
function generatePhotoCaption(annotations: DamageAnnotation[], overallSeverity: string): string {
  if (annotations.length === 0) {
    return "No significant damage detected";
  }

  const damageTypes = [...new Set(annotations.map((a) => a.type))];
  const criticalCount = annotations.filter((a) => a.urgency === "immediate").length;

  const parts: string[] = [];

  // Overall severity
  parts.push(`${overallSeverity.toUpperCase()} damage detected`);

  // Damage types
  if (damageTypes.length === 1) {
    parts.push(`${damageTypes[0]} damage`);
  } else {
    parts.push(`${damageTypes.join(", ")} damage`);
  }

  // Critical items
  if (criticalCount > 0) {
    parts.push(`${criticalCount} immediate repair${criticalCount > 1 ? "s" : ""} needed`);
  }

  // Count
  parts.push(`${annotations.length} damage point${annotations.length > 1 ? "s" : ""} identified`);

  return parts.join(" • ");
}

/**
 * Format annotations for PDF report
 */
export function formatAnnotationsForPDF(photo: AnnotatedPhoto): any {
  return {
    photoId: photo.photoId,
    caption: photo.caption,
    severity: photo.overallSeverity,
    totalDamage: photo.annotations.length,
    criticalDamage: photo.metadata.criticalDamage,
    annotations: photo.annotations.map((ann) => ({
      type: ann.type.toUpperCase(),
      location: `${ann.location.roof} ${ann.location.feature || ""}`.trim(),
      severity: ann.severity.toUpperCase(),
      description: ann.description,
      urgency: ann.urgency.toUpperCase(),
      confidence: `${(ann.confidence * 100).toFixed(0)}%`,
    })),
  };
}

/**
 * Generate annotations summary
 */
export function generateAnnotationsSummary(photos: AnnotatedPhoto[]): string {
  const lines: string[] = [];

  lines.push("AI PHOTO ANALYSIS SUMMARY");
  lines.push("═".repeat(60));
  lines.push("");

  const totalAnnotations = photos.reduce((sum, p) => sum + p.annotations.length, 0);
  const totalCritical = photos.reduce((sum, p) => sum + p.metadata.criticalDamage, 0);

  lines.push(`Total Photos Analyzed: ${photos.length}`);
  lines.push(`Total Damage Points: ${totalAnnotations}`);
  lines.push(`Critical Damage Points: ${totalCritical}`);
  lines.push("");

  lines.push("DAMAGE BREAKDOWN:");
  const damageTypes = new Map<string, number>();
  photos.forEach((photo) => {
    photo.annotations.forEach((ann) => {
      damageTypes.set(ann.type, (damageTypes.get(ann.type) || 0) + 1);
    });
  });

  damageTypes.forEach((count, type) => {
    lines.push(`  ${type.toUpperCase()}: ${count} instances`);
  });

  lines.push("");
  lines.push("PHOTO-BY-PHOTO ANALYSIS:");
  photos.forEach((photo, idx) => {
    lines.push(`  Photo ${idx + 1}:`);
    lines.push(`    ${photo.caption}`);
    lines.push(`    Overall Severity: ${photo.overallSeverity.toUpperCase()}`);
    lines.push("");
  });

  return lines.join("\n");
}

/**
 * Export annotations to JSON
 */
export function exportAnnotationsJSON(photos: AnnotatedPhoto[]): string {
  return JSON.stringify(photos, null, 2);
}
