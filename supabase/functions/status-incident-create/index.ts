import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SECURITY: Rate limiting to prevent abuse
// Tracks incident creation attempts per user (10 per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
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

/**
 * SECURITY DOCUMENTATION: Role-Based Access Control
 *
 * This endpoint requires JWT authentication (verify_jwt=true in config.toml).
 * Authorization is enforced through RLS policies that check has_role() for admin/owner.
 *
 * Role Elevation Process:
 * 1. New users automatically receive 'viewer' role via handle_new_user_role trigger
 * 2. First user should be manually promoted to 'owner' via direct database update:
 *    UPDATE user_roles SET role = 'owner' WHERE user_id = '<first_user_id>';
 * 3. Owners can promote other users through a role management interface
 * 4. Only users with 'admin' or 'owner' roles can create incidents
 *
 * Security Features:
 * - JWT verification ensures authenticated requests only
 * - RLS policies prevent privilege escalation
 * - Rate limiting prevents abuse (10 incidents per hour per user)
 * - Audit logging tracks all incident creation attempts
 */

const incidentSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(200, "Title too long"),
  severity: z.enum(["minor", "major", "critical"], {
    errorMap: () => ({ message: "Invalid severity" }),
  }),
  description: z.string().max(2000, "Description too long").optional(),
  components: z.array(z.string()).max(20, "Too many components").optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get authenticated user for rate limiting and audit logging
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // SECURITY: Rate limiting check
    if (!checkRateLimit(user.id)) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Maximum 10 incidents per hour." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429,
        }
      );
    }

    const body = await req.json();
    const validated = incidentSchema.parse(body);

    // Insert incident (RLS policies enforce admin/owner role check)
    const { data: incident, error } = await supabase
      .from("status_incidents")
      .insert({
        title: validated.title,
        severity: validated.severity,
        description: validated.description || null,
        components: validated.components || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create incident:", error);
      throw error;
    }

    // SECURITY: Audit logging
    const auditResult = await supabase.from("events").insert({
      name: "incident_created",
      user_id: user.id,
      props: {
        incident_id: incident.id,
        severity: validated.severity,
        title: validated.title,
        components: validated.components || [],
      },
    });
    if (auditResult.error) {
      console.error("Audit log failed:", auditResult.error);
    }

    // AI Governance: Log event for monitoring
    const riskScore =
      validated.severity === "critical" ? 0.8 : validated.severity === "major" ? 0.5 : 0.2;
    await supabase.from("app_logs").insert({
      event_type: "status-incident-create",
      user_id: user.id,
      risk: riskScore,
      metadata: {
        severity: validated.severity,
        titleLength: validated.title.length,
        hasComponents: (validated.components || []).length > 0,
      },
    });

    console.log(`Incident created by user ${user.id}: ${incident.id}`);

    return new Response(JSON.stringify({ ok: true, incident_id: incident.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating incident:", error);

    if (error.name === "ZodError") {
      return new Response(JSON.stringify({ error: "Validation failed", details: error.errors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
