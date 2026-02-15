import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SECURITY: Rate limiting to prevent resource abuse (30 per hour per user)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

const stampSchema = z.object({
  reportId: z.string().uuid(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user for rate limiting
    const {
      data: { user },
      error: authError,
    } = await sb.auth.getUser(auth.replace("Bearer ", ""));
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: Rate limiting check
    if (!checkRateLimit(user.id)) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Maximum 30 PDF operations per hour." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { reportId } = stampSchema.parse(body);

    // Get report
    const { data: rpt, error: rptError } = await sb
      .from("reports")
      .select("id, report_name, report_data")
      .eq("id", reportId)
      .single();

    if (rptError || !rpt) {
      return new Response(JSON.stringify({ error: "Report not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reportData = rpt.report_data as any;
    const exportPath = reportData?.export?.path;

    if (!exportPath) {
      return new Response(JSON.stringify({ error: "No exported PDF to stamp" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: Validate export path format to prevent path traversal
    const SAFE_PATH_PATTERN = /^exports\/[a-f0-9-]{36}\/[a-z0-9_-]+\.pdf$/i;
    if (!SAFE_PATH_PATTERN.test(exportPath) || !exportPath.startsWith("exports/")) {
      console.error("Invalid export path format:", exportPath);
      return new Response(JSON.stringify({ error: "Invalid export path format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get latest version
    const { data: versions } = await sb
      .from("report_price_versions")
      .select("version_no")
      .eq("report_id", reportId)
      .order("version_no", { ascending: false })
      .limit(1);

    const versionNo = versions?.[0]?.version_no || 1;

    // Get approvals
    const { data: approvals } = await sb
      .from("report_price_approvals")
      .select("*")
      .eq("report_id", reportId)
      .eq("version_no", versionNo);

    // For now, create a simple stamped version path
    // In production, you'd use pdf-lib to actually overlay the signatures
    const stampedPath = `signed/${reportId}/prices-v${versionNo}.pdf`;

    // Copy the export PDF to the stamped location
    // (In a real implementation, you'd download, modify with pdf-lib, and upload)
    const { data: exportSigned } = await sb.storage
      .from("reports")
      .createSignedUrl(exportPath, 300);

    if (!exportSigned) {
      return new Response(JSON.stringify({ error: "Could not access export PDF" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download the PDF
    const pdfResponse = await fetch(exportSigned.signedUrl);
    const pdfBytes = await pdfResponse.arrayBuffer();

    // Upload as stamped version (for now, just a copy)
    // TODO: Use pdf-lib to add approval stamps
    await sb.storage.from("reports").upload(stampedPath, new Uint8Array(pdfBytes), {
      contentType: "application/pdf",
      upsert: true,
    });

    // Create signed URL
    const { data: downloadSigned } = await sb.storage
      .from("reports")
      .createSignedUrl(stampedPath, 604800); // 7 days

    if (!downloadSigned) {
      return new Response(JSON.stringify({ error: "Could not create download URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update report data
    const updatedData = {
      ...reportData,
      approvals: {
        version: versionNo,
        path: stampedPath,
        at: new Date().toISOString(),
      },
    };

    await sb.from("reports").update({ report_data: updatedData }).eq("id", reportId);

    console.log(`Stamped approvals for report ${reportId}, version ${versionNo}`);

    return new Response(
      JSON.stringify({
        ok: true,
        url: downloadSigned.signedUrl,
        version: versionNo,
        path: stampedPath,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in stamp-approvals:", error);
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({
        error: "Operation failed",
        message: "Unable to stamp approvals. Please try again.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
