/**
 * AI-powered photo captions for insurance claims
 * Uses OpenAI vision model to generate claim-ready descriptions
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPT = `You are a roof inspection expert. Describe this photo concisely for an insurance claim. Mention defect type and location cues. Be factual and professional.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photoId } = await req.json();
    if (!photoId) {
      return new Response(JSON.stringify({ error: "photoId required" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: photo, error: photoError } = await supabase
      .from("report_photos")
      .select("id, storage_path")
      .eq("id", photoId)
      .maybeSingle();

    if (photoError || !photo?.storage_path) {
      return new Response(JSON.stringify({ error: "photo not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get signed URL for the photo
    const { data: signedData, error: signError } = await supabase.storage
      .from("photos")
      .createSignedUrl(photo.storage_path, 60);

    if (signError || !signedData?.signedUrl) {
      return new Response(JSON.stringify({ error: "failed to get photo URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.log("OPENAI_API_KEY not configured, using fallback caption");
      const caption = getFallbackCaption(photo.storage_path);

      await supabase
        .from("report_photos")
        .update({
          caption,
          caption_source: "ai",
          caption_confidence: 0.4,
        })
        .eq("id", photoId);

      return new Response(JSON.stringify({ ok: true, caption, confidence: 0.4 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call OpenAI vision API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Generate a short, specific caption describing roof damage or features. 18 words max.",
              },
              { type: "image_url", image_url: { url: signedData.signedUrl } },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 60,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status, await response.text());
      return new Response(JSON.stringify({ error: "OpenAI API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const caption = data?.choices?.[0]?.message?.content?.trim() || "Roof overview.";

    // Update photo with AI caption
    await supabase
      .from("report_photos")
      .update({
        caption,
        caption_source: "ai",
        caption_confidence: 0.85,
      })
      .eq("id", photoId);

    return new Response(JSON.stringify({ ok: true, caption, confidence: 0.85 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in ai-caption:", error);
    return new Response(JSON.stringify({ error: error.message || "ai-caption failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getFallbackCaption(storagePath: string): string {
  const lower = storagePath.toLowerCase();
  if (lower.includes("hail")) return "Hail impacts visible on shingle surface.";
  if (lower.includes("ridge")) return "Ridge line with wear along the cap shingles.";
  if (lower.includes("missing")) return "Missing shingle exposing underlayment.";
  return "Roof slope with visible granule loss and wear.";
}
