// src/lib/ai/damage.ts
import { getOpenAI } from "@/lib/openai";
import { DAMAGE_BUILDER_SYSTEM_PROMPT } from "@/lib/supplement/ai-prompts";

type RunDamageBuilderInput = {
  claimId?: string | null;
  leadId?: string | null;
  orgId?: string | null;
  userId: string;
  photos: {
    url: string;
    id?: string;
    label?: string;
    tags?: string[];
  }[];
  hoverData?: unknown;
  carrierEstimateText?: string | null;
  notesText?: string | null;
};

export async function runDamageBuilder(input: RunDamageBuilderInput) {
  const openai = getOpenAI();

  // Shape what you send into the prompt
  const payload = {
    claimContext: {
      claim_id: input.claimId,
      leadId: input.leadId,
      orgId: input.orgId,
      userId: input.userId,
    },
    photos: input.photos,
    hoverData: input.hoverData ?? null,
    carrierEstimateText: input.carrierEstimateText ?? null,
    notesText: input.notesText ?? null,
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: DAMAGE_BUILDER_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify(payload),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "DamageBuilderOutput",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                overallAssessment: { type: "string" },
                primaryPeril: { type: "string" },
                confidence: { type: "number" },
              },
              required: ["overallAssessment", "primaryPeril", "confidence"],
              additionalProperties: false,
            },
            findings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  photoId: { type: ["string", "null"] },
                  location: {
                    type: "object",
                    properties: {
                      facet: { type: "string" },
                      elevation: { type: "string" },
                      notes: { type: "string" },
                    },
                    required: ["facet", "elevation", "notes"],
                    additionalProperties: false,
                  },
                  damageType: { type: "string" },
                  material: { type: "string" },
                  severity: { type: "string" },
                  perilAttribution: { type: "string" },
                  description: { type: "string" },
                  recommendedAction: { type: "string" },
                  suggestedLineItems: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        code: { type: "string" },
                        name: { type: "string" },
                        unit: { type: "string" },
                        estimatedQuantity: { type: "number" },
                        reason: { type: "string" },
                      },
                      required: ["code", "name", "unit", "estimatedQuantity", "reason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: [
                  "id",
                  "location",
                  "damageType",
                  "material",
                  "severity",
                  "perilAttribution",
                  "description",
                  "recommendedAction",
                  "suggestedLineItems",
                ],
                additionalProperties: false,
              },
            },
            globalRecommendations: {
              type: "object",
              properties: {
                roofRecommendation: { type: "string" },
                notes: { type: "string" },
                escalationSuggestions: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["roofRecommendation", "notes", "escalationSuggestions"],
              additionalProperties: false,
            },
          },
          required: ["summary", "findings", "globalRecommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");

  // Return normalized shape
  return {
    peril: parsed.summary?.primaryPeril || "unknown",
    confidence: parsed.summary?.confidence || 0,
    summary: parsed.summary?.overallAssessment || "No assessment available",
    findings: parsed.findings || [],
    hoverData: input.hoverData,
    meta: {
      globalRecommendations: parsed.globalRecommendations || {},
      rawResponse: parsed,
    },
  };
}
