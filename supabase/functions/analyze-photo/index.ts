import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SECURITY: Rate limiting to prevent AI API abuse (20 requests per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

const photoSchema = z
  .object({
    image_url: z.string().url("Invalid image URL").max(2048).optional(),
    image_data: z.string().max(10485760, "Image data too large").optional(), // ~10MB base64
    elevation: z.string().max(50).optional(),
    stage: z.string().max(50).optional(),
  })
  .refine((data) => data.image_url || data.image_data, {
    message: "Either image_url or image_data is required",
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check (use IP as identifier for public endpoint)
    const clientIp =
      req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Maximum 20 photo analyses per hour." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { image_url, image_data, elevation, stage } = photoSchema.parse(body);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Prepare image for analysis
    let imageContent;
    if (image_url) {
      imageContent = { type: "image_url", image_url: { url: image_url } };
    } else if (image_data) {
      imageContent = {
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${image_data}` },
      };
    } else {
      throw new Error("No image provided");
    }

    console.log("Analyzing photo with Lovable AI...");

    // Call Lovable AI Gateway for image analysis
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
            content: `You are a roofing inspection AI analyzing photos for damage detection. Identify:
            1. Damage types (hail impacts, wind damage, missing/lifted shingles, cracks, wear)
            2. Count visible damage instances (especially hail hits)
            3. Severity level (minor, moderate, severe)
            4. Specific features (roof material, condition, notable issues)
            
            Provide a concise caption suitable for an inspection report and return structured JSON with:
            {
              "caption": "Brief descriptive caption",
              "damage_types": ["hail", "wind", etc.],
              "damage_count": number,
              "severity": "minor|moderate|severe",
              "tags": ["descriptive", "tags"],
              "confidence": 0-100
            }`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this ${stage || "roof"} photo taken from the ${elevation || "unknown"} side. Identify any damage and describe what you see.`,
              },
              imageContent,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No analysis result from AI");
    }

    // Try to parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : {
            caption: content,
            damage_types: [],
            damage_count: 0,
            severity: "unknown",
            tags: [],
            confidence: 50,
          };
    } catch (e) {
      // If JSON parsing fails, use the text content
      analysis = {
        caption: content,
        damage_types: [],
        damage_count: 0,
        severity: "unknown",
        tags: [elevation, stage].filter(Boolean),
        confidence: 50,
      };
    }

    console.log("Photo analysis complete:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in analyze-photo:", errorMessage);

    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: (error as any).errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
