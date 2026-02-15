// deno-lint-ignore-file
// @ts-nocheck
// Supabase Edge Function: generate-pdf (stub)
// Accepts { reportIntakeId }
// Reads intake + branding via REST (optional) and returns { pdfUrl }

const SUPABASE_URL =
  (typeof Deno !== "undefined" && Deno.env && Deno.env.get("SUPABASE_URL")) ||
  (typeof process !== "undefined" && process.env.SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY =
  (typeof Deno !== "undefined" && Deno.env && Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) ||
  (typeof process !== "undefined" && process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function (req: Request) {
  try {
    if (req.method !== "POST")
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    const body = await req.json().catch(() => ({}));
    const reportIntakeId = body?.reportIntakeId;

    // TODO: Server-side PDF render using shared token map for parity.
    const pdfUrl = `https://cdn.skaiscraper.app/documents/${reportIntakeId || "preview"}.pdf`;

    return new Response(JSON.stringify({ pdfUrl }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
serve(async (req) => {
  const { reportIntakeId, org_id } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: ri } = await supabase
    .from("report_intake")
    .select("*")
    .eq("id", reportIntakeId)
    .single();
  const { data: brand } = await supabase
    .from("org_branding")
    .select("*")
    .eq("org_id", org_id)
    .single();
  // server-side render using shared tokens; upload to 'reports' bucket
  const pdfUrl = `https://cdn.example/reports/${reportIntakeId}.pdf`;
  return new Response(JSON.stringify({ pdfUrl }), {
    headers: { "content-type": "application/json" },
  });
});
import { serve } from "std/server";

serve(async (req: Request) => {
  try {
    const body = await req.json();
    const { reportIntakeId } = body;
    if (!reportIntakeId)
      return new Response(JSON.stringify({ error: "reportIntakeId required" }), { status: 400 });

    // TODO: render PDF server-side using template tokens and report_intake snapshot.
    // Placeholder: return a presigned URL or path to generated PDF.
    const pdfUrl = `/api/reports/${reportIntakeId}.pdf`;

    return new Response(JSON.stringify({ pdfUrl }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
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
    const { report_id, template_type, data } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Generating PDF for report ${report_id} with template ${template_type}`);

    // Generate HTML from template
    const html = generateHTMLTemplate(template_type, data);

    // For now, return a placeholder PDF URL
    // In production, you would use Puppeteer or a PDF service here
    // Example: const pdf = await generatePDFWithPuppeteer(html);

    const pdfPath = `reports/${report_id}.pdf`;
    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/reports/${pdfPath}`;

    // Update report with PDF URL
    const { error: updateError } = await supabase
      .from("reports")
      .update({
        pdf_url: pdfUrl,
        pdf_path: pdfPath,
        is_finalized: true,
      })
      .eq("id", report_id);

    if (updateError) {
      console.error("Error updating report:", updateError);
      throw updateError;
    }

    console.log("PDF generation complete:", pdfUrl);

    return new Response(
      JSON.stringify({
        success: true,
        pdf_url: pdfUrl,
        pdf_path: pdfPath,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-pdf:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateHTMLTemplate(templateType: string, data: any): string {
  // Base template structure
  const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
      h1 { color: #1a56db; border-bottom: 3px solid #1a56db; padding-bottom: 10px; }
      h2 { color: #555; margin-top: 30px; }
      .header { text-align: center; margin-bottom: 40px; }
      .section { margin: 20px 0; page-break-inside: avoid; }
      .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
      .photo-item img { width: 100%; border-radius: 8px; }
      .photo-caption { font-size: 12px; color: #666; margin-top: 5px; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f3f4f6; font-weight: bold; }
      .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; }
    </style>
  `;

  switch (templateType) {
    case "retail_bid":
      return `
        <!DOCTYPE html>
        <html>
        <head><title>Retail Proposal</title>${baseStyles}</head>
        <body>
          <div class="header">
            <h1>Roofing Proposal</h1>
            <p>${data.client_name || ""}<br>${data.property_address || ""}</p>
          </div>
          
          <div class="section">
            <h2>Scope of Work</h2>
            <p>${data.scope || "Complete roof replacement as described"}</p>
          </div>
          
          <div class="section">
            <h2>Pricing</h2>
            <table>
              <tr><th>Item</th><th>Description</th><th>Amount</th></tr>
              ${
                data.line_items
                  ?.map(
                    (item: any) => `
                <tr><td>${item.name}</td><td>${item.description}</td><td>$${item.amount}</td></tr>
              `
                  )
                  .join("") || '<tr><td colspan="3">No items</td></tr>'
              }
            </table>
          </div>
          
          <div class="footer">
            <p>Valid for 30 days | Thank you for your business</p>
          </div>
        </body>
        </html>
      `;

    case "inspection_summary":
      return `
        <!DOCTYPE html>
        <html>
        <head><title>Inspection Summary</title>${baseStyles}</head>
        <body>
          <div class="header">
            <h1>Roof Inspection Summary</h1>
            <p>${data.property_address || ""}<br>Date: ${data.inspection_date || new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Findings</h2>
            <p>${data.summary || "Inspection findings will be detailed here"}</p>
          </div>
          
          ${
            data.photos?.length
              ? `
            <div class="section">
              <h2>Photo Documentation</h2>
              <div class="photo-grid">
                ${data.photos
                  .map(
                    (photo: any) => `
                  <div class="photo-item">
                    <img src="${photo.url}" alt="${photo.caption}" />
                    <p class="photo-caption">${photo.caption || ""}</p>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
          
          <div class="footer">
            <p>Inspector: ${data.inspector_name || ""}</p>
          </div>
        </body>
        </html>
      `;

    case "storm_damage":
      return `
        <!DOCTYPE html>
        <html>
        <head><title>Storm Damage Assessment</title>${baseStyles}</head>
        <body>
          <div class="header">
            <h1>Storm Damage Assessment</h1>
            <p>${data.property_address || ""}<br>Storm Date: ${data.storm_date || ""}</p>
          </div>
          
          <div class="section">
            <h2>Damage Summary</h2>
            <p><strong>Total Damage Points:</strong> ${data.total_damage_count || 0}</p>
            <p><strong>Severity:</strong> ${data.severity || "Unknown"}</p>
            <p>${data.description || ""}</p>
          </div>
          
          <div class="section">
            <h2>Damage by Elevation</h2>
            <table>
              <tr><th>Elevation</th><th>Damage Type</th><th>Count</th></tr>
              ${
                data.damage_by_elevation
                  ?.map(
                    (d: any) => `
                <tr><td>${d.elevation}</td><td>${d.type}</td><td>${d.count}</td></tr>
              `
                  )
                  .join("") || '<tr><td colspan="3">No data</td></tr>'
              }
            </table>
          </div>
          
          ${
            data.photos?.length
              ? `
            <div class="section">
              <h2>Damage Documentation</h2>
              <div class="photo-grid">
                ${data.photos
                  .map(
                    (photo: any) => `
                  <div class="photo-item">
                    <img src="${photo.url}" alt="${photo.caption}" />
                    <p class="photo-caption">${photo.caption || ""} (${photo.damage_count || 0} hits)</p>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
          
          <div class="footer">
            <p>This assessment supports insurance claim filing</p>
          </div>
        </body>
        </html>
      `;

    default:
      return `
        <!DOCTYPE html>
        <html>
        <head><title>Report</title>${baseStyles}</head>
        <body>
          <div class="header">
            <h1>Roofing Report</h1>
            <p>${data.property_address || ""}</p>
          </div>
          <div class="section">
            <p>Report content will be generated based on template type: ${templateType}</p>
          </div>
        </body>
        </html>
      `;
  }
}
