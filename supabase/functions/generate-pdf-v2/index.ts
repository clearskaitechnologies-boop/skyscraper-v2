import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SECURITY: Rate limiting to prevent resource abuse (30 per hour per user)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

const exportSchema = z.object({
  reportId: z.string().uuid(),
  themeId: z.string().optional(),
  watermark: z.enum(["draft", "confidential", "client-review"]).nullable().optional(),
  sections: z
    .array(
      z.enum([
        "cover",
        "summary",
        "photos",
        "materials",
        "warranties",
        "timeline",
        "prices",
        "signatures",
      ])
    )
    .optional(),
  photoLayout: z.enum(["grid2", "grid3", "grid4"]).optional(),
  addToc: z.boolean().optional(),
  pageNumbers: z.boolean().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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

    // SECURITY: Rate limiting check
    if (!checkRateLimit(user.id)) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Maximum 30 PDF generations per hour." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const options = exportSchema.parse(body);

    console.log("Export options:", options);

    // Fetch report
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, report_name, report_data, lead_id")
      .eq("id", options.reportId)
      .single();

    if (reportError || !report) {
      console.error("Report not found:", reportError);
      return new Response(JSON.stringify({ error: "Report not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For now, create a simple placeholder response
    // In a real implementation, you would generate the PDF using a library
    // that works in Deno (like pdf-lib through npm: imports)
    const fileName = `${report.report_name.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.pdf`;
    const filePath = `exports/${report.id}/${fileName}`;

    // Store export metadata in report_data
    const exportMetadata = {
      ...report.report_data,
      lastExport: {
        timestamp: new Date().toISOString(),
        options: options,
        path: filePath,
        userId: user.id,
      },
    };

    await supabase.from("reports").update({ report_data: exportMetadata }).eq("id", report.id);

    // Generate a signed URL for download (placeholder)
    // In production, you would upload the actual PDF file first
    const { data: signed, error: signError } = await supabase.storage
      .from("reports")
      .createSignedUrl(filePath, 3600);

    if (signError) {
      console.error("Error creating signed URL:", signError);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        path: filePath,
        url: signed?.signedUrl || null,
        message: "PDF export initiated. Full PDF generation will be implemented with pdf-lib.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-pdf-v2:", error);
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
