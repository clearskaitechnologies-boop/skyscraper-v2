import "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizeError, errorResponse, checkRateLimit } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return errorResponse(
        { code: "E1001", message: "Authentication required", status: 401 },
        corsHeaders
      );
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const sb = createClient(url, anon, {
      global: { headers: { Authorization: auth } },
    });

    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      return errorResponse(
        { code: "E1001", message: "Authentication required", status: 401 },
        corsHeaders
      );
    }

    // Rate limiting: 100 requests per hour for client access
    const rateCheck = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 3600000,
      keyPrefix: "client-reports",
    });
    if (!rateCheck.allowed) {
      return errorResponse(
        { code: "E1005", message: "Too many requests, please try again later", status: 429 },
        corsHeaders
      );
    }

    const { data: me, error: clientError } = await sb
      .from("clients")
      .select("id, name, email")
      .maybeSingle();

    if (clientError) {
      const sanitized = sanitizeError(clientError, "client-reports:lookup");
      return errorResponse(sanitized, corsHeaders);
    }

    if (!me) {
      return new Response(JSON.stringify({ reports: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: rows, error: reportsError } = await sb
      .from("v_client_reports")
      .select("*")
      .eq("client_id", me.id);

    if (reportsError) {
      const sanitized = sanitizeError(reportsError, "client-reports:fetch");
      return errorResponse(sanitized, corsHeaders);
    }

    const enriched = [] as any[];
    for (const r of rows || []) {
      let signed_pdf_url = null;
      if (r.signed_pdf_path) {
        const { data: link } = await sb.storage
          .from("reports")
          .createSignedUrl(r.signed_pdf_path, 600);
        signed_pdf_url = link?.signedUrl || null;
      }
      enriched.push({ ...r, signed_pdf_url });
    }

    return new Response(JSON.stringify({ reports: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const sanitized = sanitizeError(e, "client-reports");
    return errorResponse(sanitized, corsHeaders);
  }
});
