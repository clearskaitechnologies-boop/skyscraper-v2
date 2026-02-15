/**
 * Authentication and Authorization Utilities for Edge Functions
 *
 * Provides secure context creation with user auth and role checking
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizeError } from "./security.ts";

export interface SecurityContext {
  supabase: SupabaseClient;
  user: { id: string; email?: string } | null;
  isOwner: boolean;
  isAdmin: boolean;
  ip: string;
}

/**
 * Extract IP address from request
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

/**
 * Create security context with user authentication and role checking
 */
export async function createSecurityContext(req: Request): Promise<SecurityContext> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const ip = getClientIp(req);
  const authHeader = req.headers.get("Authorization");

  let user: { id: string; email?: string } | null = null;
  let isOwner = false;
  let isAdmin = false;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    try {
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser(token);

      if (!error && authUser) {
        user = { id: authUser.id, email: authUser.email };

        // Check roles using has_role() function
        const { data: ownerCheck } = await supabase.rpc("has_role", {
          _user_id: authUser.id,
          _role: "owner",
        });

        const { data: adminCheck } = await supabase.rpc("has_role", {
          _user_id: authUser.id,
          _role: "admin",
        });

        isOwner = !!ownerCheck;
        isAdmin = !!adminCheck;
      }
    } catch (e) {
      console.error("Auth verification error:", sanitizeError(e));
    }
  }

  return { supabase, user, isOwner, isAdmin, ip };
}

/**
 * Require authenticated user - returns error response if not authenticated
 */
export function requireAuth(ctx: SecurityContext): Response | null {
  if (!ctx.user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

/**
 * Require owner or admin role - returns error response if not authorized
 */
export function requireOwnerOrAdmin(ctx: SecurityContext): Response | null {
  if (!ctx.isOwner && !ctx.isAdmin) {
    return new Response(JSON.stringify({ error: "Owner or admin role required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

/**
 * Verify user owns a specific lead
 */
export async function verifyLeadOwnership(
  ctx: SecurityContext,
  leadId: string
): Promise<Response | null> {
  const { data: lead, error } = await ctx.supabase
    .from("leads")
    .select("id, user_id")
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    return new Response(JSON.stringify({ error: "Lead not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Owner/admin can access any lead
  if (ctx.isOwner || ctx.isAdmin) {
    return null;
  }

  // Regular users can only access their own leads
  if (lead.user_id !== ctx.user?.id) {
    console.warn(
      `Unauthorized lead access attempt: user ${ctx.user?.id} tried to access lead ${leadId}`
    );
    return new Response(JSON.stringify({ error: "Unauthorized access to lead" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}

/**
 * Verify user owns a specific report
 */
export async function verifyReportOwnership(
  ctx: SecurityContext,
  reportId: string
): Promise<Response | null> {
  const { data: report, error } = await ctx.supabase
    .from("reports")
    .select("id, created_by")
    .eq("id", reportId)
    .single();

  if (error || !report) {
    return new Response(JSON.stringify({ error: "Report not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Owner/admin can access any report
  if (ctx.isOwner || ctx.isAdmin) {
    return null;
  }

  // Regular users can only access their own reports
  if (report.created_by !== ctx.user?.id) {
    console.warn(
      `Unauthorized report access attempt: user ${ctx.user?.id} tried to access report ${reportId}`
    );
    return new Response(JSON.stringify({ error: "Unauthorized access to report" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}
