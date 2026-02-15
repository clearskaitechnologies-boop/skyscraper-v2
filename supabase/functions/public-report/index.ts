import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("t") || (await req.json().catch(() => null))?.token;

    if (!token) {
      return json({ error: "Missing token" }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key);

    // Look up token with security checks
    const { data: tokenRow, error: tokenError } = await sb
      .from("public_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (tokenError || !tokenRow) {
      return json({ error: "Invalid token" }, 404);
    }

    // SECURITY: Check revocation status
    if (tokenRow.revoked) {
      console.warn(`Revoked token access attempt: ${token.substring(0, 12)}`);
      return json({ error: "Token has been revoked" }, 403);
    }

    // SECURITY: Check expiration
    if (tokenRow.expires_at && new Date(tokenRow.expires_at).getTime() < Date.now()) {
      return json({ error: "Token expired" }, 410);
    }

    // SECURITY: Check view limits
    if (
      tokenRow.max_views != null &&
      tokenRow.view_count != null &&
      tokenRow.view_count >= tokenRow.max_views
    ) {
      return json({ error: "View limit reached" }, 403);
    }

    // Increment view count (best-effort, don't fail request if this fails)
    const viewIncResult = await sb.rpc("increment_public_view", { _token: token });
    if (viewIncResult.error) {
      console.error("Failed to increment view count:", viewIncResult.error);
    }

    // Fetch report with minimal data
    const { data: report, error: reportError } = await sb
      .from("reports")
      .select("id, report_name, report_data, pdf_path")
      .eq("id", tokenRow.report_id)
      .single();

    if (reportError || !report) {
      return json({ error: "Report not found" }, 404);
    }

    // SECURITY: Filter sensitive data from public view
    const reportData = (report.report_data as any) || {};
    const publicData = {
      address: reportData.address,
      status: reportData.status,
      summary: reportData.summary,
      findings: reportData.findings,
      citations: reportData.citations,
      photos: reportData.photos,
      // EXCLUDE: pricing, payments, client PII, internal notes
    };

    // Get download URL if scope allows
    let downloadUrl: string | null = null;
    if (report.pdf_path && tokenRow.scope === "download") {
      const { data: signedData } = await sb.storage
        .from("reports")
        .createSignedUrl(report.pdf_path, 3600); // 1 hour validity
      downloadUrl = signedData?.signedUrl || null;
    }

    // Audit log
    const auditResult = await sb.from("audit_public_views").insert({
      token,
      report_id: tokenRow.report_id,
      event: "view",
      user_agent: req.headers.get("user-agent") || "",
      ip: (req.headers.get("x-forwarded-for") as any) || null,
    });
    if (auditResult.error) {
      console.error("Failed to log audit event:", auditResult.error);
    }

    // Calculate remaining views
    const remainingViews =
      tokenRow.max_views == null
        ? null
        : Math.max(0, tokenRow.max_views - (tokenRow.view_count || 0) - 1);

    return json({
      id: report.id,
      title: report.report_name,
      data: publicData,
      downloadUrl,
      scope: tokenRow.scope,
      expiresAt: tokenRow.expires_at,
      remainingViews,
      revoked: false, // Only non-revoked tokens reach here
    });
  } catch (e: any) {
    console.error("Error in public-report:", e);
    return json({ error: "Internal error" }, 500);
  }
});
