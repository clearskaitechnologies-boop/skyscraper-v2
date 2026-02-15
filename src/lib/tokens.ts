import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";

import prisma from "@/lib/prisma";
import { shouldBypassBilling } from "@/lib/testMode";

import { checkDailyQuota, checkSeatLimit, recordToolUsage } from "./plan";
import { calculateTokenCost, ToolKey } from "./tools";

// Prisma singleton imported from @/lib/db/prisma

async function getOrgIdForUser(userId: string): Promise<string | null> {
  const { orgId } = await auth();
  return orgId || null;
}

type Runner<T> = () => Promise<T>;

async function chargeAndLog(params: {
  userId: string;
  orgId?: string | null;
  cost: number;
  route: string;
  reason?: string;
  meta?: any;
  toolKey?: ToolKey; // New parameter for quota enforcement
}) {
  const { userId, orgId: orgIdInput, cost, route, reason, meta, toolKey } = params;
  const orgId = orgIdInput ?? (await getOrgIdForUser(userId));
  if (!orgId) return { error: "org_not_found", code: "org_not_found" as const };

  // BETA/TESTING: keep the entire app usable without charging or consuming tokens.
  if (shouldBypassBilling()) {
    return { success: true as const, balance: 999999 };
  }

  // Check seat limits if toolKey is provided
  if (toolKey) {
    const seatCheck = await checkSeatLimit();
    if (!seatCheck.allowed) {
      return {
        error: "seat_limit_exceeded",
        code: "seat_limit_exceeded" as const,
        message: `Organization has ${seatCheck.currentSeats} seats but plan allows ${seatCheck.maxSeats}`,
      };
    }

    // Check daily quota
    const quotaCheck = await checkDailyQuota(toolKey);
    if (!quotaCheck.allowed) {
      return {
        error: "daily_quota_exceeded",
        code: "daily_quota_exceeded" as const,
        message: `Daily limit reached for ${toolKey}: ${quotaCheck.used}/${quotaCheck.limit}`,
      };
    }
  }

  return await prisma.$transaction(async (tx) => {
    // Ensure wallet exists
    const wallet =
      (await tx.tokenWallet.findUnique({ where: { orgId } })) ??
      (await tx.tokenWallet.create({
        data: {
          id: randomUUID(),
          orgId,
          aiRemaining: 0,
          dolCheckRemain: 0,
          dolFullRemain: 0,
          updatedAt: new Date(),
        },
      }));

    if (wallet.aiRemaining < cost) {
      return {
        error: "insufficient_tokens",
        code: "insufficient_tokens" as const,
      };
    }

    const next = wallet.aiRemaining - cost;

    await tx.tokenWallet.update({
      where: { orgId },
      data: { aiRemaining: next },
    });

    await tx.tokens_ledger.create({
      data: {
        id: randomUUID(),
        org_id: orgId,
        delta: -cost,
        reason: reason || "AI task",
        ref_id: route,
        balance_after: next,
        metadata: { route, userId, meta },
      },
    });

    // Record tool usage for quota tracking
    if (toolKey) {
      await recordToolUsage(toolKey, userId);
    }

    return { success: true as const, balance: next };
  });
}

export async function runAiTaskAndCharge<T>(opts: {
  userId: string;
  cost: number;
  route?: string;
  reason?: string;
  meta?: any;
  toolKey?: ToolKey; // Add toolKey for quota enforcement
  task: Runner<T>;
}) {
  const route = opts.route ?? "ai_task";
  const charged = await chargeAndLog({
    userId: opts.userId,
    cost: opts.cost,
    route,
    reason: opts.reason,
    meta: opts.meta,
    toolKey: opts.toolKey, // Pass toolKey through
  });
  if ("error" in charged) return charged;

  const data = await opts.task();
  return { data, balance: charged.balance, success: true as const };
}

// Enhanced function for weather claim reports with quota enforcement
export async function runWeatherClaimAndCharge<T>(opts: { userId: string; task: Runner<T> }) {
  const cost = calculateTokenCost("weather_claim");
  return runAiTaskAndCharge({
    ...opts,
    cost,
    route: "weather_claim",
    reason: "Weather claim report",
    toolKey: "weather_claim",
  });
}

// Enhanced function for mockup generation with quota enforcement
export async function runMockupAndCharge<T>(opts: { userId: string; task: Runner<T> }) {
  const cost = calculateTokenCost("mockup");
  return runAiTaskAndCharge({
    ...opts,
    cost,
    route: "mockup",
    reason: "Property mockup generation",
    toolKey: "mockup",
  });
}

// Enhanced function for DOL data pulls with quota enforcement
export async function runDolCheckAndCharge<T>(opts: { userId: string; task: Runner<T> }) {
  const cost = calculateTokenCost("dol_pull");
  return runAiTaskAndCharge({
    ...opts,
    cost,
    route: "dol_check",
    reason: "DOL compliance check",
    toolKey: "dol_pull",
  });
}

// Token checking functions for file upload gating
export async function requireTokens(
  orgId: string,
  cost: number
): Promise<{ success: boolean; remaining?: number; error?: string }> {
  if (shouldBypassBilling()) {
    return { success: true, remaining: 999999 };
  }

  const wallet = await prisma.usage_tokens.findUnique({
    where: { orgId },
  });

  if (!wallet) {
    await prisma.usage_tokens.create({
      data: {
        id: randomUUID(),
        orgId,
        balance: 0,
        tier: "beta",
        updatedAt: new Date(),
      },
    });
    return { success: false, remaining: 0, error: "insufficient_tokens" };
  }

  if (wallet.balance < cost) {
    return {
      success: false,
      remaining: wallet.balance,
      error: "insufficient_tokens",
    };
  }

  return { success: true, remaining: wallet.balance };
}

export async function spendTokens(
  orgId: string,
  userId: string,
  cost: number,
  reason: string
): Promise<{ success: boolean; balance?: number; error?: string }> {
  if (shouldBypassBilling()) {
    return { success: true, balance: 999999 };
  }

  const result = await chargeAndLog({
    userId,
    orgId,
    cost,
    route: "file_upload",
    reason,
  });

  if ("error" in result) {
    return { success: false, error: result.error };
  }

  return { success: true, balance: result.balance };
}

export async function getRemainingTokens(orgId: string): Promise<number> {
  const wallet = await prisma.usage_tokens.findUnique({
    where: { orgId },
  });

  return wallet?.balance || 0;
}

// =====================================================
// DASHBOARD TOKEN BALANCES (Supabase)
// =====================================================

import { supabaseAdmin } from "./supabaseAdmin";

export async function getTokenBalances(userId: string) {
  const { data, error } = await (supabaseAdmin as any)
    .from("token_balances")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  // Ensure a row exists
  if (!data) {
    const { data: created, error: upErr } = await (supabaseAdmin as any)
      .from("token_balances")
      .insert({ owner_id: userId, mockups: 0, dol: 0, weather: 0 } as any)
      .select()
      .single();
    if (upErr) throw new Error(upErr.message);
    return created;
  }
  return data;
}
