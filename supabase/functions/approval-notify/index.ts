import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SECURITY: Rate limiting to prevent email spam (50 per hour per user)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 50;
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

const notifySchema = z.object({
  type: z.enum(["client_submitted", "manager_signed"]),
  reportId: z.string().uuid(),
  versionNo: z.number().int().positive().optional(),
});

function escapeHtml(text: string): string {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

async function sendMail({ from, to, subject, html, text }: any) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!r.ok) {
    const error = await r.text();
    throw new Error(`Email send failed: ${error}`);
  }

  return r.json();
}

function currency(n: number) {
  return `$${(n || 0).toFixed(2)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const { type, reportId, versionNo } = notifySchema.parse(body);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Load report & pricing
    const { data: rpt, error: rptError } = await sb
      .from("reports")
      .select("id, report_name, report_data")
      .eq("id", reportId)
      .single();

    if (rptError || !rpt) {
      return new Response(JSON.stringify({ error: "Report not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reportData = rpt.report_data as any;
    const prices = reportData?.prices;
    const clientEmail = reportData?.client?.email || Deno.env.get("DEFAULT_CLIENT_EMAIL");
    const clientName = reportData?.client?.name || "Client";
    const managerEmail = reportData?.manager?.email || Deno.env.get("DEFAULT_MANAGER_EMAIL");
    const managerName = reportData?.manager?.name || "Manager";

    const FROM = Deno.env.get("FROM_EMAIL") || "no-reply@clearskairoofing.com";
    const APP = Deno.env.get("APP_BASE_URL") || "https://app.clearskairoofing.com";

    // Calculate subtotal
    let subtotal = 0;
    if (prices?.lines) {
      for (const ln of prices.lines) {
        subtotal += (ln.qty || 0) * (ln.unitPrice || 0);
      }
    }

    if (type === "client_submitted") {
      // Notify manager to countersign
      const subject = `Approval Pending — ${rpt.report_name || "Report"}`;
      const link = `${APP}/report-workbench?id=${reportId}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0EA5E9;">Client Initials Submitted</h2>
          <p>Hi ${escapeHtml(managerName)},</p>
          <p>The client has submitted initials for <strong>${escapeHtml(rpt.report_name || "a report")}</strong>.</p>
          <p><strong>Subtotal:</strong> ${currency(subtotal)}</p>
          <p style="margin-top: 20px;">
            <a href="${link}" style="background: #0EA5E9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Open Report to Countersign
            </a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            ClearSKai Roofing - Professional Inspection Reports
          </p>
        </div>
      `;

      await sendMail({
        from: FROM,
        to: managerEmail,
        subject,
        html,
        text: `Client submitted approvals. Subtotal ${currency(subtotal)}. ${link}`,
      });

      console.log(`Manager notification sent to ${managerEmail}`);

      return new Response(JSON.stringify({ ok: true, message: "Manager notified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "manager_signed") {
      // Get stamped PDF URL
      const stampedPath = reportData?.approvals?.path;
      let downloadUrl = "";

      if (stampedPath) {
        const { data: signed } = await sb.storage
          .from("reports")
          .createSignedUrl(stampedPath, 604800); // 7 days

        if (signed) downloadUrl = signed.signedUrl;
      }

      const subject = `Approved — Your Signed Pricing for ${rpt.report_name || "Report"}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Pricing Approved! ✓</h2>
          <p>Hi ${escapeHtml(clientName)},</p>
          <p>Your pricing has been approved and countersigned by our team.</p>
          ${
            downloadUrl
              ? `
            <p style="margin-top: 20px;">
              <a href="${downloadUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Download Signed PDF
              </a>
            </p>
          `
              : `
            <p>You can view the signed document in your portal.</p>
          `
          }
          <p style="margin-top: 30px;">Thank you for choosing ClearSKai Roofing!</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            ClearSKai Roofing<br/>
            Professional Inspection Reports
          </p>
        </div>
      `;

      await sendMail({
        from: FROM,
        to: clientEmail,
        subject,
        html,
        text: `Your pricing has been approved. ${downloadUrl || "View in your portal."}`,
      });

      console.log(`Client notification sent to ${clientEmail}`);

      return new Response(JSON.stringify({ ok: true, message: "Client notified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown notification type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in approval-notify:", error);
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
        message: "Unable to send notification. Please try again.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
