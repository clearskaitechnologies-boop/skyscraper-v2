import { NextResponse } from "next/server";

import { logger } from "@/lib/observability/logger";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";
import { getStorageClient } from "@/lib/storage/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type IntegrationStatusResponse = {
  ok: boolean;
  quickbooks: {
    connected: boolean;
    companyName: string | null;
    lastSync: string | null;
    expiresAt: string | null;
    health: "healthy" | "warning" | "error";
  };
  migrations: {
    acculynx: {
      status: string;
      count: number;
      lastRun: string | null;
    };
    jobnimbus: {
      status: string;
      count: number;
      lastRun: string | null;
    };
  };
  system: {
    api: "operational";
    storage: "connected" | "not_configured";
    webhooks: "active" | "inactive";
  };
  updatedAt: string;
};

function resolveQuickBooksHealth(
  connected: boolean,
  expiresAt?: Date | null
): "healthy" | "warning" | "error" {
  if (!connected) return "error";
  if (!expiresAt) return "warning";

  const now = Date.now();
  const expiry = expiresAt.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  if (expiry - now <= sevenDaysMs) return "warning";
  return "healthy";
}

async function getMigrationStatus(orgId: string, source: "acculynx" | "jobnimbus") {
  const job = await prisma.migration_jobs.findFirst({
    where: { orgId, source },
    orderBy: { createdAt: "desc" },
    select: {
      status: true,
      importedRecords: true,
      totalRecords: true,
      completedAt: true,
      startedAt: true,
      createdAt: true,
    },
  });

  if (!job) {
    return {
      status: "not_started",
      count: 0,
      lastRun: null,
    };
  }

  return {
    status: job.status || "unknown",
    count: job.importedRecords || job.totalRecords || 0,
    lastRun: (job.completedAt || job.startedAt || job.createdAt)?.toISOString() || null,
  };
}

export async function GET() {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const [qbConn, acculynxStatus, jobnimbusStatus, webhook] = await Promise.all([
      prisma.quickbooks_connections.findUnique({
        where: { org_id: ctx.orgId },
        select: {
          company_name: true,
          is_active: true,
          last_sync_at: true,
          token_expires: true,
        },
      }),
      getMigrationStatus(ctx.orgId, "acculynx"),
      getMigrationStatus(ctx.orgId, "jobnimbus"),
      prisma.webhook_subscriptions.findFirst({
        where: { org_id: ctx.orgId, enabled: true },
        select: { id: true },
      }),
    ]);

    const connected = !!qbConn?.is_active;
    const expiresAt = qbConn?.token_expires ?? null;

    const storageConnected = !!getStorageClient();

    const response: IntegrationStatusResponse = {
      ok: true,
      quickbooks: {
        connected,
        companyName: qbConn?.company_name ?? null,
        lastSync: qbConn?.last_sync_at?.toISOString() ?? null,
        expiresAt: expiresAt?.toISOString() ?? null,
        health: resolveQuickBooksHealth(connected, expiresAt),
      },
      migrations: {
        acculynx: acculynxStatus,
        jobnimbus: jobnimbusStatus,
      },
      system: {
        api: "operational",
        storage: storageConnected ? "connected" : "not_configured",
        webhooks: webhook ? "active" : "inactive",
      },
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("[INTEGRATIONS_STATUS] Failed to load status:", error);
    return NextResponse.json({ ok: false, error: "Failed to load status" }, { status: 500 });
  }
}
