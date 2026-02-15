import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const leadId = url.searchParams.get("leadId");

    // Query for the last sync log, optionally filtered by lead
    let query = supabaseClient
      .from("je_assets")
      .select("id, lead_id, layer, updated_at, source_version")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (leadId) {
      query = query.eq("lead_id", leadId);
    }

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by layer to get counts
    const summary: Record<string, { count: number; last_updated: string }> = {};
    for (const row of data || []) {
      if (!summary[row.layer]) {
        summary[row.layer] = { count: 0, last_updated: row.updated_at };
      }
      summary[row.layer].count += 1;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        last: data?.[0] || null,
        summary,
        total: data?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
