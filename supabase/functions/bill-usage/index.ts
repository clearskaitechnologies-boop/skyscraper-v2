import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const { data: events } = await supabase
    .from("usage_events")
    .select("*")
    .gte("created_at", start.toISOString());
  // group by org_id and kind
  const byOrg: Record<string, { mockups: number; dols: number; cents: number }> = {};
  for (const e of events || []) {
    const k = (e as any).org_id;
    byOrg[k] ??= { mockups: 0, dols: 0, cents: 0 };
    if ((e as any).kind === "AI_MOCKUP") {
      byOrg[k].mockups++;
      byOrg[k].cents += (e as any).unit_cost_cents;
    }
    if ((e as any).kind === "DOL_PULL") {
      byOrg[k].dols++;
      byOrg[k].cents += (e as any).unit_cost_cents;
    }
  }
  // TODO: call Stripe to create invoice items per org with byOrg[org].cents
  return new Response(JSON.stringify({ billed: byOrg }), {
    headers: { "content-type": "application/json" },
  });
});
import { serve } from "std/server";

serve(async () => {
  // Placeholder for monthly billing cron. Should aggregate usage_events and create Stripe invoice items.
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
