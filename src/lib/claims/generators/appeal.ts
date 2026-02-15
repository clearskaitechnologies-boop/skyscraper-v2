/**
 * PHASE 50 - AUTO-APPEAL GENERATOR
 * Generates appeal packages for denied/undervalued claims
 * 
 * When something is:
 * - Denied
 * - Undervalued
 * - Missing
 * - Contradicted
 * - Unreasonable
 * 
 * The system auto-generates:
 * ✔ Appeal letter
 * ✔ Policy language references
 * ✔ Reasonable carrier expectations
 * ✔ Evidence attachments
 * ✔ Safety concerns
 * ✔ Code requirements
 * ✔ Material requirements
 * ✔ Photos + video references
 */

import { callOpenAI } from "@/lib/ai/client";
import prisma from "@/lib/prisma";

import { generateCodeSummary } from "./code";
import { generateNarrative } from "./narrative";

export interface AppealPackage {
  appealLetter: string;
  policyReferences: string[];
  evidenceSummary: string;
  codeRequirements: string[];
  safetyConcerns: string[];
  photoReferences: string[];
  videoReferences: string[];
  carrierContradictions: string[];
  recommendedNextSteps: string[];
  generatedAt: Date;
}

/**
 * Generate a complete appeal package
 */
export async function generateAppeal(
  claimId: string,
  denialReason: string,
  denialDetails?: string
): Promise<AppealPackage> {
  try {
    console.log(`[appeal] Generating appeal for claim ${claimId}`);
    console.log(`[appeal] Denial reason: ${denialReason}`);

    // 1. Fetch claim with all evidence
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      include: {
        properties: true,
        weather_reports: {
          orderBy: { createdAt: "desc" },
        },
        damage_assessments: {
          orderBy: { created_at: "desc" },
        },
        estimates: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        supplements: {
          orderBy: { created_at: "desc" },
        },
        claim_activities: {
          where: {
            type: { in: ["FILE_UPLOAD", "NOTE", "STATUS_CHANGE"] },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!claim) {
      throw new Error(`Claim ${claimId} not found`);
    }

    // 2. Generate narrative if not exists
    const narrative = await generateNarrative(claimId, "adjuster");

    // 3. Generate code summary
    const codeSummary = await generateCodeSummary(claimId);

    // 4. Fetch video reports
    const lead = await prisma.leads.findFirst({
      where: { claimId: claim.id },
    });

    const videoReports = lead
      ? await prisma.ai_reports.findMany({
          where: { 
            type: "video_report",
            leadId: lead.id 
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    // 5. Build appeal context
    const context = {
      claim,
      denialReason,
      denialDetails,
      narrative,
      codeSummary,
      videoReports,
      weatherEvents: (claim as any).weather_reports || [],
      damageAssessments: (claim as any).damage_assessments || [],
      estimate: (claim as any).estimates?.[0],
      supplements: (claim as any).supplements || [],
    };

    // 6. Generate appeal letter using GPT-4o
    const appealLetter = await generateAppealLetter(context);

    // 7. Extract policy references
    const policyReferences = extractPolicyReferences(context);

    // 8. Build evidence summary
    const evidenceSummary = buildEvidenceSummary(context);

    // 9. Extract photo/video references
    const photoReferences = extractPhotoReferences((claim as any).claim_activities || []);
    const videoRefs = videoReports.map((v: any) => v.video_url || v.title);

    // 10. Identify contradictions
    const contradictions = identifyContradictions(context);

    console.log(`[appeal] Generated appeal package for claim ${claimId}`);

    return {
      appealLetter,
      policyReferences,
      evidenceSummary,
      codeRequirements: codeSummary.requiredItems,
      safetyConcerns: codeSummary.safetyConcerns,
      photoReferences,
      videoReferences: videoRefs,
      carrierContradictions: contradictions,
      recommendedNextSteps: [
        "Schedule re-inspection with adjuster present",
        "Submit all code requirement documentation",
        "Provide manufacturer specifications for required materials",
        "Request written explanation of coverage position",
        "Escalate to carrier supervisor if needed",
      ],
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("[appeal] Generation failed:", error);
    throw new Error(`Failed to generate appeal: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate the appeal letter using AI
 */
async function generateAppealLetter(context: any): Promise<string> {
  const prompt = `Generate a professional insurance claim appeal letter for the following situation:

**CLAIM INFORMATION:**
- Claim Number: ${context.claim.claimNumber || "Pending"}
- Property: ${context.claim.properties?.street}, ${context.claim.properties?.city}, ${context.claim.properties?.state}
- Date of Loss: ${context.claim.dateOfLoss ? new Date(context.claim.dateOfLoss).toLocaleDateString() : "Unknown"}

**DENIAL REASON:**
${context.denialReason}

${context.denialDetails ? `**DENIAL DETAILS:**\n${context.denialDetails}` : ""}

**OUR POSITION:**
${context.narrative.carrierRecommendation}

**WEATHER EVIDENCE:**
${context.weatherEvents.length > 0 ? context.weatherEvents.map((w: any) => `- ${w.eventType} on ${new Date(w.reportDate).toLocaleDateString()} with ${w.maxWindSpeed || "N/A"} mph winds and ${w.maxHailSize || "N/A"}" hail`).join("\n") : "Weather data pending"}

**DAMAGE EVIDENCE:**
${context.damageAssessments.length > 0 ? context.damageAssessments.map((d: any) => `- ${d.damageType}: ${d.severity} severity`).join("\n") : "Damage assessments in progress"}

**CODE REQUIREMENTS:**
${context.codeSummary.requiredItems.length > 0 ? context.codeSummary.requiredItems.join("\n") : "Code requirements documented separately"}

**ESTIMATED LOSS:**
${context.estimate ? `$${context.estimate.totalAmount?.toLocaleString() || "TBD"}` : "Estimate pending"}

Please write a professional appeal letter that:
1. Respectfully challenges the denial
2. References policy language and coverage
3. Cites applicable building codes
4. References weather data and damage evidence
5. Requests specific reconsideration
6. Maintains professional tone throughout
7. Includes clear call to action

Format as a formal business letter.`;

  const result = await callOpenAI<string>({
    tag: "appeal_letter",
    model: "gpt-4o",
    system: `You are an expert insurance claim consultant writing an appeal letter. Be professional, factual, and persuasive. Reference policy language, building codes, and evidence. Maintain a respectful but firm tone.`,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    maxTokens: 2000,
    context: { claimId: context.claim.id },
  });

  if (!result.success) {
    throw new Error(`Appeal letter generation failed: ${result.error}`);
  }

  return result.raw || "";
}

/**
 * Extract policy references from context
 */
function extractPolicyReferences(context: any): string[] {
  const references: string[] = [];

  // Common policy provisions
  references.push("Coverage A - Dwelling");
  references.push("Coverage B - Other Structures");
  
  if (context.weatherEvents.some((w: any) => w.eventType?.includes("HAIL"))) {
    references.push("Wind and Hail Damage Coverage");
  }

  if (context.weatherEvents.some((w: any) => w.eventType?.includes("WIND"))) {
    references.push("Windstorm Coverage");
  }

  if (context.codeSummary.requiredItems.length > 0) {
    references.push("Code Upgrade Coverage (Ordinance or Law)");
  }

  references.push("Replacement Cost Value (RCV) Coverage");
  references.push("Additional Living Expenses (if applicable)");

  return references;
}

/**
 * Build comprehensive evidence summary
 */
function buildEvidenceSummary(context: any): string {
  let summary = "**EVIDENCE PACKAGE SUMMARY:**\n\n";

  summary += `**Weather Data:** ${context.weatherEvents.length} documented storm event(s)\n`;
  summary += `**Damage Assessments:** ${context.damageAssessments.length} professional assessment(s)\n`;
  summary += `**Photo Documentation:** ${context.claim.claim_activities.length} photo(s) uploaded\n`;
  summary += `**Video Reports:** ${context.videoReports.length} video report(s) available\n`;
  summary += `**Estimates:** ${context.claim.estimates?.length || 0} detailed estimate(s)\n`;
  summary += `**Supplements:** ${context.supplements.length} supplement(s) submitted\n`;

  return summary;
}

/**
 * Extract photo references from activities
 */
function extractPhotoReferences(activities: any[]): string[] {
  return activities
    .filter((a) => a.activityType === "PHOTO_UPLOADED")
    .map((a) => a.description || "Photo evidence")
    .slice(0, 10); // Limit to 10 most recent
}

/**
 * Identify carrier contradictions
 */
function identifyContradictions(context: any): string[] {
  const contradictions: string[] = [];

  // Example logic - customize based on actual denial patterns
  if (context.denialReason.toLowerCase().includes("pre-existing") && context.weatherEvents.length > 0) {
    contradictions.push(
      "Carrier claims pre-existing damage, but documented storm event occurred on " +
        new Date(context.weatherEvents[0].reportDate).toLocaleDateString()
    );
  }

  if (context.denialReason.toLowerCase().includes("wear and tear") && context.damageAssessments.length > 0) {
    contradictions.push("Carrier claims wear and tear, but professional assessment shows storm damage");
  }

  if (context.denialReason.toLowerCase().includes("insufficient") && context.claim.claim_activities.length > 5) {
    contradictions.push(`Carrier claims insufficient documentation, but ${context.claim.claim_activities.length} pieces of evidence were provided`);
  }

  return contradictions;
}
