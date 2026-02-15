import { NextResponse } from "next/server";

import { BadFaithAgent } from "@/agents/badFaithAgent";
import { RebuttalAgent } from "@/agents/rebuttalAgent";
import { TokenLedgerAgent } from "@/agents/tokenLedgerAgent";
import prisma from "@/lib/prisma";

// Lightweight readiness checks (no heavy AI invocation except minimal token test disabled by default)
export async function GET() {
  const result = {
    ok: false,
    env: false,
    db: false,
    tables: false,
    agents: false,
    error: undefined as string | undefined,
  };
  const checks: any[] = [];
  const envOk = !!process.env.OPENAI_API_KEY && !!process.env.DATABASE_URL;
  checks.push({ key: "env", status: envOk ? "ok" : "missing" });
  result.env = envOk;

  // Database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({ key: "db", status: "ok" });
    result.db = true;
  } catch (e: any) {
    result.error = e.message;
    checks.push({ key: "db", status: "error", error: e.message });
  }

  // Tables existence (best-effort)
  const tableTests = [
    { name: "claims", sql: "SELECT 1 FROM claims LIMIT 1" },
    { name: "claim_bad_faith_analysis", sql: "SELECT 1 FROM claim_bad_faith_analysis LIMIT 1" },
    { name: "tokens_ledger", sql: "SELECT 1 FROM tokens_ledger LIMIT 1" },
    { name: "usage_tokens", sql: "SELECT 1 FROM usage_tokens LIMIT 1" },
  ];
  let tablesOk = true;
  for (const t of tableTests) {
    try {
      // SECURITY NOTE: t.sql is from a hardcoded static array above, no user input — $queryRawUnsafe is safe here
      await prisma.$queryRawUnsafe(t.sql);
      checks.push({ key: `table_${t.name}`, status: "ok" });
    } catch (e: any) {
      checks.push({ key: `table_${t.name}`, status: "missing", error: e.message });
      tablesOk = false;
    }
  }
  result.tables = tablesOk;

  // Agent instantiation sanity
  let agentsOk = true;
  for (const A of [RebuttalAgent, TokenLedgerAgent, BadFaithAgent]) {
    try {
      new A();
      checks.push({ key: `agent_${A.name}_construct`, status: "ok" });
    } catch (e: any) {
      checks.push({ key: `agent_${A.name}_construct`, status: "error", error: e.message });
      agentsOk = false;
    }
  }
  result.agents = agentsOk;

  // Aggregate readiness
  result.ok = result.env && result.db && result.tables && result.agents;
  return NextResponse.json({ ...result, checks });
}
