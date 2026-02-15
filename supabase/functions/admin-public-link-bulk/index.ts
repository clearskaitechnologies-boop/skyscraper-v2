import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecurityContext, requireAuth, requireOwnerOrAdmin } from "../_shared/auth.ts";
import { jsonResponse } from "../_shared/security.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  revoked: z.boolean(),
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
    const { ids, revoked } = bulkSchema.parse(body);

    const { error } = await ctx.supabase.from("public_tokens").update({ revoked }).in("id", ids);

    if (error) {
      console.error("Failed to bulk update public tokens:", error);
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }

    return jsonResponse({ ok: true, count: ids.length }, 200, corsHeaders);
  } catch (error) {
    console.error("Bulk update error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Invalid request" },
      400,
      corsHeaders
    );
  }
});
