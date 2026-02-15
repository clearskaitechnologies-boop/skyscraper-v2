import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  sanitizeError,
  errorResponse,
  checkRateLimit,
  validateDateRange,
} from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse(
        { code: "E1001", message: "Authentication required", status: 401 },
        corsHeaders
      );
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const sb = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is admin
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      return errorResponse(
        { code: "E1001", message: "Authentication required", status: 401 },
        corsHeaders
      );
    }

    // Rate limiting: 50 requests per hour (expensive aggregations)
    const rateCheck = checkRateLimit(user.id, {
      maxRequests: 50,
      windowMs: 3600000,
      keyPrefix: "ops-funnel",
    });
    if (!rateCheck.allowed) {
      return errorResponse(
        { code: "E1005", message: "Too many requests, please try again later", status: 429 },
        corsHeaders
      );
    }

    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", user.id);

    const isAdmin = roles?.some((r) => r.role === "admin" || r.role === "owner");
    if (!isAdmin) {
      return errorResponse({ code: "E1002", message: "Access denied", status: 403 }, corsHeaders);
    }

    // Validate date parameters
    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let from: string, to: string;
    try {
      ({ from, to } = validateDateRange(fromParam, toParam));
    } catch (e: any) {
      return errorResponse({ code: "E1004", message: "Invalid request", status: 400 }, corsHeaders);
    }

    // Fetch funnel data
    const { data: rows, error } = await sb
      .from("v_funnel_leads")
      .select("*")
      .gte("lead_at", from)
      .lte("lead_at", to);

    if (error) {
      const sanitized = sanitizeError(error, "ops-funnel");
      return errorResponse(sanitized, corsHeaders);
    }

    const N = rows?.length || 0;
    const step1 = N;
    const step2 = rows?.filter((r) => r.did_demo).length || 0;
    const step3 = rows?.filter((r) => r.did_report).length || 0;
    const step4 = rows?.filter((r) => r.did_approval).length || 0;

    const conv12 = step1 ? step2 / step1 : 0;
    const conv23 = step2 ? step3 / step2 : 0;
    const conv34 = step3 ? step4 / step3 : 0;
    const conv14 = step1 ? step4 / step1 : 0;

    // Cohorts by lead week
    const cohorts = new Map<string, any>();
    for (const r of rows || []) {
      const week = new Date(r.lead_at);
      const w = new Date(week);
      w.setDate(week.getDate() - ((week.getDay() + 6) % 7));
      const key = w.toISOString().slice(0, 10);
      if (!cohorts.has(key)) {
        cohorts.set(key, { week: key, leads: 0, demos: 0, reports: 0, approvals: 0 });
      }
      const c = cohorts.get(key)!;
      c.leads++;
      if (r.did_demo) c.demos++;
      if (r.did_report) c.reports++;
      if (r.did_approval) c.approvals++;
    }
    const cohortRows = Array.from(cohorts.values()).sort((a, b) => a.week.localeCompare(b.week));

    // Per-rep breakdown
    const reps = new Map<string, any>();
    for (const r of rows || []) {
      const key = r.owner_id || "unassigned";
      if (!reps.has(key)) {
        reps.set(key, { owner_id: key, leads: 0, demos: 0, reports: 0, approvals: 0, conv: 0 });
      }
      const p = reps.get(key);
      p.leads++;
      if (r.did_demo) p.demos++;
      if (r.did_report) p.reports++;
      if (r.did_approval) p.approvals++;
    }
    const repRows = Array.from(reps.values())
      .map((r) => ({
        ...r,
        conv: r.leads ? r.approvals / r.leads : 0,
      }))
      .sort((a, b) => b.conv - a.conv);

    // Stage latency (median days)
    function days(a: Date, b: Date) {
      return (a.getTime() - b.getTime()) / 86400000;
    }
    const lat = {
      lead_to_demo: [] as number[],
      demo_to_report: [] as number[],
      report_to_approval: [] as number[],
    };
    for (const r of rows || []) {
      if (r.demo_at) lat.lead_to_demo.push(days(new Date(r.demo_at), new Date(r.lead_at)));
      if (r.demo_at && r.report_at)
        lat.demo_to_report.push(days(new Date(r.report_at), new Date(r.demo_at)));
      if (r.report_at && r.approval_at)
        lat.report_to_approval.push(days(new Date(r.approval_at), new Date(r.report_at)));
    }
    function median(arr: number[]) {
      if (!arr.length) return 0;
      const s = [...arr].sort((a, b) => a - b);
      const m = Math.floor(s.length / 2);
      return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    }
    const latency = {
      lead_to_demo: median(lat.lead_to_demo),
      demo_to_report: median(lat.demo_to_report),
      report_to_approval: median(lat.report_to_approval),
    };

    return json({
      totals: { step1, step2, step3, step4, conv12, conv23, conv34, conv14 },
      cohort: cohortRows,
      reps: repRows,
      latency,
    });
  } catch (e: any) {
    const sanitized = sanitizeError(e, "ops-funnel");
    return errorResponse(sanitized, corsHeaders);
  }
});
