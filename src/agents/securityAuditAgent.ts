import { z } from "zod";

import { prismaModel } from "@/lib/db/prismaModel";

import { BaseAgent } from "./baseAgent";

export const SecurityAuditInput = z.object({
  orgId: z.string().min(1),
  windowHours: z.number().min(1).max(168).default(24),
});

export const SecurityAuditOutput = z.object({
  orgId: z.string(),
  windowHours: z.number(),
  anomalies: z.array(
    z.object({ type: z.string(), description: z.string(), count: z.number().optional() })
  ),
  suggestions: z.array(z.string()),
  score: z.number().min(0).max(100),
  metrics: z.object({
    totalEvents: z.number(),
    failedLogins: z.number(),
    apiTokenUses: z.number(),
    distinctActors: z.number(),
    highVelocityActors: z.number(),
  }),
});

const Activity = prismaModel<any>(
  "activity_logs",
  "activityLogs",
  "activityLog",
  "claim_activities",
  "claimActivities",
  "ClaimActivity",
  "claimActivity"
);

export class SecurityAuditAgent extends BaseAgent<
  z.infer<typeof SecurityAuditInput>,
  z.infer<typeof SecurityAuditOutput>
> {
  inputSchema = SecurityAuditInput;
  outputSchema = SecurityAuditOutput;
  constructor() {
    super({ name: "security-audit", version: "1.0.0" });
  }
  protected async run(input) {
    const windowStart = new Date(Date.now() - input.windowHours * 3600_000);
    const logs = Activity
      ? await Activity.findMany({
          where: { org_id: input.orgId, created_at: { gte: windowStart } },
          select: { action: true, actor: true, event_type: true, created_at: true, userId: true },
        }).catch(() => [])
      : [];

    let failedLogins = 0;
    let apiTokenUses = 0;
    const actorCounts: Record<string, number> = {};
    for (const l of logs) {
      if (
        /login_failed|auth_failed/i.test(l.action || "") ||
        /login_failed|auth_failed/i.test(l.event_type || "")
      )
        failedLogins++;
      if (
        /api_token|token_auth/i.test(l.action || "") ||
        /api_token|token_auth/i.test(l.event_type || "")
      )
        apiTokenUses++;
      const actor = (l as any).actor || (l as any).user_id || (l as any).userId || "unknown";
      actorCounts[actor] = (actorCounts[actor] || 0) + 1;
    }
    const totalEvents = logs.length;
    const distinctActors = Object.keys(actorCounts).length;
    const highVelocityActors = Object.values(actorCounts).filter(
      (c) => c > Math.max(20, totalEvents * 0.1)
    ).length;

    const anomalies: { type: string; description: string; count?: number }[] = [];
    if (failedLogins > Math.max(5, totalEvents * 0.05))
      anomalies.push({
        type: "failed_logins_spike",
        description: `Elevated failed logins: ${failedLogins}`,
        count: failedLogins,
      });
    if (apiTokenUses > Math.max(50, totalEvents * 0.4))
      anomalies.push({
        type: "api_token_volume",
        description: `High API token usage volume: ${apiTokenUses}`,
        count: apiTokenUses,
      });
    if (highVelocityActors > 0)
      anomalies.push({
        type: "actor_event_burst",
        description: `${highVelocityActors} actors with unusually high event volume`,
        count: highVelocityActors,
      });
    if (distinctActors === 0)
      anomalies.push({ type: "no_activity", description: "No audit activity detected", count: 0 });

    // Score heuristic: start at 100, subtract weighted anomaly impact & failed login ratio
    let score = 100;
    score -= failedLogins * 0.8;
    score -= apiTokenUses * 0.1;
    score -= highVelocityActors * 5;
    score -= anomalies.length * 4;
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    const suggestions: string[] = [];
    if (failedLogins > 0) suggestions.push("Review credential stuffing protections & enforce MFA");
    if (apiTokenUses > Math.max(50, totalEvents * 0.4))
      suggestions.push("Rate-limit or scope API tokens showing high usage");
    if (highVelocityActors > 0) suggestions.push("Investigate actors with anomalous event bursts");
    if (suggestions.length === 0)
      suggestions.push("Maintain current security posture; schedule periodic review");

    return {
      orgId: input.orgId,
      windowHours: input.windowHours,
      anomalies,
      suggestions,
      score: Math.round(score),
      metrics: { totalEvents, failedLogins, apiTokenUses, distinctActors, highVelocityActors },
    };
  }
}
