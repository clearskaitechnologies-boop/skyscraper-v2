import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecurityContext, requireAuth, getClientIp } from "../_shared/auth.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { sanitizeError } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication and rate limiting
    const ctx = await createSecurityContext(req);
    const authError = requireAuth(ctx);
    if (authError) return authError;

    const rateLimitKey = `ai-summarize:${ctx.user!.id}:${ctx.ip}`;
    const rateCheck = checkRateLimit(rateLimitKey, 60, 3600000); // 60 req/hour
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Try again in an hour.",
          resetAt: rateCheck.resetAt,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { notes, jeSnapshot, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `You are a roofing inspection assistant for ClearSKai.
Mode: ${mode}.
Summarize damage/findings succinctly with bullet points, then recommended next actions.
Use any JE snapshot hints if present.

JE Shaw Data:
${JSON.stringify(jeSnapshot || {}, null, 2)}

Inspector Notes:
${notes || "No notes provided"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You produce concise, field-ready inspection summaries for roofing professionals.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({
        ok: true,
        summary: content.trim(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e: any) {
    console.error("ai-summarize error:", sanitizeError(e));
    return new Response(
      JSON.stringify({
        error: e.message || "Failed to generate summary",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
