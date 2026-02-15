import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * SECURITY DOCUMENTATION: Role-Based Access Control
 *
 * This endpoint requires JWT authentication (verify_jwt=true in config.toml).
 * Authorization is enforced through RLS policies that check has_role() for admin/owner.
 *
 * Only users with 'admin' or 'owner' roles can resolve incidents.
 * Audit logging tracks all incident resolution attempts.
 */

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

    // Get authenticated user for audit logging
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const url = new URL(req.url);
    const incidentId = url.searchParams.get("id");

    if (!incidentId) {
      return new Response(JSON.stringify({ error: "Incident ID required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get incident details before resolving for audit log
    const { data: incident } = await supabase
      .from("status_incidents")
      .select("title, severity")
      .eq("id", incidentId)
      .single();

    // Resolve incident (RLS policies enforce admin/owner role check)
    const { error } = await supabase
      .from("status_incidents")
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", incidentId);

    if (error) {
      console.error("Failed to resolve incident:", error);
      throw error;
    }

    // SECURITY: Audit logging
    const auditResult = await supabase.from("events").insert({
      name: "incident_resolved",
      user_id: user.id,
      props: {
        incident_id: incidentId,
        title: incident?.title,
        severity: incident?.severity,
      },
    });
    if (auditResult.error) {
      console.error("Audit log failed:", auditResult.error);
    }

    console.log(`Incident ${incidentId} resolved by user ${user.id}`);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error resolving incident:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
