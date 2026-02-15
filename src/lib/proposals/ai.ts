/**
 * PHASE 3 SPRINT 3: AI Content Engine
 * Uses OpenAI GPT-4o to generate proposal sections (summary, scope, terms, notes)
 */

import OpenAI from "openai";

import { safeAI } from "@/lib/aiGuard";

import type { AIDraftSections, PacketType,ProposalContext } from "./types";

const MODEL = "gpt-4o-mini"; // Fast and cost-effective for structured content
const TOKEN_COST = 2; // Costs 2 tokens per proposal generation

export type TonePreset = "homeowner" | "gc" | "carrier" | "pa-legal";

// Lazy-load OpenAI client to avoid build-time initialization
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Generate AI-drafted proposal sections based on context and packet type
 */
export async function draftProposalSections(
  context: ProposalContext,
  packetType: PacketType,
  tone?: TonePreset
): Promise<AIDraftSections> {
  const systemPrompt = buildSystemPrompt(packetType, tone);
  const userPrompt = buildUserPrompt(context, packetType);

  try {
    // Call OpenAI API with retry logic
    const response = await callOpenAIWithRetry(systemPrompt, userPrompt);

    // Parse response into 4 sections separated by §§
    const sections = response.split("§§").map((s) => s.trim());

    if (sections.length !== 4) {
      console.error("AI response did not return exactly 4 sections:", sections.length);
      // Fallback to basic sections
      return buildFallbackSections(context, packetType);
    }

    return {
      summary: sections[0],
      scope: sections[1],
      terms: sections[2],
      notes: sections[3],
    };
  } catch (error) {
    console.error("AI drafting failed:", error);
    // Return basic fallback content
    return buildFallbackSections(context, packetType);
  }
}

/**
 * Call OpenAI API with retry logic (2 attempts with exponential backoff)
 */
async function callOpenAIWithRetry(
  systemPrompt: string,
  userPrompt: string,
  attempt = 1
): Promise<string> {
  try {
    const openai = getOpenAI(); // Lazy-load OpenAI client
    const ai = await safeAI("proposal-draft", () =>
      openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })
    );

    if (!ai.ok) {
      throw new Error(ai.error);
    }

    const completion = ai.result;
    const content = completion.choices[0]?.message?.content || "";

    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    return content;
  } catch (error) {
    const isRetryable = attempt < 2;
    const backoffMs = attempt * 1000; // 1s, 2s exponential backoff

    if (isRetryable) {
      console.warn(
        `OpenAI attempt ${attempt} failed: ${error instanceof Error ? error.message : "Unknown error"}. Retrying in ${backoffMs}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      return callOpenAIWithRetry(systemPrompt, userPrompt, attempt + 1);
    }

    // Final failure after retries
    console.error("OpenAI failed after all retry attempts:", error);
    throw new Error("AI temporarily unavailable - please try again");
  }
}

/**
 * Get tone-specific writing instructions
 */
function getToneInstructions(tone?: TonePreset): string {
  if (!tone) return "";

  const toneMap: Record<TonePreset, string> = {
    homeowner:
      "TONE: Warm, reassuring, and educational. Speak directly to the homeowner as a trusted advisor. Avoid jargon.",
    gc: "TONE: Professional, detail-oriented, and efficient. Focus on specs, timelines, and deliverables. Use industry terminology.",
    carrier:
      "TONE: Formal, evidence-based, and compliant. Reference policy coverage, industry standards, and documentation. Be conservative.",
    "pa-legal":
      "TONE: Precise, legally defensible, and thoroughly documented. Cite specific damage, causation, and scope. Minimize subjective language.",
  };

  return toneMap[tone];
}

/**
 * Build system prompt based on packet type and optional tone preset
 */
function buildSystemPrompt(packetType: PacketType, tone?: TonePreset): string {
  // Get tone-specific instructions
  const toneInstructions = getToneInstructions(tone);

  if (packetType === "retail") {
    return `You are an expert roofing sales professional writing a compelling proposal for a residential client. Your goal is to:
1. Build trust and demonstrate expertise
2. Clearly explain the scope of work
3. Present fair pricing and payment terms
4. Make it easy for the client to say yes

${toneInstructions}

Format your response with exactly 4 sections separated by "§§":
1. Executive Summary (2-3 sentences highlighting the problem, solution, and value)
2. Scope of Work (bulleted list of specific tasks and deliverables)
3. Terms & Pricing (payment schedule, timeline, warranties)
4. Additional Notes (safety protocols, cleanup, permits, etc.)

Use professional but friendly language. Be specific and transparent.`;
  } else if (packetType === "contractor") {
    return `You are a technical project manager preparing a work order for a general contractor or facility manager. Your goal is to:
1. Provide precise technical specifications
2. List all materials and equipment clearly
3. Define deliverables and timeline
4. Maintain neutral, factual tone

${toneInstructions}

Format your response with exactly 4 sections separated by "§§":
1. Executive Summary (brief project overview, no sales language)
2. Scope of Work (detailed technical specifications, materials list)
3. Terms & Conditions (payment terms, change order policy, warranties)
4. Additional Notes (coordination, access requirements, site conditions)

Use factual, neutral language. Focus on specifications and deliverables.`;
  } else {
    // claims
    return `You are an insurance claims specialist preparing a carrier-ready claims packet. Your goal is to:
1. Document causation and damages clearly
2. Support all claims with evidence
3. Present information in a format insurance adjusters expect
4. Maximize the likelihood of claim approval

${toneInstructions}

Format your response with exactly 4 sections separated by "§§":
1. Claim Summary (damage type, date of loss, estimated repair cost)
2. Causation & Scope of Damages (detailed description linking damage to covered peril)
3. Supporting Documentation (reference to evidence, weather reports, DOL analysis)
4. Recommendations (repair approach, timeline, special considerations)

Use formal, professional language. Focus on facts and evidence.`;
  }
}

/**
 * Sanitize user input to prevent prompt injection
 */
function sanitizeInput(value: string | null | undefined): string {
  if (!value) return "";

  // Remove potential prompt injection patterns
  return value
    .replace(/```/g, "") // Remove code blocks
    .replace(/###/g, "") // Remove markdown headers
    .replace(/System:|Assistant:|User:/gi, "") // Remove role markers
    .trim();
}

/**
 * Build user prompt with all context data
 */
function buildUserPrompt(context: ProposalContext, packetType: PacketType): string {
  const parts: string[] = [];

  parts.push("=== ORGANIZATION ===");
  parts.push(`Company: ${sanitizeInput(context.org.name)}`);
  if (context.org.contactPhone) parts.push(`Phone: ${sanitizeInput(context.org.contactPhone)}`);
  if (context.org.contactEmail) parts.push(`Email: ${sanitizeInput(context.org.contactEmail)}`);

  parts.push("\n=== CLIENT ===");
  parts.push(`Name: ${sanitizeInput(context.client.name)}`);
  if (context.client.email) parts.push(`Email: ${sanitizeInput(context.client.email)}`);
  if (context.client.phone) parts.push(`Phone: ${sanitizeInput(context.client.phone)}`);
  if (context.client.address) parts.push(`Address: ${sanitizeInput(context.client.address)}`);

  if (packetType === "claims") {
    if (context.client.carrier) parts.push(`Carrier: ${context.client.carrier}`);
    if (context.client.claimNumber) parts.push(`Claim #: ${context.client.claimNumber}`);
  }

  parts.push("\n=== JOB DETAILS ===");
  parts.push(`Title: ${context.job.title}`);
  if (context.job.description) parts.push(`Description: ${context.job.description}`);
  if (context.job.propertyType) parts.push(`Property Type: ${context.job.propertyType}`);
  if (context.job.lossType) parts.push(`Loss Type: ${context.job.lossType}`);
  if (context.job.lossDate)
    parts.push(`Date of Loss: ${context.job.lossDate.toLocaleDateString()}`);
  if (context.job.sqft) parts.push(`Square Footage: ${context.job.sqft}`);

  parts.push(`\nEvidence Photos: ${context.evidence.length} items`);

  if (context.weather) {
    parts.push("\n=== WEATHER DATA ===");
    if (context.weather.summary) parts.push(`Summary: ${context.weather.summary}`);
    if (context.weather.windMph) parts.push(`Wind: ${context.weather.windMph} mph`);
    if (context.weather.precipIn) parts.push(`Precipitation: ${context.weather.precipIn} inches`);
  }

  if (context.dol) {
    parts.push("\n=== DAMAGE ANALYSIS ===");
    if (context.dol.summary) parts.push(`Summary: ${context.dol.summary}`);
    if (context.dol.causation) parts.push(`Causation: ${context.dol.causation}`);
    if (context.dol.recommendations) parts.push(`Recommendations: ${context.dol.recommendations}`);
  }

  return parts.join("\n");
}

/**
 * Build fallback sections if AI fails
 */
function buildFallbackSections(context: ProposalContext, packetType: PacketType): AIDraftSections {
  if (packetType === "retail") {
    return {
      summary: `${context.org.name} proposes to complete ${context.job.title} for ${context.client.name}. This project addresses ${context.job.lossType || "property damage"} and includes comprehensive repairs with warranty protection.`,
      scope: `• Complete inspection and assessment\n• Material procurement and delivery\n• Professional installation by certified crew\n• Site cleanup and debris removal\n• Final walkthrough and quality assurance`,
      terms: `Payment: 50% deposit, 50% upon completion\nTimeline: To be scheduled upon agreement\nWarranty: Labor and materials warranty included`,
      notes: `All work performed to local building codes. Permits obtained as required. Crew follows strict safety protocols. Daily site cleanup included.`,
    };
  } else {
    return {
      summary: `Claim for ${context.job.lossType || "property damage"} at ${context.client.address}. Date of Loss: ${context.job.lossDate?.toLocaleDateString() || "TBD"}. Estimated damages documented with ${context.evidence.length} photos.`,
      scope: `Damage: ${context.job.description || "Assessment required"}\n\nCausation: ${context.dol?.causation || "Covered peril to be confirmed"}\n\nRequired Repairs: Detailed scope to be determined upon adjuster approval.`,
      terms: `Evidence Attached: ${context.evidence.length} photos\nWeather Report: ${context.weather ? "Attached" : "Not available"}\nDamage Assessment: ${context.dol ? "Attached" : "Pending"}`,
      notes: `Insured: ${context.client.name}\nCarrier: ${context.client.carrier || "TBD"}\nClaim #: ${context.client.claimNumber || "Pending"}\n\nThis packet includes comprehensive documentation to support claim approval.`,
    };
  }
}
