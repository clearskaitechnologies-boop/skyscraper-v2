import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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
    const reportId = url.searchParams.get("id");
    const shareToken = url.searchParams.get("token");

    // Validate input
    const paramSchema = z.object({
      id: z.string().uuid("Invalid report ID format"),
      token: z.string().optional(),
    });

    const validation = paramSchema.safeParse({
      id: reportId,
      token: shareToken,
    });

    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error.errors[0].message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const validatedReportId = validation.data.id;

    // Load report - RLS will check if user has access OR check share token
    const { data: report, error } = await supabase
      .from("reports")
      .select("report_data, pdf_path")
      .eq("id", validatedReportId)
      .maybeSingle();

    if (error || !report) {
      console.error("Report not found:", error);
      return new Response(JSON.stringify({ error: "Report not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const filePath = report.pdf_path;
    if (!filePath) {
      return new Response(JSON.stringify({ error: "No PDF file found for this report" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Create a short-lived signed URL (5 minutes)
    const { data: signed, error: signedError } = await supabase.storage
      .from("reports")
      .createSignedUrl(filePath, 300, {
        download: `report-${validatedReportId}.pdf`,
      });

    if (signedError || !signed?.signedUrl) {
      console.error("Signing error:", signedError);
      return new Response(JSON.stringify({ error: "Failed to generate download link" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Redirect to the signed URL
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: signed.signedUrl,
      },
    });
  } catch (error: any) {
    console.error("Error in report download:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
