/**
 * AI Content Generation Pipeline
 * Template-driven AI content generation with validation
 */

import { ExecutiveSummarySchema } from "@/ai/schemas/executive-summary.schema";
import { logger } from "@/lib/logger";
import { PhotoEvidenceSchema } from "@/ai/schemas/photo-evidence.schema";
import { ScopeMatrixSchema } from "@/ai/schemas/scope-matrix.schema";

import { callOpenAIJSON } from "./callOpenAI";
import { validateAndRetry } from "./validateAndRetry";

const SECTION_SCHEMAS: Record<string, any> = {
  executive_summary: ExecutiveSummarySchema,
  photo_evidence: PhotoEvidenceSchema,
  scope_matrix: ScopeMatrixSchema,
};

const SECTION_PROMPTS: Record<string, string> = {
  executive_summary: `You are an expert insurance claims adjuster writing an executive summary.
Generate a clear, professional summary with 1-3 paragraphs covering the key points of this claim.
Return valid JSON matching the schema.`,

  photo_evidence: `You are analyzing photo evidence for an insurance claim.
Generate captions and categorize each photo based on the damage type and severity.
Return valid JSON matching the schema.`,

  scope_matrix: `You are a contractor creating a detailed scope of work.
Generate line items with quantities, units, and pricing for all necessary repairs.
Return valid JSON matching the schema.`,
};

export interface BuildAIContentOptions {
  template: any;
  inputs: Record<string, any>;
}

export async function buildAIContentFromTemplate({
  template,
  inputs,
}: BuildAIContentOptions): Promise<Record<string, any>> {
  const output: Record<string, any> = {};

  for (const section of template.sections) {
    const schema = SECTION_SCHEMAS[section.sectionKey];
    const prompt = SECTION_PROMPTS[section.sectionKey];

    if (!schema || !prompt) {
      logger.warn(`No schema/prompt for section: ${section.sectionKey}`);
      continue;
    }

    const sectionContent = await validateAndRetry({
      call: async () => {
        return callOpenAIJSON({
          system: prompt,
          user: JSON.stringify(inputs),
          temperature: 0.7,
          maxTokens: 1500,
        });
      },
      schema,
      fallback: getFallbackContent(section.sectionKey),
      retries: 2,
    });

    output[section.sectionKey] = sectionContent;
  }

  return output;
}

function getFallbackContent(sectionKey: string): any {
  const fallbacks: Record<string, any> = {
    executive_summary: {
      paragraphs: ["Summary generation unavailable. Please review manually."],
      tone: "neutral",
      confidence: "low",
    },
    photo_evidence: {
      photos: [],
      confidence: "low",
    },
    scope_matrix: {
      lineItems: [],
      subtotal: 0,
      total: 0,
      confidence: "low",
    },
  };

  return fallbacks[sectionKey] || {};
}
