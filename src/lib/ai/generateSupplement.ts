/**
 * AI Supplement Generator
 *
 * Generates supplement narrative sections around computed deltas.
 * AI writes NARRATIVE ONLY - no math. All numbers come from deterministic delta engine.
 */

import { getOpenAI } from "@/lib/ai/client";
import { computeDeltaStats, Variance } from "@/lib/delta/computeDelta";

const openai = getOpenAI();

export type SupplementSection = {
  title: string;
  content: string;
};

export type SupplementGenerationResult = {
  sections: SupplementSection[];
  tokensUsed: number;
  estimatedCostCents: number;
};

/**
 * Generate supplement sections using AI
 *
 * CRITICAL: AI does NOT compute numbers. All variances are pre-computed.
 * AI only writes narrative explanations around the data.
 * Weather facts are verified external data - AI must reference them, not invent them.
 */
export async function generateSupplement(params: {
  claimId: string;
  variances: Variance[];
  claimData: {
    propertyAddress: string;
    lossDate: string;
    lossType: string;
    policyNumber?: string;
    insured_name?: string;
    carrier?: string;
  };
  weatherFacts?: string | null;
}): Promise<SupplementGenerationResult> {
  const { variances, claimData } = params;
  const stats = computeDeltaStats(variances);

  // Build variance summary for prompt (deterministic data)
  const varianceSummary = variances
    .slice(0, 20) // Top 20 variances
    .map((v, idx) => {
      const adj = v.adjuster
        ? `Adjuster: ${v.adjuster.qty} ${v.adjuster.unit || "units"} @ $${v.adjuster.unitPrice} = $${v.adjuster.total}`
        : "Not included by adjuster";
      const con = v.contractor
        ? `Contractor: ${v.contractor.qty} ${v.contractor.unit || "units"} @ $${v.contractor.unitPrice} = $${v.contractor.total}`
        : "";

      return `${idx + 1}. ${v.description} (${v.kind}, ${v.severity} severity)
   ${adj}
   ${con}
   Delta: $${v.deltaTotal.toFixed(2)}`;
    })
    .join("\n\n");

  const systemPrompt = `You are an expert insurance claims supplement writer. Your job is to write NARRATIVE EXPLANATIONS around pre-computed variance data.

CRITICAL RULES:
1. DO NOT compute any numbers yourself
2. DO NOT change or recalculate any amounts
3. Use ONLY the variance data provided
4. Write clear explanations of WHY the variances exist
5. Reference industry standards, building codes, and best practices
6. Maintain professional, factual tone

WEATHER VERIFICATION RULE:
- If weather facts are provided, you MUST reference them directly
- DO NOT invent or hallucinate weather conditions
- If weather data is unavailable, state that verification is pending
- Always cite the source when referencing weather data

You will receive:
- A list of variances with pre-computed deltas
- Claim information
- Variance statistics
- Optional weather verification data (verified external facts)

Write compelling narrative sections that explain the variances and justify the supplement request.`;

  const weatherSection = params.weatherFacts
    ? `\n\nWEATHER VERIFICATION (VERIFIED EXTERNAL DATA):
${params.weatherFacts}

IMPORTANT: Reference these verified weather facts when relevant to damage justification. Do not invent additional weather details.`
    : "\n\nWEATHER VERIFICATION: Data unavailable for this claim. State that weather verification is pending if relevant to loss type.";

  const userPrompt = `Generate a supplement narrative for the following claim:

CLAIM INFORMATION:
Property: ${claimData.propertyAddress}
Loss Date: ${claimData.lossDate}
Loss Type: ${claimData.lossType}
${claimData.policyNumber ? `Policy: ${claimData.policyNumber}` : ""}
${claimData.insured_name ? `Insured: ${claimData.insured_name}` : ""}
${claimData.carrier ? `Carrier: ${claimData.carrier}` : ""}${weatherSection}

VARIANCE STATISTICS (PRE-COMPUTED):
- Total Variances: ${stats.totalVariances}
- Total Delta: $${stats.totalDelta.toFixed(2)}
- High Severity: ${stats.highSeverity}
- Medium Severity: ${stats.mediumSeverity}
- Low Severity: ${stats.lowSeverity}
- Missing Items: ${stats.missingItems}
- Underpaid Items: ${stats.underpaidItems}
- Quantity Mismatches: ${stats.qtyMismatches}

TOP VARIANCES (PRE-COMPUTED):
${varianceSummary}

Generate the following sections:

1. EXECUTIVE_SUMMARY: Brief overview of the supplement request and total delta
2. VARIANCE_ANALYSIS: Detailed analysis of the variances, grouped by severity
3. MISSING_ITEMS_JUSTIFICATION: Explanation of why missing items are necessary
4. PRICING_JUSTIFICATION: Explanation of pricing differences and market rates
5. CODE_COMPLIANCE: Building code and standard practice justifications
6. CONCLUSION: Summary and recommended action

Return JSON format:
{
  "sections": [
    { "title": "Executive Summary", "content": "..." },
    { "title": "Variance Analysis", "content": "..." },
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
