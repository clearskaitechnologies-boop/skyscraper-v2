import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecurityContext, requireAuth, requireOwnerOrAdmin } from "../_shared/auth.ts";
import { jsonResponse } from "../_shared/security.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const updateSchema = z.object({
  id: z.string().uuid(),
  revoked: z.boolean().optional(),
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
    const { id, revoked, max_views } = updateSchema.parse(body);

    const updates: any = {};
    if (revoked !== undefined) updates.revoked = revoked;
    if (max_views !== undefined) updates.max_views = max_views;

    const { error } = await ctx.supabase.from("public_tokens").update(updates).eq("id", id);

    if (error) {
      console.error("Failed to update public token:", error);
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }

    return jsonResponse({ ok: true }, 200, corsHeaders);
  } catch (error) {
    console.error("Update token error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Invalid request" },
      400,
      corsHeaders
    );
  }
});
