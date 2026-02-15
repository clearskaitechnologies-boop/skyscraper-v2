// src/lib/ai/estimates.ts
import { getOpenAI } from "@/lib/openai";
import { ESTIMATE_BUILDER_SYSTEM_PROMPT } from "@/lib/supplement/ai-prompts";

type RunEstimateBuilderInput = {
  claimId?: string | null;
  orgId?: string | null;
  userId: string;
  mode: "insurance" | "retail" | "hybrid";
  lossType?: string | null;
  dol?: string | null;

  damageAssessmentId?: string | null;
  scopeId?: string | null;
  supplementIds?: string[];
  carrierEstimateText?: string | null;
};

export async function runEstimateBuilder(input: RunEstimateBuilderInput) {
  const openai = getOpenAI();

  const payload = {
    claim_id: input.claimId ?? null,
    orgId: input.orgId ?? null,
    userId: input.userId,
    mode: input.mode,
    lossType: input.lossType ?? null,
    dol: input.dol ?? null,
    sources: {
      damageAssessmentId: input.damageAssessmentId ?? null,
      scopeId: input.scopeId ?? null,
      supplementIds: input.supplementIds ?? [],
      carrierEstimateText: input.carrierEstimateText ?? null,
    },
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: ESTIMATE_BUILDER_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(payload, null, 2) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "EstimateBuilderOutput",
        strict: true,
        schema: {
          type: "object",
          properties: {
            header: {
              type: "object",
              properties: {
                title: { type: "string" },
                mode: { type: "string" },
                lossType: { type: "string" },
                dol: { type: "string" },
              },
              required: ["title", "mode"],
              additionalProperties: false,
            },
            totals: {
              type: "object",
              properties: {
                subtotal: { type: "number" },
                tax: { type: "number" },
                opPercent: { type: "number" },
                opAmount: { type: "number" },
                grandTotal: { type: "number" },
              },
              required: ["subtotal", "grandTotal"],
              additionalProperties: false,
            },
            items: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: true,
              },
            },
            notes: { type: "string" },
          },
          required: ["header", "totals", "items"],
          additionalProperties: false,
        },
      },
    },
    temperature: 0.7,
    max_tokens: 4000,
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
  return parsed;
}
