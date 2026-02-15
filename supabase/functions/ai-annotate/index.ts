// Deno Deploy Edge Function (Supabase)
// POST /functions/v1/ai-annotate  { imageUrl: string }

type Box = { x: number; y: number; w: number; h: number; label: string; confidence: number };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { imageUrl } = await req.json().catch(() => ({}));
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 🔁 TODO: replace with real inference (OpenAI, Replicate, custom model).
    // For now, return example boxes:
    const fake: Box[] = [
      { x: 120, y: 90, w: 160, h: 160, label: "hail hit", confidence: 0.91 },
      { x: 330, y: 210, w: 140, h: 120, label: "missing shingle", confidence: 0.88 },
    ];

    const captions = [
      "Multiple hail impacts detected on south slope near ridge.",
      "Wind damage: missing shingles along eave course.",
    ];

    return new Response(JSON.stringify({ boxes: fake, captions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-annotate:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
