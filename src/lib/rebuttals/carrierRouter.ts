/**
 * Carrier-Specific Rebuttal Routing
 *
 * Routes rebuttal generation based on carrier to apply appropriate:
 * - Tone (formal, technical, neutral)
 * - Emphasis sections
 * - Required citations
 */

export type RebuttalTone = "formal" | "technical" | "neutral";
export type RebuttalEmphasis =
  | "weather-verification"
  | "photo-evidence"
  | "code-compliance"
  | "scope-matrix"
  | "pricing-comparison"
  | "executive-summary";

export type CarrierStrategy = {
  tone: RebuttalTone;
  emphasize: RebuttalEmphasis[];
  requireCitations: boolean;
};

/**
 * Route carrier to appropriate rebuttal strategy
 */
export function carrierRouter(carrier: string): CarrierStrategy {
  const normalized = carrier.toLowerCase().trim();

  // State Farm - formal tone, weather + photo + code emphasis
  if (normalized.includes("state farm")) {
    return {
      tone: "formal",
      emphasize: ["weather-verification", "photo-evidence", "code-compliance"],
      requireCitations: true,
    };
  }

  // Allstate - technical tone, scope matrix + pricing emphasis
  if (normalized.includes("allstate")) {
    return {
      tone: "technical",
      emphasize: ["scope-matrix", "pricing-comparison"],
      requireCitations: true,
    };
  }

  // Liberty Mutual - formal tone, comprehensive approach
  if (normalized.includes("liberty mutual")) {
    return {
      tone: "formal",
      emphasize: ["executive-summary", "scope-matrix", "photo-evidence"],
      requireCitations: true,
    };
  }

  // Farmers - technical tone, pricing emphasis
  if (normalized.includes("farmers")) {
    return {
      tone: "technical",
      emphasize: ["pricing-comparison", "scope-matrix"],
      requireCitations: true,
    };
  }

  // Progressive - neutral tone, balanced approach
  if (normalized.includes("progressive")) {
    return {
      tone: "neutral",
      emphasize: ["executive-summary", "scope-matrix", "weather-verification"],
      requireCitations: false,
    };
  }

  // USAA - formal tone, code compliance + photo evidence
  if (normalized.includes("usaa")) {
    return {
      tone: "formal",
      emphasize: ["code-compliance", "photo-evidence", "weather-verification"],
      requireCitations: true,
    };
  }

  // Nationwide - neutral tone, comprehensive
  if (normalized.includes("nationwide")) {
    return {
      tone: "neutral",
      emphasize: ["executive-summary", "scope-matrix", "pricing-comparison"],
      requireCitations: false,
    };
  }

  // Default strategy - neutral tone, balanced emphasis
  return {
    tone: "neutral",
    emphasize: ["executive-summary", "scope-matrix"],
    requireCitations: false,
  };
}

/**
 * Get tone descriptor for AI prompt
 */
export function getToneDescriptor(tone: RebuttalTone): string {
  switch (tone) {
    case "formal":
      return "formal and professional with respectful language";
    case "technical":
      return "technical and data-driven with industry terminology";
    case "neutral":
      return "clear and balanced with factual presentation";
  }
}

/**
 * Get emphasis instructions for AI prompt
 */
export function getEmphasisInstructions(emphasis: RebuttalEmphasis[]): string {
  const instructions = emphasis.map((e) => {
    switch (e) {
      case "weather-verification":
        return "Include detailed weather verification data and meteorological evidence";
      case "photo-evidence":
        return "Reference photographic documentation and visual evidence extensively";
      case "code-compliance":
        return "Cite relevant building codes, standards, and compliance requirements";
      case "scope-matrix":
        return "Present detailed scope matrix with line-by-line comparisons";
      case "pricing-comparison":
        return "Provide comprehensive pricing analysis and market rate justification";
      case "executive-summary":
        return "Begin with clear executive summary of key issues and resolutions";
    }
  });

  return instructions.join(". ");
}
