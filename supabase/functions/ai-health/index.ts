import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const deep = url.searchParams.get("deep") === "1";
    const apiKey = Deno.env.get("OPENAI_API_KEY") || "";

    const base = {
      hasApiKey: !!apiKey,
      endpoints: {
        summarize: "/functions/v1/ai-summarize",
        caption: "/functions/v1/ai-caption",
        codes: "/functions/v1/ai-codes",
      },
    };

    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, reason: "OPENAI_API_KEY missing", ...base }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!deep) {
      // Shallow check: don't call OpenAI, just report env present
      return new Response(JSON.stringify({ ok: true, deep: false, ...base }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deep check: tiny request to OpenAI (1-2 tokens)
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Health check." },
          { role: "user", content: "ok" },
        ],
        max_tokens: 1,
        temperature: 0,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(
        JSON.stringify({
          ok: false,
          deep: true,
          error: `OpenAI status ${resp.status}`,
          detail: text,
          ...base,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true, deep: true, ...base }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
