// import { prismaModel } from "@/lib/db/prismaModel";

// import { AutomationEvent } from "./eventTypes";

// type Listener = (e: AutomationEvent) => Promise<void> | void;
// const listeners: Listener[] = [];

// const Activity = prismaModel<any>(
//   "activity_logs",
//   "activityLogs",
//   "activityLog",
//   "claim_activities",
//   "claimActivities",
//   "ClaimActivity",
//   "claimActivity"
// );

// export async function publish(event: AutomationEvent) {
//   // Write to database via audit_logs
//   if (Activity) {
//     await Activity.create({
//       data: {
//         action: event.type,
//         description: `Automation: ${event.type}`,
//         orgId: event.orgId || "system",
//         userId: null,
//         metadata: {
//           actor: event.actor,
//           eventType: event.type,
//           missionId: event.missionId || null,
//           jobId: event.jobId || null,
//           payload: event.metadata || {},
//         },
//       },
//     }).catch((err: unknown) => console.error("Failed to log event:", err));
//   }

//   // Notify in-memory listeners
//   for (const l of listeners) {
//     Promise.resolve(l(event)).catch(() => {});
//   }
// }

// export function subscribe(handler: Listener) {
//   listeners.push(handler);
//   return () => {
//     const i = listeners.indexOf(handler);
//     if (i >= 0) listeners.splice(i, 1);
//   };
// }
