import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SECURITY: Rate limiting to prevent email spam (50 per hour per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 50;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check (use IP as identifier)
    const clientIp =
      req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Maximum 50 emails per hour." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, subject, html, text, pdfUrl } = await req.json();

    if (!to || !subject || !(html || text)) {
      return new Response(JSON.stringify({ error: "Missing to/subject/body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get SMTP configuration from environment
    const smtpHost = Deno.env.get("EMAIL_HOST") || "smtp.office365.com";
    const smtpPort = parseInt(Deno.env.get("EMAIL_PORT") || "587");
    const smtpUser = Deno.env.get("EMAIL_USER");
    const smtpPass = Deno.env.get("EMAIL_PASS");
    const fromEmail = `ClearSKai Roofing <${smtpUser}>`;

    if (!smtpUser || !smtpPass) {
      return new Response(JSON.stringify({ error: "Email credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare email content
    const emailBody = html || `<pre>${text}</pre>`;
    const fullHtml = pdfUrl
      ? `${emailBody}<p>Download report: <a href="${pdfUrl}">${pdfUrl}</a></p>`
      : emailBody;

    // Create SMTP client
    const client = new SmtpClient();

    try {
      // Connect to SMTP server with TLS
      await client.connectTLS({
        hostname: smtpHost,
        port: smtpPort,
        username: smtpUser,
        password: smtpPass,
      });

      // Send email
      await client.send({
        from: fromEmail,
        to: Array.isArray(to) ? to.join(",") : to,
        subject: subject,
        content: fullHtml,
        html: fullHtml,
      });

      // Close connection
      await client.close();

      console.log(`Email sent successfully to ${to}`);

      return new Response(
        JSON.stringify({ ok: true, provider: "smtp", message: "Email sent successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (smtpError: any) {
      console.error("SMTP error:", smtpError);
      throw new Error(`SMTP error: ${smtpError.message}`);
    }
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to send email" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
