import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/lib/auth/withAuth";
import { sendClaimUpdateEmail } from "@/lib/email/resend";
import prisma from "@/lib/prisma";

const ClaimStateSchema = z.object({
  claimId: z.string().min(1),
  state: z.string().min(1).max(100),
  trigger: z.string().min(1).max(200),
  metadata: z.record(z.any()).optional(),
});

/**
 * Valid claim status transitions.
 * Prevents invalid moves like "PAID_CLOSED" → "INTAKE".
 * A status not in this map can transition freely (legacy/custom statuses).
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  INTAKE: ["INSPECTION_SCHEDULED", "FILED_WITH_CARRIER", "DENIED"],
  INSPECTION_SCHEDULED: ["INSPECTION_COMPLETED", "INTAKE"],
  INSPECTION_COMPLETED: ["FILED_WITH_CARRIER", "INSPECTION_SCHEDULED"],
  FILED_WITH_CARRIER: ["ADJUSTER_SCHEDULED", "APPROVED", "DENIED", "SUPPLEMENT_SUBMITTED"],
  ADJUSTER_SCHEDULED: ["APPROVED", "DENIED", "SUPPLEMENT_SUBMITTED", "FILED_WITH_CARRIER"],
  APPROVED: ["PAID_CLOSED", "SUPPLEMENT_SUBMITTED"],
  DENIED: ["SUPPLEMENT_SUBMITTED", "FILED_WITH_CARRIER", "INTAKE"],
  SUPPLEMENT_SUBMITTED: ["APPROVED", "DENIED", "FILED_WITH_CARRIER"],
  PAID_CLOSED: [], // Terminal state — no forward transitions
};

function isValidTransition(from: string | null, to: string): boolean {
  if (!from) return true; // No current state — allow any
  const fromUpper = from.toUpperCase();
  const toUpper = to.toUpperCase();
  if (fromUpper === toUpper) return true; // Same state is a no-op, allow
  const allowed = VALID_TRANSITIONS[fromUpper];
  if (!allowed) return true; // Unknown/legacy status — allow freely
  return allowed.includes(toUpper);
}

/**
 * CLAIM STATE ENGINE API
 *
 * Manages autonomous claim state transitions with full history tracking
 *
 * POST /api/claims/state
 * Body: { claimId, state, trigger, metadata }
 */
export const POST = withAuth(async (req: NextRequest, { userId, orgId }) => {
  try {
    const body = await req.json();
    const parsed = ClaimStateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 422 }
      );
    }
    const { claimId, state, trigger, metadata } = parsed.data;

    // Verify claim exists and belongs to org
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        orgId: orgId,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const currentState = claim.status;

    // Validate status transition
    if (!isValidTransition(currentState, state)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from "${currentState}" to "${state}"`,
          currentState,
          requestedState: state,
          allowedTransitions: VALID_TRANSITIONS[currentState?.toUpperCase()] || [],
        },
        { status: 422 }
      );
    }

    // Update claim state
    const updatedClaim = await prisma.claims.update({
      where: { id: claimId },
      data: { status: state },
    });

    // Record state transition in history
    await prisma.activities.create({
      data: {
        id: crypto.randomUUID(),
        orgId,
        claimId,
        userId,
        userName: userId,
        type: "state_transition",
        title: `State: ${currentState} → ${state}`,
        description: `Trigger: ${trigger}`,
        metadata: { fromState: currentState, toState: state, trigger, ...(metadata || {}) },
        updatedAt: new Date(),
      },
    });

    logger.debug(`✅ Claim ${claimId} state: ${currentState} → ${state} (${trigger})`);

    // Create notification for user
    try {
      await prisma.projectNotification.create({
        data: {
          id: crypto.randomUUID(),
          orgId,
          claimId,
          notificationType: "CLAIM_UPDATE",
          title: `Claim Status Updated`,
          message: `Claim ${claim.claimNumber || claimId} status changed from ${currentState} to ${state}`,
        },
      });

      // Get user email and send notification
      const user = await prisma.users.findFirst({
        where: { clerkUserId: userId },
        select: { email: true },
      });

      if (user?.email) {
        await sendClaimUpdateEmail(
          user.email,
          claim.claimNumber || claimId,
          state,
          `Status changed from ${currentState} to ${state}. Triggered by: ${trigger}`
        ).catch((err) => console.error("Failed to send claim update email:", err));
      }
    } catch (error) {
      logger.error("Failed to create notification:", error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      previousState: currentState,
      newState: state,
      trigger,
    });
  } catch (error: any) {
    logger.error("State transition error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update claim state" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/claims/state?claimId=xxx
 *
 * Retrieves claim state history
 */
export const GET = withAuth(async (req: NextRequest, { userId, orgId }) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const claimId = searchParams.get("claimId");

    if (!claimId) {
      return NextResponse.json({ error: "Missing claimId parameter" }, { status: 400 });
    }

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        orgId: orgId,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get state history
    const history = await prisma.activities.findMany({
      where: { claimId, type: "state_transition" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      currentState: claim.status,
      history,
    });
  } catch (error: any) {
    logger.error("State history error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve state history" },
      { status: 500 }
    );
  }
});
