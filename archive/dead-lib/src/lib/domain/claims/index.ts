/**
 * Claims Domain Services
 *
 * Pure business logic for claims operations - final payout, timeline, status updates.
 */

import prisma from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================

export interface CalculateFinalPayoutInput {
  claimId: string;
  orgId: string;
  userId: string;
  rcv: number; // Replacement Cost Value
  acv: number; // Actual Cash Value
  deductible: number;
  depreciation: number;
  overhead?: number;
  profit?: number;
}

export interface UpdatePayoutStatusInput {
  claimId: string;
  status: "pending" | "approved" | "paid" | "disputed";
  notes?: string;
}

export interface RecordPaymentInput {
  claimId: string;
  orgId: string;
  userId: string;
  amount: number;
  paymentType: "initial" | "supplement" | "final" | "deductible";
  checkNumber?: string;
  receivedDate: Date;
  notes?: string;
}

export interface AddDepreciationInput {
  claimId: string;
  orgId: string;
  userId: string;
  category: string;
  amount: number;
  reason?: string;
}

export interface UpdateClaimStatusInput {
  claimId: string;
  orgId: string;
  userId: string;
  status: string;
  notes?: string;
}

export interface AddClaimNoteInput {
  claimId: string;
  orgId: string;
  userId: string;
  content: string;
  noteType?: string;
  isInternal?: boolean;
}

export interface AddTimelineEventInput {
  claimId: string;
  orgId: string;
  userId: string;
  title: string;
  description?: string;
  eventType: string;
  eventDate?: Date;
}

// ============================================================================
// Final Payout Services
// ============================================================================

/**
 * Calculate final payout for a claim
 */
export async function calculateFinalPayout(input: CalculateFinalPayoutInput) {
  const {
    claimId,
    orgId,
    userId,
    rcv,
    acv,
    deductible,
    depreciation,
    overhead = 0,
    profit = 0,
  } = input;

  // Verify claim exists
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  // Calculate totals
  const totalRCV = rcv + overhead + profit;
  const totalACV = acv;
  const totalDepreciation = depreciation;
  const netPayable = totalACV - deductible;
  const recoverableDepreciation = totalRCV - totalACV;

  // Update claim with payout info
  const payout = await prisma.claimPayout.upsert({
    where: { claimId },
    create: {
      claimId,
      rcv: totalRCV,
      acv: totalACV,
      deductible,
      depreciation: totalDepreciation,
      overhead,
      profit,
      netPayable,
      recoverableDepreciation,
      calculatedBy: userId,
      calculatedAt: new Date(),
    },
    update: {
      rcv: totalRCV,
      acv: totalACV,
      deductible,
      depreciation: totalDepreciation,
      overhead,
      profit,
      netPayable,
      recoverableDepreciation,
      calculatedBy: userId,
      calculatedAt: new Date(),
    },
  });

  // Log event
  await prisma.claimEvent.create({
    data: {
      claimId,
      title: "Final payout calculated",
      description: `RCV: $${totalRCV.toFixed(2)}, ACV: $${totalACV.toFixed(2)}, Net Payable: $${netPayable.toFixed(2)}`,
      eventType: "payout_calculated",
      createdBy: userId,
    },
  });

  return {
    success: true,
    payout: {
      rcv: totalRCV,
      acv: totalACV,
      deductible,
      depreciation: totalDepreciation,
      overhead,
      profit,
      netPayable,
      recoverableDepreciation,
    },
  };
}

/**
 * Update payout status
 */
export async function updatePayoutStatus(input: UpdatePayoutStatusInput) {
  const { claimId, status, notes } = input;

  const payout = await prisma.claimPayout.findUnique({
    where: { claimId },
  });

  if (!payout) {
    throw new Error("Payout not found");
  }

  await prisma.claimPayout.update({
    where: { claimId },
    data: {
      status,
      statusNotes: notes,
      statusUpdatedAt: new Date(),
    },
  });

  return { success: true };
}

/**
 * Record a payment received
 */
export async function recordPayment(input: RecordPaymentInput) {
  const { claimId, orgId, userId, amount, paymentType, checkNumber, receivedDate, notes } = input;

  const payment = await prisma.claimPayment.create({
    data: {
      claimId,
      amount,
      paymentType,
      checkNumber,
      receivedDate,
      notes,
      recordedBy: userId,
    },
  });

  // Update total received on payout
  const allPayments = await prisma.claimPayment.aggregate({
    where: { claimId },
    _sum: { amount: true },
  });

  await prisma.claimPayout.update({
    where: { claimId },
    data: { totalReceived: allPayments._sum.amount || 0 },
  });

  // Log event
  await prisma.claimEvent.create({
    data: {
      claimId,
      title: `Payment received: $${amount.toFixed(2)}`,
      description: `${paymentType} payment${checkNumber ? ` - Check #${checkNumber}` : ""}`,
      eventType: "payment_received",
      createdBy: userId,
    },
  });

  return { success: true, payment };
}

/**
 * Add depreciation line item
 */
export async function addDepreciation(input: AddDepreciationInput) {
  const { claimId, orgId, userId, category, amount, reason } = input;

  const depreciation = await prisma.claimDepreciation.create({
    data: {
      claimId,
      category,
      amount,
      reason,
      addedBy: userId,
    },
  });

  // Recalculate total depreciation on payout
  const totalDep = await prisma.claimDepreciation.aggregate({
    where: { claimId },
    _sum: { amount: true },
  });

  await prisma.claimPayout.update({
    where: { claimId },
    data: { depreciation: totalDep._sum.amount || 0 },
  });

  return { success: true, depreciation };
}

// ============================================================================
// Claim Status Services
// ============================================================================

/**
 * Update claim status
 */
export async function updateClaimStatus(input: UpdateClaimStatusInput) {
  const { claimId, orgId, userId, status, notes } = input;

  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  const previousStatus = claim.status;

  await prisma.claims.update({
    where: { id: claimId },
    data: {
      status,
      statusChangedAt: new Date(),
      statusChangedBy: userId,
    },
  });

  // Log status change
  await prisma.claimEvent.create({
    data: {
      claimId,
      title: `Status changed to ${status}`,
      description: notes || `Changed from ${previousStatus} to ${status}`,
      eventType: "status_change",
      createdBy: userId,
      metadata: { previousStatus, newStatus: status },
    },
  });

  return { success: true, previousStatus, newStatus: status };
}

/**
 * Add note to claim
 */
export async function addClaimNote(input: AddClaimNoteInput) {
  const { claimId, orgId, userId, content, noteType, isInternal } = input;

  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  const note = await prisma.claimNote.create({
    data: {
      claimId,
      content,
      noteType: noteType || "general",
      isInternal: isInternal ?? true,
      authorId: userId,
    },
  });

  return { success: true, note };
}

/**
 * Add timeline event
 */
export async function addTimelineEvent(input: AddTimelineEventInput) {
  const { claimId, orgId, userId, title, description, eventType, eventDate } = input;

  const event = await prisma.claimEvent.create({
    data: {
      claimId,
      title,
      description: description || "",
      eventType,
      eventDate: eventDate || new Date(),
      createdBy: userId,
    },
  });

  return { success: true, event };
}

/**
 * Get payout summary for a claim
 */
export async function getPayoutSummary(claimId: string, orgId: string) {
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    select: { id: true },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  const payout = await prisma.claimPayout.findUnique({
    where: { claimId },
  });

  const payments = await prisma.claimPayment.findMany({
    where: { claimId },
    orderBy: { receivedDate: "desc" },
  });

  const depreciations = await prisma.claimDepreciation.findMany({
    where: { claimId },
  });

  return {
    success: true,
    payout,
    payments,
    depreciations,
    summary: payout
      ? {
          totalRCV: payout.rcv,
          totalACV: payout.acv,
          totalDepreciation: payout.depreciation,
          deductible: payout.deductible,
          netPayable: payout.netPayable,
          totalReceived: payout.totalReceived || 0,
          outstanding: (payout.netPayable || 0) - (payout.totalReceived || 0),
        }
      : null,
  };
}
