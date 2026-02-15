import { createSecurityContext, requireAuth, verifyLeadOwnership } from "../_shared/auth.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { sanitizeError } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication
    const ctx = await createSecurityContext(req);
    const authError = requireAuth(ctx);
    if (authError) return authError;

    // SECURITY: Rate limiting (30 requests/min per user)
    const rateLimitKey = `je-assets-export:${ctx.user!.id}:${ctx.ip}`;
    const rateCheck = checkRateLimit(rateLimitKey, 30, 60000);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const leadId = url.searchParams.get("leadId");

    if (!leadId) {
      return new Response(JSON.stringify({ error: "leadId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: Verify lead ownership
    const ownershipError = await verifyLeadOwnership(ctx, leadId);
    if (ownershipError) return ownershipError;

    const { data, error } = await ctx.supabase
      .from("je_assets")
      .select(
        "ext_id, layer, feature_type, severity, geometry, attributes, captured_at, source_version"
      )
      .eq("lead_id", leadId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const byLayer: Record<string, any[]> = {};
    for (const row of data || []) {
      if (!byLayer[row.layer]) byLayer[row.layer] = [];
      byLayer[row.layer].push({
        id: row.ext_id,
        type: row.feature_type,
        severity: row.severity,
        geometry: row.geometry,
        attributes: row.attributes,
        captured_at: row.captured_at,
        source_version: row.source_version,
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        snapshot: {
          lead_id: leadId,
          layers: byLayer,
          exported_at: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("je-assets-export error:", sanitizeError(error));
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
