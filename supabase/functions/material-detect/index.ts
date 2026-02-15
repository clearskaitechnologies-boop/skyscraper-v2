/**
 * Material detection: classify roof material from photo
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAP: Record<string, string> = {
  asphalt_shingle: "asphalt",
  shingle: "asphalt",
  clay_tile: "tile",
  concrete_tile: "tile",
  tile: "tile",
  standing_seam: "metal",
  metal_panel: "metal",
  metal: "metal",
  tpo: "flat",
  epdm: "flat",
  modified_bitumen: "flat",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photo_id } = await req.json();
    if (!photo_id) {
      return new Response(JSON.stringify({ error: "photo_id required" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: photo, error: photoError } = await supabase
      .from("photos")
      .select("id, file_url")
      .eq("id", photo_id)
      .maybeSingle();

    if (photoError || !photo?.file_url) {
      return new Response(JSON.stringify({ error: "photo not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Replace with real model call (OpenAI vision, custom classifier, etc.)
    const mockLabel = "asphalt_shingle";
    const mockConfidence = 0.86;

    const material = MAP[mockLabel] ?? "unknown";

    // Get org_id and lead_id from photo
    const { data: photoDetails } = await supabase
      .from("photos")
      .select("lead_id")
      .eq("id", photo_id)
      .single();

    const { data: lead } = await supabase
      .from("leads")
      .select("org_id")
      .eq("id", photoDetails?.lead_id)
      .maybeSingle();

    if (lead?.org_id) {
      await supabase.from("photo_materials").insert({
        org_id: lead.org_id,
        photo_id,
        material,
        confidence: mockConfidence,
        model: "material-cls-v1",
      });

      // Update lead roof_material by majority vote
      const { data: allPhotos } = await supabase
        .from("photos")
        .select("id")
        .eq("lead_id", photoDetails?.lead_id);

      if (allPhotos) {
        const photoIds = allPhotos.map((p: any) => p.id);
        const { data: materials } = await supabase
          .from("photo_materials")
          .select("material")
          .in("photo_id", photoIds);

        if (materials && materials.length > 0) {
          const counts: Record<string, number> = {};
          materials.forEach((m: any) => {
            counts[m.material] = (counts[m.material] || 0) + 1;
          });
          const topMaterial = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

          await supabase
            .from("leads")
            .update({ roof_material: topMaterial })
            .eq("id", photoDetails?.lead_id);
        }
      }
    }

    return new Response(JSON.stringify({ material, confidence: mockConfidence }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("material-detect error:", error?.message || error);
    return new Response(JSON.stringify({ error: "material-detect failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
