import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");

    let query = supabase.from("v_report_funnel").select("*");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Shape data for chart
    const items = [
      { stage: "Export", count: data.filter((x: any) => x.step_export).length },
      { stage: "Share", count: data.filter((x: any) => x.step_share).length },
      { stage: "View", count: data.filter((x: any) => x.step_view).length },
      { stage: "Paid", count: data.filter((x: any) => x.step_pay).length },
      { stage: "Signed", count: data.filter((x: any) => x.step_sign).length },
    ];

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error fetching funnel analytics:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
