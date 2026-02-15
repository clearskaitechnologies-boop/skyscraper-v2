/**
 * Building code & material compliance checks
 * Returns structured findings with citations
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Finding = {
  title: string;
  clause: string;
  summary: string;
  action: string;
  source?: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jurisdiction, roofType, manufacturer, suspectedIssue } = await req.json();

    // Placeholder: mock code findings
    // TODO: Replace with actual code database lookup or LLM-powered search
    const findings: Finding[] = [
      {
        title: "3-tab shingle discontinuation",
        clause: "Manufacturer tech bulletin TB-2021-04",
        summary: "3-tab line discontinued; mixing with new architectural shingles not permitted.",
        action: "Full slope replacement recommended to maintain uniformity & warranty.",
        source: "https://manufacturer.example/bulletins/TB-2021-04",
      },
      {
        title: "Tile channel/locking mismatch",
        clause: "Local code §1507.4.4 / R905.3",
        summary:
          "Replacement tiles must match profile/channel & interlock; incompatible systems are noncompliant.",
        action: "Replace affected area with matching system or replace slope.",
        source: "https://codes.iccsafe.org/",
      },
    ];

    return new Response(JSON.stringify({ findings }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in code-check:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
