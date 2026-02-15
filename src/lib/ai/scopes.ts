// src/lib/ai/scopes.ts
import { getOpenAI } from "@/lib/openai";
import { SCOPE_BUILDER_SYSTEM_PROMPT } from "@/lib/supplement/ai-prompts";

type RunScopeBuilderInput = {
  userId: string;
  claimId?: string | null;
  orgId?: string | null;

  carrierEstimateText?: string | null;
  sowText?: string | null;
  notesText?: string | null;
};

export async function runScopeBuilder(input: RunScopeBuilderInput) {
  const openai = getOpenAI();

  const payload = {
    claim_id: input.claimId ?? null,
    orgId: input.orgId ?? null,
    userId: input.userId,
    carrierEstimateText: input.carrierEstimateText ?? null,
    sowText: input.sowText ?? null,
    notesText: input.notesText ?? null,
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SCOPE_BUILDER_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(payload, null, 2) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ScopeBuilderOutput",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            areas: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: true,
              },
            },
            items: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          required: ["summary", "areas", "items"],
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
