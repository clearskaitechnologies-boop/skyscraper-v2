// deno-lint-ignore-file
// @ts-nocheck
// Supabase Edge Function: generate-mockup (stub)
// Accepts { reportIntakeId, page }
// Inserts usage_events(kind='AI_MOCKUP', unit_cost_cents=99) and returns { imageUrl }

const SUPABASE_URL =
  (typeof Deno !== "undefined" && Deno.env && Deno.env.get("SUPABASE_URL")) ||
  (typeof process !== "undefined" && process.env.SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY =
  (typeof Deno !== "undefined" && Deno.env && Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) ||
  (typeof process !== "undefined" && process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function (req: Request) {
  try {
    if (req.method !== "POST")
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    const body = await req.json().catch(() => ({}));
    const reportIntakeId = body?.reportIntakeId;
    const page = body?.page || "cover";

    const imageUrl = `https://cdn.skaiscraper.app/mockups/${reportIntakeId || "preview"}-${page}.png`;

    // record usage
    const usage = {
      org_id: body?.org_id || null,
      kind: "AI_MOCKUP",
      unit_cost_cents: 99,
      qty: 1,
      metadata: { reportIntakeId, page },
      created_at: new Date().toISOString(),
    };
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/usage_events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(usage),
      }).catch(() => {});
    }

    return new Response(JSON.stringify({ imageUrl }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
serve(async (req) => {
  const { reportIntakeId, page, org_id, user_id } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  // 1) fetch intake + brand
  const { data: ri } = await supabase
    .from("report_intake")
    .select("*")
    .eq("id", reportIntakeId)
    .single();
  const { data: brand } = await supabase
    .from("org_branding")
    .select("*")
    .eq("org_id", org_id)
    .single();
  // 2) render image via your existing renderer / pipeline (stubbed here)
  const imageUrl = `https://cdn.example/mockups/${reportIntakeId}-${page}.png`;
  // 3) usage event
  await supabase
    .from("usage_events")
    .insert({ org_id, user_id, kind: "AI_MOCKUP", unit_cost_cents: 99, meta: { page } });
  return new Response(JSON.stringify({ imageUrl }), {
    headers: { "content-type": "application/json" },
  });
});
import { serve } from "std/server";

serve(async (req: Request) => {
  try {
    const body = await req.json();
    const { reportIntakeId, page } = body;
    if (!reportIntakeId)
      return new Response(JSON.stringify({ error: "reportIntakeId required" }), { status: 400 });

    // TODO: wire into existing mockup pipeline. For now return a placeholder image URL.
    const result = {
      imageUrl: `/api/mockups/${reportIntakeId}-${page}.png`,
      webpUrl: `/api/mockups/${reportIntakeId}-${page}.webp`,
    };

    // Insert usage_events (AI_MOCKUP) server-side when service key is configured.

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing 'prompt' parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Mockup generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "No image generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in generate-mockup:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
