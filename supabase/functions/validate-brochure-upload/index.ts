import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SECURITY: Only allow marketing-appropriate MIME types in public brochures bucket
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  fileSize: z
    .number()
    .int()
    .min(1)
    .max(10 * 1024 * 1024), // 10MB max
  bucket: z.literal("brochures"),
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
      return new Response(JSON.stringify({ error: "Authentication required" }), {
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
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const upload = uploadSchema.parse(body);

    // SECURITY: Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(upload.mimeType.toLowerCase())) {
      console.warn(
        `Rejected brochures upload: invalid MIME type ${upload.mimeType} by user ${user.id}`
      );
      return new Response(
        JSON.stringify({
          error: "Invalid file type",
          message: "Only PDF and image files are allowed in the brochures bucket",
          allowedTypes: ALLOWED_MIME_TYPES,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // SECURITY: Log upload to audit trail
    const auditLog = {
      event_type: "brochures_upload_validated",
      user_id: user.id,
      metadata: {
        fileName: upload.fileName,
        mimeType: upload.mimeType,
        fileSize: upload.fileSize,
        timestamp: new Date().toISOString(),
      },
    };

    await supabase.from("app_logs").insert(auditLog);

    console.log(
      `Validated brochures upload: ${upload.fileName} (${upload.mimeType}) by user ${user.id}`
    );

    return new Response(
      JSON.stringify({
        ok: true,
        validated: true,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in validate-brochure-upload:", error);

    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: (error as any).errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Validation failed",
        message: "Unable to validate upload",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
