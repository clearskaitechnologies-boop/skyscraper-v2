import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const mapPinSchema = z.object({
  reportId: z.string().uuid(),
  address: z.string().min(3).max(200).optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  width: z.number().default(800),
  height: z.number().default(600),
  style: z.string().default("streets-v12"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const mapboxToken = Deno.env.get("MAPBOX_ACCESS_TOKEN");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!mapboxToken) {
      return new Response(JSON.stringify({ error: "Mapbox token not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth verification failed:", authError);
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const spec = mapPinSchema.parse(body);

    let longitude = spec.lon;
    let latitude = spec.lat;

    // Geocode address if coordinates not provided
    if (!longitude || !latitude) {
      if (!spec.address) {
        return new Response(JSON.stringify({ error: "Either address or coordinates required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Geocoding address:", spec.address);
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(spec.address)}.json?access_token=${mapboxToken}`;
      const geocodeRes = await fetch(geocodeUrl);

      if (!geocodeRes.ok) {
        console.error("Geocoding failed:", await geocodeRes.text());
        return new Response(JSON.stringify({ error: "Geocoding failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const geocodeData = await geocodeRes.json();
      const feature = geocodeData.features?.[0];

      if (!feature) {
        return new Response(JSON.stringify({ error: "Address not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      [longitude, latitude] = feature.center;
      console.log("Geocoded coordinates:", { longitude, latitude });
    }

    // Generate static map with pin
    const pin = `pin-s+ff0000(${longitude},${latitude})`;
    const center = `${longitude},${latitude},16,0`;
    const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/${spec.style}/static/${pin}/${center}/${spec.width}x${spec.height}?access_token=${mapboxToken}`;

    console.log("Fetching static map from:", staticMapUrl);
    const mapRes = await fetch(staticMapUrl);

    if (!mapRes.ok) {
      console.error("Static map fetch failed:", await mapRes.text());
      return new Response(JSON.stringify({ error: "Failed to generate map" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mapBuffer = await mapRes.arrayBuffer();

    // Upload to storage
    const fileName = `map-${Date.now()}.png`;
    const filePath = `mockups/${spec.reportId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(filePath, mapBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate signed URL
    const { data: signedData, error: signedError } = await supabase.storage
      .from("reports")
      .createSignedUrl(filePath, 3600);

    if (signedError) {
      console.error("Signed URL error:", signedError);
      return new Response(JSON.stringify({ error: signedError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update report data
    const { data: report } = await supabase
      .from("reports")
      .select("report_data")
      .eq("id", spec.reportId)
      .single();

    if (report) {
      const updatedData = {
        ...report.report_data,
        mockups: {
          ...(report.report_data?.mockups || {}),
          mapPinUrl: signedData.signedUrl,
          mapPinPath: filePath,
          coordinates: { latitude, longitude },
        },
      };

      await supabase.from("reports").update({ report_data: updatedData }).eq("id", spec.reportId);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        path: filePath,
        url: signedData.signedUrl,
        coordinates: { latitude, longitude },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-map-pin:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
