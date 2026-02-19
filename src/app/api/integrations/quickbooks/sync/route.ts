/**
 * POST /api/integrations/quickbooks/sync
 * Unified sync actions for QuickBooks integration
 *
 * Actions:
 * - syncJob: Sync a single job to QuickBooks invoice
 * - syncAllJobs: Bulk sync all unbilled jobs
 * - syncCustomer: Create/update customer in QuickBooks
 * - recordPayment: Record a payment in QuickBooks
 * - refreshConnection: Force token refresh
 */

import {
  createCustomer,
  getValidToken,
  recordPayment,
  syncJobToInvoice,
} from "@/lib/integrations/quickbooks";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Action Schemas ──────────────────────────────────────────────────────────

const SyncJobSchema = z.object({
  action: z.literal("syncJob"),
  jobId: z.string().uuid(),
});

const SyncAllJobsSchema = z.object({
  action: z.literal("syncAllJobs"),
  limit: z.number().min(1).max(100).optional().default(50),
});

const SyncCustomerSchema = z.object({
  action: z.literal("syncCustomer"),
  displayName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});

const RecordPaymentSchema = z.object({
  action: z.literal("recordPayment"),
  customerRef: z.string(),
  amount: z.number().positive(),
  invoiceRef: z.string().optional(),
  paymentDate: z.string().optional(),
  paymentMethod: z.string().optional(),
});

const RefreshConnectionSchema = z.object({
  action: z.literal("refreshConnection"),
});

const ActionSchema = z.discriminatedUnion("action", [
  SyncJobSchema,
  SyncAllJobsSchema,
  SyncCustomerSchema,
  RecordPaymentSchema,
  RefreshConnectionSchema,
]);

// ── Route Handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify QuickBooks is connected
    const conn = await prisma.quickbooks_connections.findUnique({
      where: { org_id: ctx.orgId },
      select: { is_active: true, company_name: true },
    });

    if (!conn?.is_active) {
      return NextResponse.json(
        { error: "QuickBooks not connected", code: "QB_NOT_CONNECTED" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data } = parsed;

    // ── Dispatch Actions ──────────────────────────────────────────────────────

    switch (data.action) {
      case "syncJob": {
        const result = await syncJobToInvoice(ctx.orgId, data.jobId);
        await logSyncEvent(ctx.orgId, "syncJob", { jobId: data.jobId }, result);
        return NextResponse.json({ success: true, ...result });
      }

      case "syncAllJobs": {
        const results = await syncAllUnbilledJobs(ctx.orgId, data.limit);
        await logSyncEvent(ctx.orgId, "syncAllJobs", { limit: data.limit }, results);
        return NextResponse.json({ success: true, ...results });
      }

      case "syncCustomer": {
        const { action, ...customerData } = data;
        const result = await createCustomer(ctx.orgId, customerData);
        await logSyncEvent(ctx.orgId, "syncCustomer", customerData, result);
        return NextResponse.json({
          success: true,
          customerId: result.Customer?.Id,
          customer: result.Customer,
        });
      }

      case "recordPayment": {
        const { action, ...paymentData } = data;
        const result = await recordPayment(ctx.orgId, paymentData);
        await logSyncEvent(ctx.orgId, "recordPayment", paymentData, result);
        return NextResponse.json({
          success: true,
          paymentId: result.Payment?.Id,
          payment: result.Payment,
        });
      }

      case "refreshConnection": {
        const token = await getValidToken(ctx.orgId);
        if (!token) {
          return NextResponse.json(
            { error: "Token refresh failed", code: "QB_REFRESH_FAILED" },
            { status: 500 }
          );
        }
        return NextResponse.json({
          success: true,
          message: "Connection refreshed",
          realmId: token.realmId,
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    logger.error("[QB_SYNC_ERROR]", err);

    // Handle specific QB errors
    if (err.message?.includes("QuickBooks not connected")) {
      return NextResponse.json(
        { error: "QuickBooks not connected", code: "QB_NOT_CONNECTED" },
        { status: 400 }
      );
    }

    if (err.message?.includes("Token refresh failed")) {
      return NextResponse.json(
        { error: "QuickBooks session expired. Please reconnect.", code: "QB_SESSION_EXPIRED" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Sync failed", code: "QB_SYNC_ERROR" },
      { status: 500 }
    );
  }
}

// ── Bulk Sync Helper ────────────────────────────────────────────────────────

async function syncAllUnbilledJobs(orgId: string, limit: number) {
  // Find jobs with financials but no QB invoice
  const unbilledJobs = await prisma.crm_jobs.findMany({
    where: {
      org_id: orgId,
      job_financials: {
        qb_invoice_id: null,
        OR: [{ contract_amount: { gt: 0 } }, { supplement_amount: { gt: 0 } }],
      },
    },
    select: {
      id: true,
      insured_name: true,
      property_address: true,
    },
    take: limit,
    orderBy: { created_at: "desc" },
  });

  const results: Array<{
    jobId: string;
    status: "synced" | "already_synced" | "error";
    qbInvoiceId?: string;
    error?: string;
  }> = [];

  for (const job of unbilledJobs) {
    try {
      const result = await syncJobToInvoice(orgId, job.id);
      results.push({
        jobId: job.id,
        status: result.status as "synced" | "already_synced",
        qbInvoiceId: result.qbInvoiceId,
      });
    } catch (err) {
      results.push({
        jobId: job.id,
        status: "error",
        error: err.message,
      });
    }
  }

  const synced = results.filter((r) => r.status === "synced").length;
  const errors = results.filter((r) => r.status === "error").length;
  const skipped = results.filter((r) => r.status === "already_synced").length;

  return {
    total: unbilledJobs.length,
    synced,
    skipped,
    errors,
    results,
  };
}

// ── Audit Logging ───────────────────────────────────────────────────────────

async function logSyncEvent(
  orgId: string,
  action: string,
  input: Record<string, any>,
  result: Record<string, any>
) {
  try {
    // Update sync_errors array with sync history (last 50 events)
    const conn = await prisma.quickbooks_connections.findUnique({
      where: { org_id: orgId },
      select: { sync_errors: true },
    });

    const history = Array.isArray(conn?.sync_errors) ? conn.sync_errors : [];
    const newEvent = {
      action,
      input,
      result: {
        success: !result.error,
        ...result,
      },
      at: new Date().toISOString(),
    };

    // Keep last 50 events
    const updatedHistory = [newEvent, ...history.slice(0, 49)];

    await prisma.quickbooks_connections.update({
      where: { org_id: orgId },
      data: {
        sync_errors: updatedHistory,
        last_sync_at: new Date(),
      },
    });
  } catch (err) {
    logger.error("[QB] Failed to log sync event:", err);
  }
}
