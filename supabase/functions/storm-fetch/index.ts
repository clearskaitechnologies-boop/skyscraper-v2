/**
 * Fetch storm data from XWeather API
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
    const { lat, lon, address, org_id } = await req.json();

    if (typeof lat !== "number" || typeof lon !== "number") {
      return new Response(JSON.stringify({ error: "lat and lon are required as numbers" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const xweatherKey = Deno.env.get("XWEATHER_KEY");
    if (!xweatherKey) {
      // Return mock data if no API key configured
      const mockData = {
        provider: "xweather",
        event_type: "hail",
        hail_size_in: 1.5,
        wind_speed_mph: 65,
        event_started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'Mock data: Recent hail event with 1.5" diameter near property.',
        raw: { mock: true },
      };

      const supabase = createClient(
        Deno.env.get("VITE_SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      if (org_id) {
        await supabase.from("storm_events").insert({
          org_id,
          address,
          lat,
          lon,
          ...mockData,
        });
      }

      return new Response(JSON.stringify(mockData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call XWeather API
    const url = `https://api.aerisapi.com/stormreports/closest?p=${lat},${lon}&filter=hail,wind&limit=1&client_id=${xweatherKey}&client_secret=${xweatherKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const item = data?.response?.[0] || {};
    const result = {
      provider: "xweather",
      event_type: item.report?.type || "hail",
      hail_size_in: item.report?.sizeIN,
      wind_speed_mph: item.report?.windSpeedMPH,
      event_started_at: item.report?.dateTimeISO,
      summary: item.report
        ? `Nearest ${item.report.type} near property.`
        : "No recent storm reports nearby.",
      raw: data,
    };

    const supabase = createClient(
      Deno.env.get("VITE_SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (org_id) {
      await supabase.from("storm_events").insert({
        org_id,
        address,
        lat,
        lon,
        provider: result.provider,
        event_type: result.event_type,
        hail_size_in: result.hail_size_in,
        wind_speed_mph: result.wind_speed_mph,
        event_started_at: result.event_started_at,
        summary: result.summary,
        payload: result.raw,
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in storm-fetch:", error);
    return new Response(JSON.stringify({ error: error.message || "Storm fetch failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
