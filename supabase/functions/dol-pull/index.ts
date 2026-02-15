// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const supa = () => createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") return jsonResponse({ error: "method not allowed" }, 405);

    const body = await req.json().catch(() => ({}));
    const address = body?.address || null;
    const org_id = body?.org_id || null;
    const user_id = body?.user_id || null;
    const mode = body?.mode || "check"; // 'check' or 'full'

    if (!org_id) return jsonResponse({ error: "org_id required" }, 400);
    const client = supa();

    // 1) lookup billing & limits
    const { data: bill } = await client
      .from("org_billing")
      .select("plan_name")
      .eq("org_id", org_id)
      .single();
    const plan = bill?.plan_name || "BUSINESS";
    const { data: limits } = await client
      .from("org_plan_limits")
      .select("*")
      .eq("plan_name", plan)
      .single();

    // 2) compute period start (month start, UTC)
    const now = new Date();
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));

    // 3) count previous usage of this kind in period
    const kindToUse = mode === "full" ? "DOL_FULL" : "DOL_CHECK";
    const { data: usedRows } = await client
      .from("usage_events")
      .select("id, kind")
      .gte("created_at", periodStart.toISOString())
      .eq("org_id", org_id);

    const usedCount = (usedRows || []).filter((r: any) => r.kind === kindToUse).length;
    const included =
      mode === "full" ? limits?.dol_full_included || 0 : limits?.dol_check_included || 0;
    const over = Math.max(0, usedCount + 1 - included);
    const unitCents =
      mode === "full" ? limits?.dol_full_overage_cents || 0 : limits?.dol_check_overage_cents || 0;

    // 4) call DOL provider (stubbed) — replace with real provider call
    const dol = new Date().toISOString().slice(0, 10);
    const confidence = 0.9;
    const source = "stub-local-dol";

    // 5) insert usage event
    await client.from("usage_events").insert({
      org_id,
      user_id,
      kind: kindToUse,
      unit_cost_cents: over ? unitCents : 0,
      qty: 1,
      meta: { address, mode, source },
    });

    // 6) increment pending charges if overage
    if (over && unitCents > 0) {
      await client.rpc("increment_pending_charges", { p_org_id: org_id, p_amount: unitCents });
    }

    return jsonResponse({ dol, confidence, source, overage_charged_cents: over ? unitCents : 0 });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
