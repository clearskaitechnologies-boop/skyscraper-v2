import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const mockupSchema = z.object({
  reportId: z.string().uuid(),
  address: z.string().min(3).max(200).optional(),
  colorway: z.string().min(2).max(40),
  systemType: z.enum(["Shingle", "Tile", "Metal"]).default("Shingle"),
  angles: z
    .array(z.enum(["front", "left", "right", "top"]))
    .min(1)
    .max(4),
  pitchHint: z.enum(["low", "medium", "steep"]).default("medium"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user token
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
    const spec = mockupSchema.parse(body);

    // SECURITY: Verify user owns the report
    const { data: report, error: reportErr } = await supabase
      .from("reports")
      .select("id, created_by")
      .eq("id", spec.reportId)
      .single();

    if (reportErr || !report) {
      return new Response(JSON.stringify({ error: "Report not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (report.created_by !== user.id) {
      console.warn(
        `Unauthorized mockup generation: user ${user.id} tried to generate mockup for report ${spec.reportId}`
      );
      return new Response(JSON.stringify({ error: "Unauthorized access to report" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Mockup spec:", spec);

    // Generate images using Lovable AI image model
    const images = [];

    for (const angle of spec.angles) {
      const prompt = `Generate a realistic architectural mockup of a ${spec.systemType.toLowerCase()} roof in ${spec.colorway} color, viewed from the ${angle} angle. The roof should have a ${spec.pitchHint} pitch. High quality, professional rendering style.`;

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
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
          console.error("Image generation failed:", await response.text());
          continue;
        }

        const data = await response.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (imageUrl) {
          images.push({
            angle,
            url: imageUrl,
            colorway: spec.colorway,
          });
        }
      } catch (error) {
        console.error(`Error generating ${angle} image:`, error);
      }
    }

    // Generate map pin if address provided
    let mapPinUrl: string | undefined;
    if (spec.address) {
      // Create a simple placeholder map URL
      // In production, integrate with Mapbox or Google Maps
      mapPinUrl = `https://via.placeholder.com/800x600/f9fafb/111827?text=${encodeURIComponent(spec.address)}`;
    }

    const result = {
      id: crypto.randomUUID(),
      images,
      mapPinUrl,
      created_at: new Date().toISOString(),
    };

    // Store mockup data in report
    const { data: reportData } = await supabase
      .from("reports")
      .select("report_data")
      .eq("id", spec.reportId)
      .single();

    if (reportData) {
      const updatedData = {
        ...(reportData as any).report_data,
        mockups: result,
      };

      await supabase.from("reports").update({ report_data: updatedData }).eq("id", spec.reportId);
    }

    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-mockup-v2:", error);
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
