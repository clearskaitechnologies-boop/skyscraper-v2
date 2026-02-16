/**
 * AI Rebuttal Generator
 *
 * Generates carrier-aware rebuttal letters for claim denials.
 * Uses carrier router to apply appropriate tone and emphasis.
 */

import { getOpenAI } from "@/lib/ai/client";
import {
  carrierRouter,
  getEmphasisInstructions,
  getToneDescriptor,
} from "@/lib/rebuttals/carrierRouter";

const openai = getOpenAI();

export type RebuttalSection = {
  title: string;
  content: string;
};

export type RebuttalGenerationResult = {
  sections: RebuttalSection[];
  tokensUsed: number;
  estimatedCostCents: number;
};

/**
 * Generate carrier-aware rebuttal letter
 *
 * Weather facts are verified external data - AI must reference them, not invent them.
 */
export async function generateRebuttal(params: {
  claimId: string;
  denialReason: string;
  carrier: string;
  claimData: {
    propertyAddress: string;
    lossDate: string;
    lossType: string;
    policyNumber?: string;
    insured_name?: string;
    adjusterName?: string;
    estimateAmount?: number;
  };
  evidenceReferences?: {
    photos?: string[];
    weatherData?: string;
    measurements?: string[];
    codes?: string[];
  };
  weatherFacts?: string | null;
}): Promise<RebuttalGenerationResult> {
  const { denialReason, carrier, claimData, evidenceReferences } = params;

  // Get carrier-specific strategy
  const strategy = carrierRouter(carrier);
  const toneDescriptor = getToneDescriptor(strategy.tone);
  const emphasisInstructions = getEmphasisInstructions(strategy.emphasize);

  // Build evidence summary
  const evidenceSummary = evidenceReferences
    ? `
AVAILABLE EVIDENCE:
${evidenceReferences.photos ? `- Photos: ${evidenceReferences.photos.length} images available` : ""}
${evidenceReferences.weatherData ? `- Weather Data: ${evidenceReferences.weatherData}` : ""}
${evidenceReferences.measurements ? `- Measurements: ${evidenceReferences.measurements.join(", ")}` : ""}
${evidenceReferences.codes ? `- Building Codes: ${evidenceReferences.codes.join(", ")}` : ""}
`
    : "";

  const systemPrompt = `You are an expert insurance claims rebuttal writer specializing in ${carrier} claims. Your job is to write persuasive, well-documented rebuttal letters that address denial reasons with factual evidence.

CARRIER-SPECIFIC REQUIREMENTS:
- Carrier: ${carrier}
- Tone: ${toneDescriptor}
- Emphasis: ${emphasisInstructions}
${strategy.requireCitations ? "- Citations: Required - reference specific policy language, codes, and evidence" : "- Citations: Optional"}

WRITING GUIDELINES:
1. Address the specific denial reason directly
2. Present counter-arguments with supporting evidence
3. Reference policy language and coverage provisions
4. Cite building codes and industry standards when applicable
5. Include weather verification data if relevant
6. Reference photographic evidence extensively
7. Maintain ${toneDescriptor} throughout
8. Structure as professional business letter
9. Include specific action requested

WEATHER VERIFICATION RULE:
- If weather facts are provided, you MUST reference them directly with source citation
- DO NOT invent or hallucinate weather conditions
- If weather data is unavailable, state that verification is pending
- Weather data strengthens causation arguments - use strategically

Write a compelling rebuttal that increases the likelihood of claim approval or reconsideration.`;

  const weatherSection = params.weatherFacts
    ? `\n\nWEATHER VERIFICATION (VERIFIED EXTERNAL DATA):
${params.weatherFacts}

IMPORTANT: Reference these verified weather facts with source citation when discussing causation. Do not invent additional weather details.`
    : "\n\nWEATHER VERIFICATION: Data unavailable for this claim. State that weather verification is pending if relevant to rebuttal.";

  const userPrompt = `Generate a rebuttal letter for the following claim denial:

CLAIM INFORMATION:
Property: ${claimData.propertyAddress}
Loss Date: ${claimData.lossDate}
Loss Type: ${claimData.lossType}
${claimData.policyNumber ? `Policy Number: ${claimData.policyNumber}` : ""}
${claimData.insured_name ? `Insured: ${claimData.insured_name}` : ""}
${claimData.adjusterName ? `Adjuster: ${claimData.adjusterName}` : ""}
${claimData.estimateAmount ? `Current Estimate: $${claimData.estimateAmount.toFixed(2)}` : ""}

DENIAL REASON:
${denialReason}

${evidenceSummary}${weatherSection}

Generate the following sections for a ${carrier} rebuttal letter:

1. OPENING: Professional greeting and purpose statement
2. DENIAL_ACKNOWLEDGMENT: Acknowledge the denial and state intent to contest
3. POLICY_COVERAGE_ANALYSIS: Analysis of relevant policy provisions
4. COUNTER_ARGUMENTS: Point-by-point rebuttal of denial reasons
5. EVIDENCE_PRESENTATION: Presentation of supporting evidence (photos, weather, measurements, codes)
6. INDUSTRY_STANDARDS: Reference to building codes, best practices, and standards
7. DAMAGE_CAUSATION: Clear explanation of how loss event caused the damage
8. REQUESTED_ACTION: Specific action requested (reconsideration, additional inspection, etc.)
9. CLOSING: Professional closing with contact information

Return JSON format:
{
  "sections": [
    { "title": "Opening", "content": "..." },
    { "title": "Denial Acknowledgment", "content": "..." },
    ...
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(completion.choices[0].message.content || "{}");
  const tokensUsed = completion.usage?.total_tokens || 0;
  const estimatedCostCents = Math.ceil((tokensUsed / 1000) * 1.5); // ~$0.015 per 1K tokens

  return {
    sections: result.sections || [],
    tokensUsed,
    estimatedCostCents,
  };
}
