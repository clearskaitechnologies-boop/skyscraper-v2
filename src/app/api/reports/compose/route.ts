import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getOpenAI } from "@/lib/ai/client";

/**
 * AI REPORT COMPOSITION ENDPOINT
 *
 * This is the DETERMINISTIC AI mode for writing reports.
 * NOT chat mode - this writes section-by-section content for templates.
 *
 * Input: Report context (from /api/reports/context) + sections to generate
 * Output: Structured text keyed by section ID
 *
 * RULES:
 * - Uses ONLY provided context data
 * - No hallucinations
 * - No guessing
 * - If data missing, state "Not observed" or "Data unavailable"
 */

const openai = getOpenAI();

const REPORT_WRITER_SYSTEM_PROMPT = `You are a professional report writer specializing in insurance claims and property damage assessments.

Your role is to write clear, accurate, factual report sections based ONLY on the provided context data.

CRITICAL RULES:
1. Use ONLY the data provided in the context object
2. NEVER invent or hallucinate data
3. If information is missing, explicitly state "Not observed" or "Data unavailable"
4. Write in professional, formal tone suitable for insurance adjusters
5. Be concise but thorough
6. Use specific measurements and observations when available
7. Follow the template structure exactly

OUTPUT FORMAT:
Return a JSON object with section IDs as keys and generated content as values.

Example:
{
  "executiveSummary": "On January 15, 2025, the property at 123 Main St sustained wind damage...",
  "damageAssessment": "Visual inspection revealed...",
  "weatherAnalysis": "Weather data from Open-Meteo indicates..."
}
`;

interface ComposeRequest {
  context: any; // Full report context from /api/reports/context
  sections: string[]; // Section IDs to generate
  instructions?: string; // Optional additional instructions
}

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body: ComposeRequest = await req.json();
    const { context, sections, instructions } = body;

    if (!context || !sections || sections.length === 0) {
      return NextResponse.json({ error: "CONTEXT_AND_SECTIONS_REQUIRED" }, { status: 400 });
    }

    // Build section prompts
    const sectionPrompts = sections.map((sectionId) => {
      switch (sectionId) {
        case "executiveSummary":
          return "Write a concise executive summary (2-3 paragraphs) covering the claim, property, loss date, and primary findings.";
        case "damageAssessment":
          return "Write a detailed damage assessment based on the findings, photos, and notes. Organize by area/severity.";
        case "weatherAnalysis":
          return "Write a weather analysis section using the provided weather data. Include event timing, hail size, wind speeds, and verification statement.";
        case "scopeComparison":
          return "Write a scope comparison section analyzing variances between adjuster and contractor scopes. Highlight discrepancies.";
        case "photoDocumentation":
          return "Write a photo documentation section describing each categorized photo set (roof, exterior, interior, detail).";
        case "recommendations":
          return "Write recommendations for next steps, repair priorities, and any additional investigations needed.";
        case "carrierStrategy":
          return "Write carrier-specific strategy notes based on carrier rules and historical approval patterns.";
        default:
          return `Write the ${sectionId} section based on the provided context.`;
      }
    });

    // Call OpenAI with context
    const userPrompt = `
Report Context:
${JSON.stringify(context, null, 2)}

Generate the following sections:
${sections.map((id, idx) => `${idx + 1}. ${id}: ${sectionPrompts[idx]}`).join("\n")}

${instructions ? `\nAdditional Instructions: ${instructions}` : ""}

Return a JSON object with section IDs as keys and generated content as values.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: REPORT_WRITER_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3, // Low temperature for consistency
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "AI_GENERATION_FAILED" }, { status: 500 });
    }

    // Parse JSON response
    let composedSections: Record<string, string>;
    try {
      composedSections = JSON.parse(content);
    } catch (error) {
      logger.error("[COMPOSE] JSON parse failed:", error);
      return NextResponse.json({ error: "AI_RESPONSE_INVALID_JSON" }, { status: 500 });
    }

    // Validate all requested sections were generated
    const missingSections = sections.filter((id) => !composedSections[id]);

    if (missingSections.length > 0) {
      logger.warn("[COMPOSE] Missing sections:", missingSections);
    }

    return NextResponse.json({
      ok: true,
      sections: composedSections,
      missingSections,
      tokensUsed: response.usage?.total_tokens || 0,
      model: response.model,
    });
  } catch (error) {
    logger.error("[COMPOSE] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}
