// Phase 6: Initialize agent scheduler on server boot
import { logger } from "@/lib/logger";
import { scheduleRecurringMissions } from "@/modules/automation/scheduler";

// Initialize scheduled jobs
if (typeof window === "undefined") {
  // Server-side only
  scheduleRecurringMissions().catch((err) => {
    logger.error("Failed to schedule recurring missions:", err);
  });
}
