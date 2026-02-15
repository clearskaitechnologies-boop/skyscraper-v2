import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecurityContext, requireAuth, requireOwnerOrAdmin } from "../_shared/auth.ts";
import { jsonResponse, errorResponse } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { data, error } = await ctx.supabase
      .from("public_tokens")
      .select("id, token, report_id, scope, expires_at, revoked, view_count, max_views, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to list public tokens:", error);
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }

    return jsonResponse({ items: data }, 200, corsHeaders);
  } catch (error) {
    console.error("Error in admin-public-links-list:", error);
    return jsonResponse({ error: "Internal server error" }, 500, corsHeaders);
  }
});
