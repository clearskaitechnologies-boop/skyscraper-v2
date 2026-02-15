/**
 * AI Action Logging Integration Examples
 *
 * These are reference implementations showing exactly where and how to add
 * logAIAction() calls to your existing AI features.
 *
 * Copy these patterns into your actual files.
 */

// ============================================
// EXAMPLE 1: Estimate Generation (costEstimation.ts)
// ============================================

import { getAgentByName } from "@/lib/ai/agents";
import { logAIAction } from "@/lib/ai/feedback/logAction";

// After generating estimate in your generateCostEstimate function:

async function generateCostEstimateWithLogging(request: EstimateRequest) {
  // ... your existing estimate generation code ...

  const estimate = await generateCostEstimate(request);

  // 🔥 ADD THIS: Log the AI action
  try {
    const agent = await getAgentByName("EstimateAgent");
    if (agent) {
      await logAIAction({
        claimId: request.claimId || "unknown", // Use actual claim ID
        agentId: agent.id,
        actionType: "generate_estimate",
        inputData: {
          damageTypes: request.damageTypes,
          roofType: request.roofType,
          sqft: request.sqft,
          carrier: request.carrier,
          photoCount: request.photos?.length || 0,
          region: request.region,
        },
        outputData: {
          estimateTotal: estimate.totalCost,
          lineItemCount: estimate.items?.length || 0,
          materialsCost: estimate.materialsCost,
          laborCost: estimate.laborCost,
          confidenceScore: estimate.confidence,
        },
      });
    }
  } catch (error) {
    console.error("Failed to log AI action:", error);
    // Don't fail the estimate generation if logging fails
  }

  return estimate;
}

// ============================================
// EXAMPLE 2: Letter Generation (automation.ts or similar)
// ============================================

async function generateLetterWithLogging(params: {
  claimId: string;
  letterType: "appeal" | "supplement";
  denialReason?: string;
  carrier: string;
}) {
  // ... your existing letter generation code ...

  const letter = await generateLetter(params);

  // 🔥 ADD THIS: Log the AI action
  try {
    const agentName = params.letterType === "appeal" ? "AppealAgent" : "SupplementAgent";
    const agent = await getAgentByName(agentName);

    if (agent) {
      await logAIAction({
        claimId: params.claimId,
        agentId: agent.id,
        actionType: "generate_letter",
        inputData: {
          letterType: params.letterType,
          denialReason: params.denialReason,
          carrier: params.carrier,
          claimContext: "full_context_here", // Include relevant claim data
        },
        outputData: {
          letter: letter.content,
          wordCount: letter.content.split(" ").length,
          codeCitations: extractCodeCitations(letter.content).length,
          photoReferences: extractPhotoReferences(letter.content).length,
          tone: letter.tone || "professional",
        },
      });
    }
  } catch (error) {
    console.error("Failed to log AI action:", error);
  }

  return letter;
}

// Helper functions
function extractCodeCitations(text: string): string[] {
  const matches = text.match(/IRC\s+[RS]\d+\.\d+/g) || [];
  return matches;
}

function extractPhotoReferences(text: string): string[] {
  const matches = text.match(/photo\s+\d+|image\s+\d+/gi) || [];
  return matches;
}

// ============================================
// EXAMPLE 3: Outcome Logging (when claim resolves)
// ============================================

import { getClaimActions } from "@/lib/ai/feedback/logAction";
import { logAIOutcome } from "@/lib/ai/feedback/logOutcome";

async function updateClaimStatusWithOutcome(claimId: string, status: string, metadata: any) {
  // ... your existing status update code ...

  await updateClaimStatus(claimId, status);

  // 🔥 ADD THIS: Log the outcome for AI learning
  try {
    // Get the most recent AI action for this claim
    const actions = await getClaimActions(claimId);
    const latestAction = actions[0]; // Most recent

    if (latestAction) {
      await logAIOutcome({
        actionId: latestAction.id,
        resultType: mapStatusToResultType(status),
        metadata: {
          finalPayout: metadata.payout,
          processingDays: metadata.processingDays,
          carrierResponse: metadata.carrierNotes,
          denialReason: metadata.denialReason,
          adjustmentsRequested: metadata.adjustments,
          supplementsSubmitted: metadata.supplements,
        },
      });
    }
  } catch (error) {
    console.error("Failed to log AI outcome:", error);
  }
}

function mapStatusToResultType(status: string): string {
  const mapping: Record<string, string> = {
    APPROVED: "approved",
    PARTIAL: "partial",
    DENIED: "denied",
    PENDING: "pending",
    DELAYED: "delayed",
    DISPUTED: "disputed",
  };
  return mapping[status] || "unknown";
}

// ============================================
// EXAMPLE 4: Embedding Generation (on claim changes)
// ============================================

import { createOrUpdateClaimEmbedding } from "@/lib/ai/similarity/embedClaim";

async function onClaimCreatedOrUpdated(claimId: string) {
  // ... your existing claim save logic ...

  // 🔥 ADD THIS: Generate embedding for similarity search
  try {
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      include: { property: true, damage_types: true },
    });

    if (claim) {
      // Build comprehensive text representation
      const claimText = `
        Carrier: ${claim.carrier || "Unknown"}
        Property: ${claim.property?.address || "No address"}
        Roof Type: ${claim.roofType || "Unknown"}
        Roof Slope: ${claim.roofSlope || "Unknown"}
        Damage Types: ${claim.damage_types?.map((d) => d.type).join(", ") || "None"}
        Summary: ${claim.summary || "No summary"}
        Estimate: $${claim.estimateTotal || 0}
        Status: ${claim.status}
        Region: ${claim.property?.state || "Unknown"}
        Age: ${claim.roofAge || "Unknown"} years
      `.trim();

      await createOrUpdateClaimEmbedding(claimId, claimText);
    }
  } catch (error) {
    console.error("Failed to generate claim embedding:", error);
  }
}

// ============================================
// EXAMPLE 5: Server Action Integration
// ============================================

// In your Next.js server actions or API routes:

export async function generateEstimateAction(formData: FormData) {
  "use server";

  const claimId = formData.get("claimId") as string;

  // Generate estimate
  const estimate = await generateCostEstimate({
    claimId,
    // ... other params
  });

  // Log action
  const agent = await getAgentByName("EstimateAgent");
  if (agent) {
    await logAIAction({
      claimId,
      agentId: agent.id,
      actionType: "generate_estimate",
      inputData: {
        /* ... */
      },
      outputData: {
        /* ... */
      },
    });
  }

  return estimate;
}

// ============================================
// BATCH PROCESSING: Generate embeddings for existing claims
// ============================================

async function batchGenerateEmbeddings() {
  const claims = await prisma.claims.findMany({
    where: {
      // Claims without embeddings
      NOT: {
        ClaimEmbedding: {
          is: {},
        },
      },
    },
    take: 100, // Process in batches
    include: { property: true, damage_types: true },
  });

  console.log(`Processing ${claims.length} claims...`);

  for (const claim of claims) {
    try {
      const claimText = buildClaimText(claim);
      await createOrUpdateClaimEmbedding(claim.id, claimText);
      console.log(`✅ ${claim.id}`);
    } catch (error) {
      console.error(`❌ ${claim.id}:`, error);
    }

    // Rate limit: 500ms between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("Batch complete!");
}

function buildClaimText(claim: any): string {
  return `
    Carrier: ${claim.carrier || "Unknown"}
    Property: ${claim.property?.address || "No address"}
    Roof Type: ${claim.roofType || "Unknown"}
    Damage: ${claim.damage_types?.map((d: any) => d.type).join(", ") || "None"}
    Summary: ${claim.summary || "No summary"}
    Estimate: $${claim.estimateTotal || 0}
  `.trim();
}

// ============================================
// SUMMARY: Where to Add Logging
// ============================================

/**
 * 1. ESTIMATE GENERATION
 *    File: src/lib/ai/costEstimation.ts
 *    Function: generateCostEstimate()
 *    Add: logAIAction() after estimate is generated
 *
 * 2. LETTER GENERATION
 *    File: src/lib/ai/automation.ts (or wherever letters are generated)
 *    Function: generateAppealLetter(), generateSupplementLetter()
 *    Add: logAIAction() after letter is generated
 *
 * 3. CLAIM STATUS UPDATES
 *    File: Wherever you update claim status (API route, server action)
 *    Add: logAIOutcome() when status changes to approved/denied
 *
 * 4. CLAIM SAVE/UPDATE
 *    File: API routes or server actions that save claims
 *    Add: createOrUpdateClaimEmbedding() after save
 *
 * 5. ORCHESTRATOR CALLS
 *    File: Claim detail pages, dashboards
 *    Add: Call orchestrateClaim() to get AI intelligence
 */

export {};
