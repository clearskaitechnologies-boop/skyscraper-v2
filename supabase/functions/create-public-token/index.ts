import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { sanitizeError, errorResponse, checkRateLimit } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  reportId: z.string().uuid("Invalid report ID"),
  hours: z.number().int().min(1).max(8760).default(168),
  scope: z.enum(["view", "download"]).default("view"),
});

function generateToken(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return errorResponse({ code: "E1004", message: "Invalid request", status: 400 }, corsHeaders);
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse(
        { code: "E1001", message: "Authentication required", status: 401 },
        corsHeaders
      );
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const sbUser = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate user
    const {
      data: { user },
      error: authError,
    } = await sbUser.auth.getUser();
    if (authError || !user) {
      return errorResponse(
        { code: "E1001", message: "Authentication required", status: 401 },
        corsHeaders
      );
    }

    // Rate limiting: 20 token generations per hour
    const rateCheck = checkRateLimit(user.id, {
      maxRequests: 20,
      windowMs: 3600000,
      keyPrefix: "create-token",
    });
    if (!rateCheck.allowed) {
      return errorResponse(
        { code: "E1005", message: "Too many requests, please try again later", status: 429 },
        corsHeaders
      );
    }

    // Validate request body
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.flatten());
      return errorResponse({ code: "E1004", message: "Invalid request", status: 400 }, corsHeaders);
    }

    const { reportId, hours, scope } = parsed.data;

    // Check admin role
    const { data: roles } = await sbUser.from("user_roles").select("role").eq("user_id", user.id);

    const isAdmin = roles?.some((r) => r.role === "admin" || r.role === "owner");
    if (!isAdmin) {
      return errorResponse({ code: "E1002", message: "Access denied", status: 403 }, corsHeaders);
    }

    // Generate token with service role
    const sbService = createClient(url, serviceKey);
    const token = generateToken();
    const expiresAt = new Date(Date.now() + hours * 3600000);

    const { error: insertError } = await sbService.from("public_tokens").insert({
      token,
      report_id: reportId,
      expires_at: expiresAt.toISOString(),
      scope,
      created_by: user.id,
    });

    if (insertError) {
      const sanitized = sanitizeError(insertError, "create-token:insert");
      return errorResponse(sanitized, corsHeaders);
    }

    const baseUrl = Deno.env.get("APP_BASE_URL") || "https://clearskairoofing.com";
    const publicUrl = `${baseUrl}/view?t=${encodeURIComponent(token)}`;

    return new Response(
      JSON.stringify({
        token,
        url: publicUrl,
        expires_at: expiresAt.toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e: any) {
    const sanitized = sanitizeError(e, "create-token");
    return errorResponse(sanitized, corsHeaders);
  }
});
