/**
 * Feature Flags - Production-safe toggles
 * Prevents demo crashes when services are unavailable
 */

export const FeatureFlags = {
  // AI Features
  OPENAI_ENABLED: !!process.env.OPENAI_API_KEY,
  MOCKUPS_ENABLED: !!process.env.OPENAI_API_KEY && process.env.FEATURE_MOCKUPS !== "false",
  AI_ASSISTANT_ENABLED:
    !!process.env.OPENAI_API_KEY && process.env.FEATURE_AI_ASSISTANT !== "false",

  // PDF Generation
  PDF_GENERATION_ENABLED: process.env.FEATURE_PDF_GENERATION !== "false",
  PUPPETEER_ENABLED: process.env.FEATURE_PUPPETEER !== "false",

  // Storage
  SUPABASE_ENABLED: !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ),

  // Timeouts (in ms)
  PDF_RENDER_TIMEOUT: parseInt(process.env.PDF_RENDER_TIMEOUT || "25000"),
  AI_REQUEST_TIMEOUT: parseInt(process.env.AI_REQUEST_TIMEOUT || "30000"),
} as const;

/**
 * Get feature flag status for debugging
 */
export function getFeatureFlagStatus() {
  return {
    openai: FeatureFlags.OPENAI_ENABLED,
    mockups: FeatureFlags.MOCKUPS_ENABLED,
    aiAssistant: FeatureFlags.AI_ASSISTANT_ENABLED,
    pdfGeneration: FeatureFlags.PDF_GENERATION_ENABLED,
    puppeteer: FeatureFlags.PUPPETEER_ENABLED,
    supabase: FeatureFlags.SUPABASE_ENABLED,
    timeouts: {
      pdfRender: FeatureFlags.PDF_RENDER_TIMEOUT,
      aiRequest: FeatureFlags.AI_REQUEST_TIMEOUT,
    },
  };
}

/**
 * Feature not available response
 */
export function featureDisabledResponse(feature: string, reason?: string) {
  return {
    ok: false,
    error: "FEATURE_DISABLED",
    message: `${feature} is currently unavailable${reason ? `: ${reason}` : ""}`,
    featureFlag: feature,
  };
}
