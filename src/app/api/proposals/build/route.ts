export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * PHASE 3 SPRINT 3: POST /api/proposals/build
 * Builds a new proposal draft with AI-generated content
 */

import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { draftProposalSections } from "@/lib/proposals/ai";
import {
    buildProposalContext,
    validateProposalContext,
} from "@/lib/proposals/context";
import type {
    ProposalBuildRequest,
    ProposalBuildResponse,
} from "@/lib/proposals/types";

// Token consumption - will be implemented when token system is integrated
const TOKENS_REQUIRED = 2;

export async function POST(request: Request) {
  try {
    // Authenticate user (dev bypass support)
    const { userId, orgId } = await auth();
    let effectiveUserId = userId;
    let effectiveOrgId = orgId;
    const devKeyHeader = request.headers.get("x-dev-proposal-key");
    const devKeyEnv = process.env.PROPOSAL_DEV_KEY;
    if (!effectiveUserId && devKeyEnv && devKeyHeader === devKeyEnv && process.env.NODE_ENV !== "production") {
      // Find first user/org as a safe dev surrogate
      try {
        const firstUser = await prisma.users.findFirst({ select: { clerkUserId: true, orgId: true } });
        if (firstUser) {
          effectiveUserId = firstUser.clerkUserId;
          effectiveOrgId = firstUser.orgId;
        } else {
          effectiveUserId = "dev-bypass-user";
          effectiveOrgId = null;
        }
      } catch {
        effectiveUserId = "dev-bypass-user";
        effectiveOrgId = null;
      }
    }
    if (!effectiveUserId || !effectiveOrgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: ProposalBuildRequest = await request.json();
    const { leadId, jobId, packetType, tone } = body;

    if (!leadId || !jobId || !packetType) {
      return NextResponse.json(
        { error: "Missing required fields: leadId, jobId, packetType" },
        { status: 400 }
      );
    }

    if (
      packetType !== "retail" &&
      packetType !== "claims" &&
      packetType !== "contractor"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid packetType. Must be 'retail', 'claims', or 'contractor'",
        },
        { status: 400 }
      );
    }

    // Track analytics: proposal_build_started
    logger.info("[Analytics] proposal_build_started", {
      userId: effectiveUserId,
      orgId: effectiveOrgId,
      leadId,
      jobId,
      packetType,
      tone,
    });

    // Build proposal context from database (map not found/mismatch errors to 404)
    let context;
    try {
      context = await buildProposalContext({ orgId: effectiveOrgId, leadId, jobId });
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.startsWith('NOT_FOUND:')) {
        const parts = msg.split(':');
        return NextResponse.json({ error: `${parts[1]} not found`, id: parts[2] }, { status: 404 });
      }
      if (msg.startsWith('MISMATCH:')) {
        return NextResponse.json({ error: 'Job lead linkage mismatch', details: msg }, { status: 409 });
      }
      throw e;
    }

    // Validate context has required data
    const validation = validateProposalContext(context, packetType);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Incomplete data for proposal generation",
          missing: validation.missing,
        },
        { status: 400 }
      );
    }

    // Check token balance using wallet system
    const TOKENS_REQUIRED = 10;
    const wallet = await prisma.tokenWallet.findUnique({ 
      where: { orgId: effectiveOrgId } 
    });
    
    if (!wallet || wallet.aiRemaining < TOKENS_REQUIRED) {
      return NextResponse.json(
        { 
          error: "Insufficient tokens", 
          tokensRequired: TOKENS_REQUIRED,
          currentBalance: wallet?.aiRemaining || 0 
        },
        { status: 402 }
      );
    }

    // Generate AI content with optional tone preset
    const ai = await draftProposalSections(context, packetType, tone);

    // Create ProposalDraft record
    const draft = await prisma.proposal_drafts.create({
      data: {
        id: crypto.randomUUID(),
        org_id: effectiveOrgId,
        user_id: effectiveUserId,
        lead_id: leadId,
        job_id: jobId,
        packet_type: packetType,
        context_json: context as any, // JSON field
        ai_summary: ai.summary,
        ai_scope: ai.scope,
        ai_terms: ai.terms,
        ai_notes: ai.notes,
        status: "draft",
        template:
          packetType === "retail"
            ? "retail/v1"
            : packetType === "claims"
              ? "claims/v1"
              : "contractor/v1",
      },
    });

    // Consume tokens from wallet
    await prisma.tokenWallet.update({
      where: { orgId: effectiveOrgId },
      data: { aiRemaining: { decrement: TOKENS_REQUIRED } },
    });
    
    // Record in ledger
    await prisma.tokens_ledger.create({
      data: {
        id: crypto.randomUUID(),
        org_id: effectiveOrgId,
        delta: -TOKENS_REQUIRED,
        reason: "proposal_build",
        ref_id: draft.id,
        balance_after: (wallet?.aiRemaining || 0) - TOKENS_REQUIRED,
      },
    });

    // Track analytics: proposal_build_succeeded
    logger.info("[Analytics] proposal.build.succeeded", {
      userId: effectiveUserId,
      orgId: effectiveOrgId,
      leadId,
      jobId,
      packetType,
      tone: tone || "auto",
      draftId: draft.id,
      tokensConsumed: TOKENS_REQUIRED,
    });
    logger.info("[Analytics] proposal_build_succeeded", {
      userId: effectiveUserId,
      orgId: effectiveOrgId,
      draftId: draft.id,
      packetType,
      tokensConsumed: TOKENS_REQUIRED,
    });

    const response: ProposalBuildResponse = {
      draftId: draft.id,
      ai,
      context,
      tokensConsumed: TOKENS_REQUIRED,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("[API] /api/proposals/build error:", error);
    return NextResponse.json(
      {
        error: "Failed to build proposal",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
