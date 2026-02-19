export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * AI Proposals Run API
 *
 * Generates complete proposals with AI-powered sections:
 * 1. Validates proposal and add-ons
 * 2. Calculates token cost based on add-ons
 * 3. Charges tokens upfront
 * 4. Enqueues worker job for orchestration
 * 5. Worker generates sections, composes PDF, stores artifact
 *
 * Add-ons:
 * - photos: Damage analysis with OpenAI Vision (+1 token)
 * - weather: Historical weather data (+0.5 token)
 * - code_refs: Building code references (+0.5 token)
 * - vendor_quotes: Vendor pricing (+1 token)
 * - depreciation: ACV calculations (+0.5 token)
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { z } from "zod";

import { aiFail, aiOk } from "@/lib/api/aiResponse";
import { getSessionOrgUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

// =============================================================================
// CONFIGURATION
// =============================================================================

// =============================================================================
// REQUEST SCHEMA
// =============================================================================

const ProposalRunRequestSchema = z.object({
  proposalId: z.string().uuid("Invalid proposal ID"),
  template: z.enum(["claims", "retail"], { required_error: "Template required" }),
  addOns: z
    .array(z.enum(["photos", "weather", "code_refs", "vendor_quotes", "depreciation"]))
    .default([]),
  input: z.record(z.any()).optional().default({}), // User input data (address, notes, etc.)
});

type ProposalRunRequest = z.infer<typeof ProposalRunRequestSchema>;

// =============================================================================
// MAIN HANDLER
// =============================================================================

export async function POST(req: Request) {
  try {
    // Authenticate and get org context
    const { orgId, userId } = await getSessionOrgUser();

    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const parsed = ProposalRunRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        aiFail("Invalid request", "VALIDATION", {
          issues: parsed.error.flatten(),
          timestamp: new Date().toISOString(),
        }),
        { status: 422 }
      );
    }

    const { proposalId, template, addOns, input } = parsed.data;

    // Verify proposal exists and belongs to org
    const proposal = await prisma.$queryRaw<
      any[]
    >`SELECT id, org_id, status, kind, add_ons FROM proposals WHERE id = ${proposalId} AND org_id = ${orgId} LIMIT 1`;

    if (!proposal || proposal.length === 0) {
      return NextResponse.json(
        aiFail("Proposal not found or access denied", "NOT_FOUND", {
          timestamp: new Date().toISOString(),
        }),
        { status: 404 }
      );
    }

    const existingProposal = proposal[0];

    // Check if already running or complete
    if (existingProposal.status === "running") {
      return NextResponse.json(
        aiFail("Proposal already running", "CONFLICT", {
          status: "running",
          proposalId,
          timestamp: new Date().toISOString(),
        }),
        { status: 409 }
      );
    }

    if (existingProposal.status === "complete") {
      return NextResponse.json(
        aiFail("Proposal already complete. Create new to re-run.", "CONFLICT", {
          status: "complete",
          proposalId,
          timestamp: new Date().toISOString(),
        }),
        { status: 409 }
      );
    }

    // Update proposal status and input
    await prisma.$executeRaw`UPDATE proposals 
       SET kind = ${template}, add_ons = ${addOns}, input = ${JSON.stringify(input)}::jsonb, status = 'queued', queued_at = NOW()
       WHERE id = ${proposalId}`;

    // Record event
    await prisma.$executeRaw`INSERT INTO proposal_events (proposal_id, event_type, message, metadata)
       VALUES (${proposalId}, ${"queued"}, ${`Proposal queued for generation: ${template} template with ${addOns.length} add-on${addOns.length !== 1 ? "s" : ""}`}, ${JSON.stringify({ template, addOns,  userId })}::jsonb)`;

    // Log activity event
    await prisma.$executeRaw`INSERT INTO activity_events (org_id, userId, event_type, event_data)
       VALUES (${orgId}, ${userId}, ${"proposal_queued"}, ${JSON.stringify({ proposalId, template, addOns,  })}::jsonb)`;

    // Enqueue worker job
    const { enqueue } = await import("@/lib/queue");
    const jobId = await enqueue(
      "proposal-generate" as any,
      {
        proposalId,
        orgId,
        userId,
        template,
        addOns,
        input,
      } as any
    );

    logger.debug(`Proposal ${proposalId} queued for generation (job: ${jobId})`);

    // Return success response
    return NextResponse.json(
      aiOk({
        proposalId,
        status: "queued",
        jobId,
        tokensCharged: 0,
        description: `Proposal generation started. You'll be notified when complete.`,
        estimatedTime: calculateEstimatedTime(addOns),
      })
    );
  } catch (error) {
    logger.error("AI Proposals Run failed:", error);

    // Handle auth errors
    if (error.message?.includes("Unauthorized") || error.message?.includes("organization")) {
      return NextResponse.json(
        aiFail(error.message, "AUTH", { timestamp: new Date().toISOString() }),
        { status: 401 }
      );
    }

    // Generic server error
    return NextResponse.json(
      aiFail("Internal server error", "SERVER", {
        cause: error.message,
        timestamp: new Date().toISOString(),
      }),
      { status: 500 }
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Estimate generation time based on add-ons
 */
function calculateEstimatedTime(addOns: string[]): number {
  let seconds = 30; // Base time

  if (addOns.includes("photos")) seconds += 60; // AI Vision takes time
  if (addOns.includes("weather")) seconds += 15;
  if (addOns.includes("code_refs")) seconds += 10;
  if (addOns.includes("vendor_quotes")) seconds += 20;
  if (addOns.includes("depreciation")) seconds += 10;

  return seconds;
}

// =============================================================================
// EXPORT TYPES FOR CLIENT
// =============================================================================

export interface ProposalRunResponse {
  success: true;
  proposalId: string;
  status: "queued";
  tokensCharged: number;
  description: string;
  jobId?: string; // When queue is implemented
  estimatedTime: number; // seconds
}
