// Phase 6: Initialize agent scheduler on server boot
import { scheduleRecurringMissions } from "@/modules/automation/scheduler";

// Initialize scheduled jobs
if (typeof window === "undefined") {
  // Server-side only
  scheduleRecurringMissions().catch((err) => {
    console.error("Failed to schedule recurring missions:", err);
  });
}
