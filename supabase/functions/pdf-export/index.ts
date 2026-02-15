// Supabase Edge Function: pdf-export (simplified)
// - Loads org branding via Supabase SQL or calls the branding API
// - Merges template_defaults into template data
// - Renders a very small HTML string (example) and returns a pretend file_key
// - Inserts a schema-aware usage_events row (kind='pdf_generation', unit_cost_cents)

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_KEY;

const supabase = url && key ? createClient(url, key) : null;

export default async function handler(req: any) {
  const body = await req.json().catch(() => ({}));
  const orgId = body.org_id || body.orgId || null;
  const template = body.template || {};

  let branding = null;
  try {
    if (supabase && orgId) {
      // Try to read from organizations table
      const { data } = await supabase
        .rpc("sql", { q: `select * from organizations where org_id='${orgId}' limit 1` })
        .catch(() => ({ data: null }) as any);
      branding = data?.[0] || null;
    }
  } catch (e) {
    console.error("branding load error", e);
  }

  // Merge template_defaults
  const defaults = (branding && branding.template_defaults) || {};
  const merged = { ...defaults, ...template };

  // Render a simple HTML (placeholder)
  const html = `<html><head><title>${branding?.name || "Report"}</title></head><body><img src="${branding?.logo_url || ""}" alt="logo"/><h1>${merged.title || "Report"}</h1></body></html>`;

  // Pretend to create a PDF and return a file_key
  const fileKey = `pdf/${orgId || "anon"}/${Date.now()}.pdf`;

  // Schema-aware insert into usage_events
  try {
    if (supabase) {
      const unitCost = body.unit_cost_cents || body.unit_cost || 0;
      const meta = {
        file_key: fileKey,
        request_id: body.request_id || null,
        template: body.template || null,
      };
      await supabase.from("usage_events").insert([
        {
          org_id: orgId,
          user_id: body.user_id || null,
          kind: "pdf_generation",
          unit_cost_cents: unitCost,
          meta,
        },
      ]);
    }
  } catch (e) {
    console.error("usage_events insert error", e);
  }

  return new Response(JSON.stringify({ ok: true, file_key: fileKey, html_preview: html }), {
    status: 200,
  });
}
