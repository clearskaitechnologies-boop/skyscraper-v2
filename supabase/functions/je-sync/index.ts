/**
 * Sync JE Shaw data for a lead
 */
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
    const { lead_id, org_id, address, lat, lon } = await req.json();

    if (!lead_id || !org_id) {
      return new Response(JSON.stringify({ error: "lead_id and org_id are required" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jeBaseUrl = Deno.env.get("JE_SHAW_API_URL");
    const jeToken = Deno.env.get("JE_SHAW_API_TOKEN");

    if (!jeBaseUrl || !jeToken) {
      // Return mock data if no JE Shaw credentials configured
      const mockRows = [
        {
          org_id,
          lead_id,
          ext_id: "mock_1",
          address,
          lat: lat || 0,
          lon: lon || 0,
          layer: "hail_severity",
          value: { severity: "moderate", confidence: 0.85 },
        },
        {
          org_id,
          lead_id,
          ext_id: "mock_2",
          address,
          lat: lat || 0,
          lon: lon || 0,
          layer: "roof_age",
          value: { estimated_age: 12, data_source: "county_records" },
        },
      ];

      const supabase = createClient(
        Deno.env.get("VITE_SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await supabase.from("je_assets").upsert(mockRows, {
        onConflict: "org_id,ext_id",
        ignoreDuplicates: false,
      });

      return new Response(JSON.stringify({ imported: mockRows.length, mock: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call JE Shaw API
    const url = `${jeBaseUrl}/pins?lat=${lat}&lon=${lon}&radius=1mi`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jeToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`JE Shaw API error: ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || [];

    const rows = items.map((item: any) => ({
      org_id,
      lead_id,
      ext_id: item.id,
      address: address || item.address,
      lat: item.lat,
      lon: item.lon,
      layer: item.layer,
      value: item,
    }));

    const supabase = createClient(
      Deno.env.get("VITE_SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (rows.length > 0) {
      await supabase.from("je_assets").upsert(rows, {
        onConflict: "org_id,ext_id",
        ignoreDuplicates: false,
      });
    }

    return new Response(JSON.stringify({ imported: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in je-sync:", error);
    return new Response(JSON.stringify({ error: error.message || "JE sync failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
