import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, jurisdiction, zip_code } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Looking up codes for ${jurisdiction || zip_code || address}`);

    // Check cache first
    const { data: cached } = await supabase
      .from("code_compliance")
      .select("*")
      .or(`jurisdiction.eq.${jurisdiction},zip_code.eq.${zip_code}`)
      .single();

    if (cached) {
      console.log("Returning cached code data");
      return new Response(JSON.stringify(cached.requirements), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mock code requirements (in production, integrate with OneClick Code API or similar)
    const mockRequirements = generateMockCodeRequirements(jurisdiction, zip_code);

    // Cache the result
    const { error: insertError } = await supabase.from("code_compliance").insert({
      jurisdiction: jurisdiction || "Unknown",
      zip_code: zip_code,
      requirements: mockRequirements,
      source: "mock_data",
      last_updated: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error caching code data:", insertError);
    }

    console.log("Generated and cached new code requirements");

    return new Response(JSON.stringify(mockRequirements), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in lookup-codes:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateMockCodeRequirements(jurisdiction?: string, zipCode?: string) {
  // Mock data - in production, fetch from OneClick Code API or similar
  return {
    jurisdiction: jurisdiction || "General",
    zip_code: zipCode,
    requirements: {
      ice_and_water_shield: {
        required: true,
        code: "R905.2.7.1",
        description: "Ice barrier required on eaves extending 24 inches inside exterior wall",
      },
      drip_edge: {
        required: true,
        code: "R905.2.8.5",
        description: "Drip edge required at eaves and rakes",
      },
      underlayment: {
        required: true,
        code: "R905.2.7",
        description: "Underlayment required over entire roof deck",
      },
      valley_flashing: {
        required: true,
        code: "R903.2",
        description: "Valley flashing required at all roof valleys",
      },
      fastener_requirements: {
        required: true,
        code: "R905.2.5",
        description: "Minimum 4 fasteners per shingle, 6 in high wind areas",
      },
      wind_resistance: {
        required: true,
        code: "R905.2.4",
        description: "Shingles must meet wind resistance requirements for local wind zone",
      },
    },
    notes: [
      "Requirements vary by local jurisdiction",
      "Check with local building department for specific requirements",
      "Wind and snow load requirements may affect material selection",
    ],
    last_updated: new Date().toISOString(),
  };
}
