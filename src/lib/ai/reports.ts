// src/lib/ai/reports.ts
import { getOpenAI } from "@/lib/openai";
import { REPORT_BUILDER_SYSTEM_PROMPT } from "@/lib/supplement/ai-prompts";

type RunReportBuilderInput = {
  userId: string;
  claimId: string;
  orgId?: string | null;
  reportType: "inspection" | "adjuster" | "homeowner" | "internal";
  title?: string | null;
  include: {
    damage?: boolean;
    weather?: boolean;
    estimate?: boolean;
    supplement?: boolean;
    photos?: boolean;
  };
};

export async function runReportBuilder(input: RunReportBuilderInput) {
  const openai = getOpenAI();

  const payload = {
    claim_id: input.claimId,
    orgId: input.orgId ?? null,
    userId: input.userId,
    reportType: input.reportType,
    title: input.title ?? null,
    include: input.include,
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: REPORT_BUILDER_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(payload, null, 2) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ReportBuilderOutput",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: true,
              },
            },
            summary: { type: "string" },
          },
          required: ["title", "sections", "summary"],
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
