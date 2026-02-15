import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const weatherSchema = z.object({
  address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.number().min(-180).max(180, "Invalid longitude"),
  date_range_days: z.number().int().min(1).max(730, "Date range must be 1-730 days").default(365),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { address, latitude, longitude, date_range_days } = weatherSchema.parse(body);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Fetching weather events for ${address || `${latitude},${longitude}`}`);

    // Check for existing events in database
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - date_range_days);

    let query = supabase
      .from("weather_events")
      .select("*")
      .gte("event_date", dateThreshold.toISOString().split("T")[0])
      .order("event_date", { ascending: false });

    if (latitude && longitude) {
      // Query within ~50 mile radius (approximate)
      const latRange = 0.72; // ~50 miles
      const lonRange = 0.72;
      query = query
        .gte("latitude", latitude - latRange)
        .lte("latitude", latitude + latRange)
        .gte("longitude", longitude - lonRange)
        .lte("longitude", longitude + lonRange);
    }

    const { data: existingEvents, error: queryError } = await query;

    if (queryError) {
      console.error("Error querying weather events:", queryError);
    }

    // If we have recent data, return it
    if (existingEvents && existingEvents.length > 0) {
      console.log(`Found ${existingEvents.length} weather events in database`);
      return new Response(JSON.stringify({ events: existingEvents, source: "database" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Otherwise, generate mock data (in production, call weather/hail API)
    const mockEvents = generateMockWeatherEvents(latitude || 0, longitude || 0, address);

    // Store mock events for future use
    for (const event of mockEvents) {
      await supabase.from("weather_events").insert(event);
    }

    console.log(`Generated ${mockEvents.length} mock weather events`);

    return new Response(JSON.stringify({ events: mockEvents, source: "mock_data" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in fetch-weather:", errorMessage);

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

function generateMockWeatherEvents(lat: number, lon: number, address?: string) {
  // Generate 3-5 mock hail/wind events over the past year
  const events = [];
  const today = new Date();
  const eventTypes = ["hail", "wind", "thunderstorm"];
  const severities = ["minor", "moderate", "severe"];

  for (let i = 0; i < 4; i++) {
    const daysAgo = Math.floor(Math.random() * 365);
    const eventDate = new Date(today);
    eventDate.setDate(eventDate.getDate() - daysAgo);

    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const event: any = {
      latitude: lat + (Math.random() - 0.5) * 0.1,
      longitude: lon + (Math.random() - 0.5) * 0.1,
      address: address || null,
      event_type: eventType,
      event_date: eventDate.toISOString().split("T")[0],
      severity: severities[Math.floor(Math.random() * severities.length)],
      data_source: "mock_data",
    };

    if (eventType === "hail") {
      event.hail_size_inches = Math.random() * 2 + 0.5; // 0.5 to 2.5 inches
    } else if (eventType === "wind") {
      event.wind_speed_mph = Math.floor(Math.random() * 50 + 40); // 40-90 mph
    }

    events.push(event);
  }

  return events.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
}
