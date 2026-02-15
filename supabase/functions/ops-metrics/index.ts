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

    // Rate limiting: 100 requests per hour per admin
    const rateCheck = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 3600000, // 1 hour
      keyPrefix: "ops-metrics",
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

    // Fetch event data
    const { data: rows, error } = await sb
      .from("v_ops_events")
      .select("*")
      .gte("day", from)
      .lte("day", to);

    if (error) {
      const sanitized = sanitizeError(error, "ops-metrics");
      return errorResponse(sanitized, corsHeaders);
    }

    // Calculate KPIs
    const leadCount = rows?.filter((r) => r.kind === "lead").length || 0;
    const demoCount = rows?.filter((r) => r.kind === "demo").length || 0;
    const reportCount = rows?.filter((r) => r.kind === "report").length || 0;
    const approvalCount = rows?.filter((r) => r.kind === "approval").length || 0;

    // Group by day for time series
    const dayMap = new Map<string, any>();
    for (const row of rows || []) {
      const day = row.day;
      if (!dayMap.has(day)) {
        dayMap.set(day, { day, leads: 0, demos: 0, reports: 0, approvals: 0 });
      }
      const dayData = dayMap.get(day);
      if (row.kind === "lead") dayData.leads++;
      if (row.kind === "demo") dayData.demos++;
      if (row.kind === "report") dayData.reports++;
      if (row.kind === "approval") dayData.approvals++;
    }

    const series = Array.from(dayMap.values()).sort((a, b) => a.day.localeCompare(b.day));

    // Fetch recent records
    const [leadsRes, demosRes, reportsRes, approvalsRes] = await Promise.all([
      sb
        .from("leads")
        .select("id, client_name, client_email, client_phone, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      sb
        .from("demo_requests")
        .select("id, name, email, company, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      sb
        .from("reports")
        .select("id, report_name, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      sb
        .from("report_price_approvals")
        .select("id, report_id, approver_type, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return json({
      kpis: {
        leads: leadCount,
        demos: demoCount,
        reports: reportCount,
        approvals: approvalCount,
      },
      series,
      recent: {
        leads: leadsRes.data || [],
        demos: demosRes.data || [],
        reports: reportsRes.data || [],
        approvals: approvalsRes.data || [],
      },
    });
  } catch (e: any) {
    const sanitized = sanitizeError(e, "ops-metrics");
    return errorResponse(sanitized, corsHeaders);
  }
});
