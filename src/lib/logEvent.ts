import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Minimal Json type used by some clients (supabase expects Json)
export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export interface LogEventPayload {
  tenant_id?: string;
  report_id?: string;
  risk?: number;
  metadata?: Record<string, unknown> | null;
}

/**
 * Sanitize context objects by removing sensitive data
 */
function sanitizeContext(ctx: unknown): Record<string, unknown> | null {
  try {
    if (!ctx || typeof ctx !== "object") return null;
    const safe = JSON.parse(JSON.stringify(ctx));
    const scrub = (o: Record<string, unknown> | null) => {
      if (!o || typeof o !== "object") return;
      const sensitiveKeys = [
        "password",
        "authorization",
        "token",
        "access_token",
        "id_token",
        "refresh_token",
        "api_key",
        "secret",
      ];
      for (const k of Object.keys(o)) {
        const v = (o as Record<string, unknown>)[k];
        if (sensitiveKeys.includes(k.toLowerCase()))
          (o as Record<string, unknown>)[k] = "[redacted]" as unknown;
        else if (k.toLowerCase() === "cookie")
          (o as Record<string, unknown>)[k] = "[redacted]" as unknown;
        else if (v && typeof v === "object") scrub(v as Record<string, unknown>);
      }
    };
    scrub(safe as Record<string, unknown>);
    return safe as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Log application events for AI monitoring and governance
 * Examples: 'status-incident-create', 'auth.role-change', 'report.share', 'payment.completed'
 */
export async function logEvent(event_type: string, payload: LogEventPayload = {}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("app_logs").insert({
      event_type,
      userId: user.id,
      tenant_id: payload.tenant_id || null,
      report_id: payload.report_id || null,
      risk: payload.risk || 0,
      // local shim: cast sanitized object to Json via unknown to avoid `any`
      metadata: (sanitizeContext(payload.metadata) || null) as unknown as Json,
    });
  } catch (error) {
    logger.error("Failed to log event:", error);
  }
}
