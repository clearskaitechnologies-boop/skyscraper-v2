import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecurityContext, requireAuth, requireOwnerOrAdmin } from "../_shared/auth.ts";
import { jsonResponse } from "../_shared/security.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const createSchema = z.object({
  report_id: z.string().uuid(),
  scope: z.enum(["view", "download"]).default("view"),
  expires_at: z.string(),
  max_views: z.number().int().min(1).nullable().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ctx = await createSecurityContext(req);

    const authErr = requireAuth(ctx);
    if (authErr) return authErr;

    const roleErr = requireOwnerOrAdmin(ctx);
    if (roleErr) return roleErr;

    const body = await req.json();
    const { report_id, scope, expires_at, max_views } = createSchema.parse(body);

    // Verify report exists
    const { data: report, error: reportError } = await ctx.supabase
      .from("reports")
      .select("id")
      .eq("id", report_id)
      .maybeSingle();

    if (reportError || !report) {
      return jsonResponse({ error: "Report not found" }, 404, corsHeaders);
    }

    const token = crypto.randomUUID();

    const { data, error } = await ctx.supabase
      .from("public_tokens")
      .insert({
        token,
        report_id,
        scope,
        expires_at,
        max_views,
        created_by: ctx.user!.id,
      })
      .select("id, token")
      .single();

    if (error) {
      console.error("Failed to create public token:", error);
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }

    return jsonResponse({ id: data.id, token: data.token }, 200, corsHeaders);
  } catch (error) {
    console.error("Create token error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Invalid request" },
      400,
      corsHeaders
    );
  }
});
