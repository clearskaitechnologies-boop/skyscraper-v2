import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the public link
    const { data: link, error: linkError } = await supabase
      .from("report_public_links")
      .select("report_id, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (linkError) {
      console.error("Link lookup error:", linkError);
      throw new Error("Failed to resolve link");
    }

    if (!link) {
      return new Response(JSON.stringify({ error: "Invalid or expired link" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: Check expiration
    if (new Date(link.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Link has expired" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch report details with minimal PII exposure
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, report_name, report_data, lead_id")
      .eq("id", link.report_id)
      .single();

    if (reportError || !report) {
      console.error("Report fetch error:", reportError);
      return new Response(JSON.stringify({ error: "Report not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: Filter report data to exclude sensitive fields
    const reportData = (report.report_data as any) || {};
    const filteredData = {
      address: reportData.address,
      summary: reportData.summary,
      findings: reportData.findings,
      photos: reportData.photos,
      citations: reportData.citations,
      // EXCLUDE: pricing, client_phone, client_email, internal_notes, etc.
    };

    // Optionally fetch minimal lead info for pre-filling (only if needed for signing)
    let leadInfo = null;
    if (report.lead_id) {
      const { data: lead } = await supabase
        .from("leads")
        .select("client_name, property_address")
        .eq("id", report.lead_id)
        .maybeSingle();

      if (lead) {
        leadInfo = {
          name: lead.client_name,
          address: lead.property_address,
          // EXCLUDE: client_email, client_phone for security
        };
      }
    }

    // Log audit event
    const auditResult = await supabase.from("report_audit_events").insert({
      report_id: link.report_id,
      event_type: "esign.view",
      meta: {
        token: token.substring(0, 12),
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });
    if (auditResult.error) {
      console.error("Failed to log audit event:", auditResult.error);
    }

    return new Response(
      JSON.stringify({
        report: {
          id: report.id,
          title: report.report_name,
          data: filteredData,
        },
        prefill: leadInfo,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in resolve-public-link:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
