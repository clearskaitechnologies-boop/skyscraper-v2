import { prismaModel } from "@/lib/db/prismaModel";

import { AgentEvent } from "./types";

const Activity = prismaModel<any>(
  "activity_logs",
  "activityLogs",
  "activityLog",
  "claim_activities",
  "claimActivities",
  "ClaimActivity",
  "claimActivity"
);

export const eventBus = {
  async publish(event: AgentEvent) {
    if (!Activity) return;

    await Activity.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        org_id: "system",
        user_id: "SYSTEM",
        user_name: "SkaiAgent",
        action: event.type,
        job_id: event.jobId,
        mission_id: event.missionId ?? null,
        actor: event.actor,
        event_type: event.type,
        metadata: event.metadata ?? {},
        payload: { message: event.message },
      },
    });
  },
};
