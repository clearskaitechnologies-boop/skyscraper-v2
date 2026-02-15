/**
 * Auto-Bucketing Logic for Evidence
 * Automatically organizes uploaded photos into collections based on filename patterns
 */

import { REPORT_SECTION_REGISTRY } from "@/lib/reports/sectionRegistry";

export interface BucketSuggestion {
  sectionKey: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

/**
 * Pattern matching rules for common filename conventions
 */
const SECTION_PATTERNS: Record<string, RegExp[]> = {
  roof: [
    /roof/i,
    /shingle/i,
    /ridge/i,
    /flashing/i,
    /valley/i,
    /soffit/i,
    /fascia/i,
    /gable/i,
    /peak/i,
    /vent/i,
  ],
  siding: [/siding/i, /wall/i, /exterior/i, /lap/i, /panel/i, /trim/i],
  gutters: [/gutter/i, /downspout/i, /drain/i],
  windows: [/window/i, /glass/i, /pane/i, /frame/i],
  doors: [/door/i, /entry/i, /garage/i],
  interior: [
    /interior/i,
    /ceiling/i,
    /drywall/i,
    /floor/i,
    /wall/i,
    /room/i,
    /kitchen/i,
    /bath/i,
    /bedroom/i,
    /living/i,
  ],
  foundation: [/foundation/i, /basement/i, /crawl/i, /slab/i],
  hvac: [/hvac/i, /furnace/i, /ac/i, /air.*condition/i, /heat/i, /duct/i],
  plumbing: [/plumb/i, /pipe/i, /leak/i, /water/i, /drain/i],
  electrical: [/electric/i, /wire/i, /breaker/i, /panel/i, /outlet/i, /switch/i],
  overview: [
    /overview/i,
    /aerial/i,
    /drone/i,
    /exterior.*full/i,
    /overall/i,
    /front/i,
    /back/i,
    /side/i,
  ],
};

/**
 * Detect best-fit section for a filename
 * Returns the section key and confidence level
 */
export function detectSection(fileName: string): BucketSuggestion | null {
  const normalized = fileName.toLowerCase();

  // Check each section pattern
  for (const [sectionKey, patterns] of Object.entries(SECTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        // Higher confidence if section is in the registry
        const isKnownSection = Object.values(REPORT_SECTION_REGISTRY).some(
          (s) => s.key === sectionKey
        );

        return {
          sectionKey,
          confidence: isKnownSection ? "high" : "medium",
          reason: `Filename contains "${pattern.source.replace(/[\/\\^$*+?.()|[\]{}]/g, "")}"`,
        };
      }
    }
  }

  // No pattern matched - default to "other" or null
  return null;
}

/**
 * Suggest multiple potential sections (for user confirmation)
 */
export function suggestSections(fileName: string): BucketSuggestion[] {
  const suggestions: BucketSuggestion[] = [];
  const normalized = fileName.toLowerCase();

  for (const [sectionKey, patterns] of Object.entries(SECTION_PATTERNS)) {
    const matchCount = patterns.filter((p) => p.test(normalized)).length;

    if (matchCount > 0) {
      const confidence = matchCount > 2 ? "high" : matchCount > 1 ? "medium" : "low";

      suggestions.push({
        sectionKey,
        confidence,
        reason: `Matched ${matchCount} pattern(s)`,
      });
    }
  }

  // Sort by confidence and match count
  return suggestions.sort((a, b) => {
    const confOrder = { high: 3, medium: 2, low: 1 };
    return confOrder[b.confidence] - confOrder[a.confidence];
  });
}

/**
 * Get section title from registry
 */
export function getSectionTitle(sectionKey: string): string {
  const section = Object.values(REPORT_SECTION_REGISTRY).find((s) => s.key === sectionKey);
  return section?.label || sectionKey;
}

/**
 * Batch detect sections for multiple files
 */
export function detectBatchSections(fileNames: string[]): Record<string, BucketSuggestion | null> {
  const results: Record<string, BucketSuggestion | null> = {};

  for (const fileName of fileNames) {
    results[fileName] = detectSection(fileName);
  }

  return results;
}

/**
 * Extract metadata hints from filename
 * e.g., "IMG_1234_roof_damage_20241218.jpg" -> {date: "20241218", keywords: ["roof", "damage"]}
 */
export function extractFilenameMetadata(fileName: string): {
  date?: string;
  keywords: string[];
  sequence?: string;
} {
  const normalized = fileName.toLowerCase();
  const metadata: {
    date?: string;
    keywords: string[];
    sequence?: string;
  } = {
    keywords: [],
  };

  // Extract date (YYYY-MM-DD or YYYYMMDD)
  const dateMatch = normalized.match(/(\d{4}[-_]?\d{2}[-_]?\d{2})/);
  if (dateMatch) {
    metadata.date = dateMatch[1].replace(/[-_]/g, "");
  }

  // Extract sequence number (IMG_1234, DSC_0045, etc.)
  const seqMatch = normalized.match(/[a-z]+[_-](\d{4,})/);
  if (seqMatch) {
    metadata.sequence = seqMatch[1];
  }

  // Extract keywords (words between separators)
  const words = normalized
    .replace(/\.(jpg|jpeg|png|heic|mp4|mov)$/i, "") // Remove extension
    .split(/[_\-\s.]+/)
    .filter((w) => w.length > 2 && !/^\d+$/.test(w)); // Filter short words and pure numbers

  metadata.keywords = words;

  return metadata;
}
