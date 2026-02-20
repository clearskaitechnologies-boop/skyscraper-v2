import { randomUUID } from "crypto";
import { z } from "zod";

import { callOpenAI } from "@/lib/ai/client";
import { sanitizeJsonResponse } from "@/lib/ai/jsonSanitizer";
import prisma from "@/lib/prisma";

import { BaseAgent, parseJsonSafe } from "./baseAgent";

async function generateRebuttal(params: { denialText: string; tone: string; claimId: string }) {
  const claim = await prisma.claims
    .findFirst({
      where: { id: params.claimId },
      include: {
        properties: {
          select: { street: true, city: true, state: true, carrier: true, policyNumber: true },
        },
        claim_supplements: { orderBy: { created_at: "desc" }, take: 3 },
      },
    })
    .catch(() => null);

  const baseInfo = claim
    ? `Claim #${claim.claimNumber || params.claimId}\nCarrier: ${claim.properties?.carrier || "Unknown"}\nPolicy #: ${claim.properties?.policyNumber || "N/A"}`
    : `Claim context unavailable for ${params.claimId}`;

  const prompt = `You are an expert insurance claims advocate. Craft a ${params.tone} rebuttal letter (400-600 words) responding to carrier denial.\n\n${baseInfo}\n\nDENIAL: ${params.denialText}\n\nReturn ONLY JSON with shape {"letter":"...","outline":["Intro",...],"citations":["..."],"attachments":["..."]}`;

  const ai = await callOpenAI<string>({
    tag: "agent_rebuttal",
    model: "gpt-4o",
    system: "Expert insurance claims advocate producing structured rebuttals.",
    messages: [{ role: "user", content: prompt }],
    parseJson: false,
    maxTokens: 1800,
    temperature: 0.7,
    context: { claimId: params.claimId },
  });
  if (!ai.success) throw new Error(ai.error || "AI failed");
  const raw = ai.data || "";
  const jsonResult = sanitizeJsonResponse(raw);
  let data: any = jsonResult.ok ? jsonResult.data : {};
  if (!jsonResult.ok) {
    try {
      data = parseJsonSafe(raw);
    } catch {}
  }
  return {
    letter: data.letter || `(Draft) ${params.denialText.slice(0, 160)}...`,
    outline: Array.isArray(data.outline)
      ? data.outline
      : ["Intro", "Facts", "Policy", "Evidence", "Conclusion"],
    citations: Array.isArray(data.citations) ? data.citations : [],
    attachments: Array.isArray(data.attachments) ? data.attachments : [],
    tokensUsed: ai.tokensUsed || 0,
  };
}

export const RebuttalInput = z.object({
  claimId: z.string().min(1),
  denialText: z.string().min(20),
  tone: z.enum(["professional", "firm", "legal"]).default("professional"),
});

export const RebuttalOutput = z.object({
  letter: z.string(),
  outline: z.array(z.string()),
  citations: z.array(z.string()),
  attachments: z.array(z.string()).optional(),
  tokensUsed: z.number(),
});

export class RebuttalAgent extends BaseAgent<
  z.infer<typeof RebuttalInput>,
  z.infer<typeof RebuttalOutput>
> {
  inputSchema = RebuttalInput;
  outputSchema = RebuttalOutput;
  constructor() {
    super({ name: "rebuttal", version: "1.0.0" });
  }
  protected async run(input) {
    return await generateRebuttal(input);
  }
  protected async after(input, output, ctx) {
    // Persist token usage to ledger if available
    try {
      if (ctx.orgId && output.tokensUsed) {
        await (prisma as any).tokens_ledger
          .create({
            data: {
              id: randomUUID(),
              org_id: ctx.orgId,
              delta: output.tokensUsed * -1, // consumption
              reason: "agent_rebuttal_generation",
              balance_after: 0,
              metadata: { claimId: input.claimId },
            },
          } as any)
          .catch(() => {});
      }
    } catch (e) {
      console.warn("Token ledger write failed", e instanceof Error ? e.message : e);
    }
  }
}
