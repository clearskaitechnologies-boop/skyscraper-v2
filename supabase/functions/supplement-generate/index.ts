/**
 * Generate supplement line items from detected defects
 * Returns structured line items for contractor add-ons
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type LineItem = {
  code: string;
  desc: string;
  qty: number;
  unit: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { defects, roofType, slope, layers, notes } = await req.json();

    // Placeholder: mock supplement items
    // TODO: Map detected defects to standard line items or use LLM
    const items: LineItem[] = [
      { code: "LADDER_SET", desc: "Ladder setup & removal", qty: 1, unit: "ea" },
      { code: "R&R_DRIP_EDGE", desc: "Remove & replace drip edge", qty: 120, unit: "lf" },
      {
        code: "ICE_WATER_SHIELD",
        desc: "Install ice & water shield at eaves/valleys",
        qty: 2,
        unit: "sq",
      },
      { code: "RIDGE_CAP", desc: "Replace damaged ridge cap", qty: 40, unit: "lf" },
    ];

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in supplement-generate:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
