import "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SECURITY: Rate limiting to prevent AI API abuse (20 requests per hour per user)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
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

const autofillSchema = z.object({
  reportId: z.string().uuid(),
  type: z.enum(["retail", "insurance", "comprehensive"]).optional(),
  hints: z
    .object({
      overview: z.string().max(500).optional(),
      code: z.string().max(500).optional(),
      timeline: z.string().max(500).optional(),
      pricing: z.string().max(500).optional(),
    })
    .optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { reportId, type, hints } = autofillSchema.parse(body);

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key, {
      global: { headers: { Authorization: auth } },
    });

    // Verify user owns the report
    const { data: rpt, error: rptErr } = await sb
      .from("reports")
      .select("id, created_by")
      .eq("id", reportId)
      .single();

    if (rptErr || !rpt) {
      return new Response(JSON.stringify({ error: "Report not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user || rpt.created_by !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized access to report" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: Rate limiting check
    if (!checkRateLimit(user.id)) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Maximum 20 AI autofill operations per hour.",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch full report data for autofill
    const { data: reportFull } = await sb
      .from("reports")
      .select("id, report_data")
      .eq("id", reportId)
      .single();
    const d = (reportFull as any)?.report_data || {};

    // Call existing edge functions for autofill
    const fnUrl = url.replace("/rest/v1", "");

    // Overview
    if (hints?.overview) {
      try {
        const r = await fetch(`${fnUrl}/functions/v1/summarize-report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, prompt: hints.overview, type: "overview" }),
        });
        if (r.ok) {
          const result = await r.json();
          d.summary = result.text || result.summary || d.summary;
        }
      } catch (e) {
        console.error("Overview autofill error:", e);
      }
    }

    // Code items
    if (hints?.code) {
      try {
        const r = await fetch(`${fnUrl}/functions/v1/lookup-codes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, prompt: hints.code }),
        });
        if (r.ok) {
          const result = await r.json();
          d.codeCallouts = result.items || result.codeCallouts || d.codeCallouts;
        }
      } catch (e) {
        console.error("Code autofill error:", e);
      }
    }

    // Timeline
    if (hints?.timeline) {
      try {
        const r = await fetch(`${fnUrl}/functions/v1/summarize-report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, prompt: hints.timeline, type: "timeline" }),
        });
        if (r.ok) {
          const result = await r.json();
          d.timeline = result.items || result.timeline || d.timeline;
        }
      } catch (e) {
        console.error("Timeline autofill error:", e);
      }
    }

    // Pricing
    if (hints?.pricing) {
      try {
        const r = await fetch(`${fnUrl}/functions/v1/summarize-report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, prompt: hints.pricing, type: "pricing-retail" }),
        });
        if (r.ok) {
          const result = await r.json();
          d.pricing = result.table || result.pricing || d.pricing;
        }
      } catch (e) {
        console.error("Pricing autofill error:", e);
      }
    }

    await sb.from("reports").update({ report_data: d }).eq("id", reportId);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Autofill error:", e);
    if (e instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: e.errors,
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
        message: "Unable to complete autofill. Please try again.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
