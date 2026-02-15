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

    const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    const [heartbeats, webhooks, errors] = await Promise.all([
      supabase.from("heartbeats").select("*"),
      supabase.from("webhook_status").select("*"),
      supabase.from("error_logs").select("severity").gte("happened_at", oneDayAgo),
    ]);

    // Count errors by severity
    const errorCounts: Record<string, number> = {};
    errors.data?.forEach((e: any) => {
      errorCounts[e.severity] = (errorCounts[e.severity] || 0) + 1;
    });

    const errors24h = Object.entries(errorCounts).map(([severity, count]) => ({
      severity,
      count,
    }));

    return new Response(
      JSON.stringify({
        heartbeats: heartbeats.data || [],
        webhooks: webhooks.data || [],
        errors24h,
        env: {
          storageBucketReports: true,
          mapbox: !!Deno.env.get("MAPBOX_ACCESS_TOKEN"),
          stripe: !!Deno.env.get("STRIPE_SECRET_KEY"),
          lovableAI: !!Deno.env.get("LOVABLE_API_KEY"),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error fetching health status:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
