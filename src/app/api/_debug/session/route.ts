/**
 * /api/_debug/session — Session & Org Diagnostic Endpoint
 *
 * Returns the current user's session info, org membership,
 * claim counts, and DB connectivity check.
 *
 * Used by TruthPanel and for manual debugging.
 */
import { NextResponse } from "next/server";

import { getOrgContext } from "@/lib/org/getOrgContext";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const started = Date.now();

  // ── 1. Auth context ────────────────────────────────────────────────
  const ctx = await safeOrgContext();

  if (ctx.status !== "ok" || !ctx.userId) {
    return NextResponse.json(
      {
        ok: false,
        reason: ctx.status,
        safeOrgContext: ctx,
        ts: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  // ── 2. Org memberships ─────────────────────────────────────────────
  let memberships: any[] = [];
  try {
    memberships = await prisma.user_organizations.findMany({
      where: { userId: ctx.userId },
      select: { organizationId: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (e: any) {
    memberships = [{ error: e.message }];
  }

  // ── 3. Canonical org resolution ────────────────────────────────────
  let resolvedOrg: any = null;
  let resolvedError: string | null = null;
  try {
    const canonical = await getOrgContext();
    resolvedOrg = {
      orgId: canonical.orgId,
      userId: canonical.userId,
      isDemo: canonical.isDemo,
    };
  } catch (error: any) {
    resolvedError = error?.message || String(error);
  }

  // ── 4. Org record from DB ─────────────────────────────────────────
  const orgRecord = ctx.orgId
    ? await prisma.org
        .findUnique({
          where: { id: ctx.orgId },
          select: { id: true, name: true, clerkOrgId: true },
        })
        .catch(() => null)
    : null;

  // ── 5. Claim counts for this org ───────────────────────────────────
  let claimCounts: any = {};
  let recentClaims: any[] = [];
  try {
    if (ctx.orgId) {
      const totalForOrg = await prisma.claims.count({ where: { orgId: ctx.orgId } });
      claimCounts = { totalForOrg };

      recentClaims = await prisma.claims.findMany({
        where: { orgId: ctx.orgId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          claimNumber: true,
          status: true,
          updatedAt: true,
        },
      });
    }
  } catch (e: any) {
    claimCounts = { error: e.message };
  }

  // ── 6. DB connectivity hint ────────────────────────────────────────
  const dbUrlHost = (() => {
    try {
      const raw = process.env.DATABASE_URL || "";
      const url = new URL(raw);
      return `${url.hostname}:${url.port}`;
    } catch {
      return "parse-error";
    }
  })();

  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    latencyMs: Date.now() - started,
    userId: ctx.userId,
    orgId: ctx.orgId,
    safeOrgContext: ctx,
    memberships,
    orgRecord,
    canonicalResolver: {
      ok: !!resolvedOrg && !resolvedError,
      resolvedOrg,
      error: resolvedError,
    },
    claimCounts,
    recentClaims,
    dbUrlHost,
    env: process.env.NODE_ENV,
  });
}
