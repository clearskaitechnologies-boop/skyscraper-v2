// src/lib/ai/supplements.ts
import { safeAI } from "@/lib/aiGuard";
import { getOpenAI } from "@/lib/openai";
import { SUPPLEMENT_BUILDER_SYSTEM_PROMPT } from "@/lib/supplement/ai-prompts";

type RunSupplementBuilderInput = {
  claimId?: string | null;
  orgId?: string | null;
  userId: string;

  carrierEstimateText: string;
  hoverJson?: unknown;
  scopeText?: string | null;
  photos?: { url: string; label?: string }[];
};

export async function runSupplementBuilder(input: RunSupplementBuilderInput) {
  const openai = getOpenAI();

  const payload = {
    claim_id: input.claimId ?? null,
    orgId: input.orgId ?? null,
    userId: input.userId,
    carrierEstimateText: input.carrierEstimateText,
    hoverJson: input.hoverJson ?? null,
    scopeText: input.scopeText ?? null,
    photos: input.photos ?? [],
  };

  const ai = await safeAI("supplement-builder", () =>
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SUPPLEMENT_BUILDER_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(payload, null, 2) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "SupplementBuilderOutput",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              xactimateItems: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: true,
                },
              },
              notesToAdjuster: { type: "string" },
            },
            required: ["summary", "xactimateItems"],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.7,
      max_tokens: 4000,
    })
  );

  if (!ai.ok) {
    throw new Error(ai.error);
  }

  const parsed = JSON.parse(ai.result.choices[0]?.message?.content || "{}");
  return parsed;
}
