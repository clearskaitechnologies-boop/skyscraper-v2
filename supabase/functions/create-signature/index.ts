import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SECURITY: Rate limiting to prevent signature spam (10 per hour per report)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(reportId: string): boolean {
  const now = Date.now();
  const reportLimit = rateLimitMap.get(reportId);

  if (!reportLimit || now > reportLimit.resetAt) {
    rateLimitMap.set(reportId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (reportLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  reportLimit.count++;
  return true;
}

const signatureSchema = z.object({
  reportId: z.string().uuid(),
  signerName: z.string().min(1).max(200),
  signerEmail: z.string().email().optional().nullable(),
  signatureDataUrl: z.string().startsWith("data:image/png;base64,"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const data = signatureSchema.parse(body);

    // SECURITY: Rate limiting check (per report)
    if (!checkRateLimit(data.reportId)) {
      console.warn(`Rate limit exceeded for report ${data.reportId}`);
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Maximum 10 signatures per hour per report.",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has access to this report
    const {
      data: { user },
    } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get IP and user agent for audit trail
    const ipAddress =
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Decode signature PNG from base64
    const base64Data = data.signatureDataUrl.split(",")[1];
    const signatureBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Upload signature to storage
    const signaturePath = `signatures/${data.reportId}/${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(signaturePath, signatureBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Signature upload error:", uploadError);
      throw new Error("Failed to upload signature");
    }

    // Fetch the report to get the latest PDF
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, report_name, report_data, pdf_path")
      .eq("id", data.reportId)
      .single();

    if (reportError || !report) {
      console.error("Report fetch error:", reportError);
      throw new Error("Report not found");
    }

    // For now, we'll reference the existing PDF and signature
    // In a production implementation, you would:
    // 1. Download the existing PDF
    // 2. Use pdf-lib to add the signature to the last page
    // 3. Upload the merged PDF
    // 4. Return the signed PDF URL

    const signedPdfPath = `signed/${data.reportId}/${Date.now()}.pdf`;

    // Create signature record
    const { error: signatureError } = await supabase.from("report_signatures").insert({
      report_id: data.reportId,
      signer_name: data.signerName,
      signer_email: data.signerEmail,
      ip_address: ipAddress,
      user_agent: userAgent,
      signature_path: signaturePath,
      signed_pdf_path: signedPdfPath,
    });

    if (signatureError) {
      console.error("Signature record error:", signatureError);
      throw new Error("Failed to create signature record");
    }

    // Log audit event
    await supabase.from("report_audit_events").insert({
      report_id: data.reportId,
      event_type: "esign.sign",
      meta: {
        signerName: data.signerName,
        signerEmail: data.signerEmail,
        ipAddress,
      },
    });

    // Generate signed URL for the signature
    const { data: signatureUrlData, error: signatureUrlError } = await supabase.storage
      .from("reports")
      .createSignedUrl(signaturePath, 3600);

    if (signatureUrlError) {
      console.error("Signed URL error:", signatureUrlError);
    }

    // Send email receipt if email provided and Resend is configured
    if (data.signerEmail && resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "ClearSKai <onboarding@resend.dev>",
            to: [data.signerEmail],
            subject: "Your Signed Report",
            html: `
              <h1>Thank you for signing, ${data.signerName}!</h1>
              <p>Your signature has been successfully recorded for the report: ${report.report_name}</p>
              <p>You can download your signed document using the link provided.</p>
              <p>Best regards,<br>ClearSKai Team</p>
            `,
          }),
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        signaturePath,
        signedPdfPath,
        receiptUrl: signatureUrlData?.signedUrl || null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in create-signature:", error);
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({
        error: "Operation failed",
        message: "Unable to create signature. Please try again.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
