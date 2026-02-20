// src/lib/intel/depreciationLifecycle.ts
// Production depreciation lifecycle logic replacing stub.
// Handles status transitions and simple schedule-based depreciation calculations.

import prisma from '@/lib/prisma';
import { logger } from "@/lib/logger";

// Basic annual depreciation rates by category (could be extended).
const CATEGORY_RATES: Record<string, number> = {
  roof: 0.05, // 5% per year
  contents: 0.10, // 10% per year
  hvac: 0.07,
};

interface ComputeDepreciationInput {
  originalValue: number;
  years: number;
  category?: string;
  floorPercent?: number; // minimum remaining value percent
}

export function computeDepreciation({ originalValue, years, category = 'roof', floorPercent = 0.2 }: ComputeDepreciationInput) {
  const rate = CATEGORY_RATES[category] ?? 0.05;
  const depreciated = originalValue * Math.pow(1 - rate, years);
  const floor = originalValue * floorPercent;
  const currentValue = Math.max(depreciated, floor);
  const totalDepreciation = originalValue - currentValue;
  return { currentValue, totalDepreciation, rate, years };
}

export type DepreciationStatus =
  | 'PENDING'
  | 'REQUESTED'
  | 'APPROVED'
  | 'ISSUED'
  | 'RECEIVED'
  | 'DELAYED'
  | 'DENIED'
  | 'CLOSED';

export interface DepreciationSummary {
  claimId: string;
  status: DepreciationStatus;
  totalDepreciation: number;
  requestedAmount?: number;
  approvedAmount?: number;
  issuedAmount?: number;
  receivedAmount?: number;
  outstandingAmount: number;
  daysInCurrentStatus: number;
  timeline: any[];
}

function log(action: string, extra?: any) {
  // Intentionally quiet; uncomment for tracing
  // logger.debug(`🟡 depreciation:${action} (stub)`, extra || {});
}

export async function initializeDepreciationTracker(
  claimId: string,
  orgId: string,
  totalDepreciation: number
): Promise<void> {
  log('init', { claimId, orgId, totalDepreciation });
  // Persist initialization marker (lightweight example using ReportHistory)
  await prisma.ai_reports.create({
    data: {
      id: crypto.randomUUID(),
      orgId,
      userId: orgId, // placeholder association
      claimId,
      type: 'depreciation_init',
      title: 'Depreciation Tracking Initialized',
      metadata: { totalDepreciation },
    },
  }).catch(() => {});
}
export async function markDepreciationRequested(
  claimId: string,
  requestedAmount?: number,
  sentTo?: string
): Promise<void> {
  log('requested', { claimId, requestedAmount, sentTo });
  await persistTimeline(claimId, 'REQUESTED', { requestedAmount, sentTo });
}
export async function markDepreciationApproved(
  claimId: string,
  approvedAmount?: number,
  approvedBy?: string
): Promise<void> {
  log('approved', { claimId, approvedAmount, approvedBy });
  await persistTimeline(claimId, 'APPROVED', { approvedAmount, approvedBy });
}
export async function markDepreciationIssued(
  claimId: string,
  issuedAmount?: number,
  checkNumber?: string,
  expectedReceiptDate?: Date
): Promise<void> {
  log('issued', { claimId, issuedAmount, checkNumber, expectedReceiptDate });
  await persistTimeline(claimId, 'ISSUED', { issuedAmount, checkNumber, expectedReceiptDate });
}
export async function markDepreciationReceived(
  claimId: string,
  receivedAmount?: number,
  paymentId?: string,
  receivedDate?: Date
): Promise<void> {
  log('received', { claimId, receivedAmount, paymentId, receivedDate });
  await persistTimeline(claimId, 'RECEIVED', { receivedAmount, paymentId, receivedDate });
}
export async function markDepreciationDelayed(
  claimId: string,
  reason?: string,
  expectedDate?: Date
): Promise<void> {
  log('delayed', { claimId, reason, expectedDate });
  await persistTimeline(claimId, 'DELAYED', { reason, expectedDate });
}
export async function markDepreciationDenied(
  claimId: string,
  reason?: string
): Promise<void> {
  log('denied', { claimId, reason });
  await persistTimeline(claimId, 'DENIED', { reason });
}
export async function closeDepreciation(
  claimId: string,
  closeReason?: string
): Promise<void> {
  log('closed', { claimId, closeReason });
  await persistTimeline(claimId, 'CLOSED', { closeReason });
}
export async function getDepreciationSummary(
  claimId: string
): Promise<DepreciationSummary | null> {
  // Read timeline events from ReportHistory for demonstration purposes.
  const events = await prisma.ai_reports.findMany({
    where: { claimId, type: { startsWith: 'depreciation_' } },
    orderBy: { createdAt: 'asc' },
  }).catch(() => [] as any[]);
  if (!events.length) {
    return {
      claimId,
      status: 'PENDING',
      totalDepreciation: 0,
      outstandingAmount: 0,
      receivedAmount: 0,
      daysInCurrentStatus: 0,
      timeline: [],
    };
  }
  const last = events[events.length - 1];
  const status = (last.metadata?.status as DepreciationStatus) ?? 'PENDING';
  const receivedAmount = events.reduce((acc, e) => acc + (e.metadata?.receivedAmount || 0), 0);
  const requestedAmount = events.reduce((acc, e) => acc + (e.metadata?.requestedAmount || 0), 0);
  const approvedAmount = events.reduce((acc, e) => acc + (e.metadata?.approvedAmount || 0), 0);
  const issuedAmount = events.reduce((acc, e) => acc + (e.metadata?.issuedAmount || 0), 0);
  const totalDepreciation = approvedAmount || requestedAmount || 0;
  const outstandingAmount = Math.max(totalDepreciation - receivedAmount, 0);
  const daysInCurrentStatus = Math.floor((Date.now() - new Date(last.createdAt).getTime()) / 86400000);
  return {
    claimId,
    status,
    totalDepreciation,
    requestedAmount,
    approvedAmount,
    issuedAmount,
    receivedAmount,
    outstandingAmount,
    daysInCurrentStatus,
    timeline: events.map(e => ({ id: e.id, status: e.metadata?.status, at: e.createdAt, meta: e.metadata })),
  };
}
export async function checkForFollowUp(): Promise<string[]> {
  // Example: claims with delayed status older than 7 days need follow-up.
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  const delayed = await prisma.ai_reports.findMany({
    where: {
      type: 'depreciation_event',
      createdAt: { lt: sevenDaysAgo },
      metadata: { path: ['status'], equals: 'DELAYED' },
    },
  }).catch(() => []);
  return delayed.map(d => d.claimId!).filter(Boolean);
}

async function persistTimeline(claimId: string, status: DepreciationStatus, meta: Record<string, any>) {
  try {
    await prisma.ai_reports.create({
      data: {
        id: crypto.randomUUID(),
        orgId: meta.orgId || 'system',
        userId: meta.userId || meta.orgId || 'system',
        claimId,
        type: 'depreciation_event',
        title: `Depreciation ${status}`,
        metadata: { status, ...meta },
      },
    });
  } catch (e) {
    log('persist_error', e);
  }
}
