import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// ITEM 16: Auto-generate timeline events from job status changes
export async function createTimelineEvent(data: {
  retailJobId: string;
  eventType: string;
  eventDate: Date;
  description: string;
  status?: string;
}) {
  try {
    const event = await prisma.retailJobTimeline.create({
      data: {
        retailJobId: data.retailJobId,
        eventType: data.eventType,
        eventDate: data.eventDate,
        description: data.description,
        status: data.status || "completed",
      },
    });

    logger.debug(`[TIMELINE] Created event: ${data.eventType} for job ${data.retailJobId}`);
    return event;
  } catch (error) {
    logger.error("Timeline event creation error:", error);
    throw error;
  }
}

// Helper: Create timeline event when retail job status changes
export async function onRetailJobStatusChange(
  retailJobId: string,
  oldStatus: string,
  newStatus: string
) {
  const statusMessages: Record<string, string> = {
    draft: "Job created as draft",
    pending: "Job submitted for approval",
    approved: "Job approved, ready to start",
    in_progress: "Work has begun",
    completed: "Job completed successfully",
    cancelled: "Job was cancelled",
  };

  await createTimelineEvent({
    retailJobId,
    eventType: "status_change",
    eventDate: new Date(),
    description: statusMessages[newStatus] || `Status changed to ${newStatus}`,
    status: "completed",
  });
}

// Helper: Create timeline event when payment is received
export async function onPaymentReceived(retailJobId: string, amount: number, paymentType: string) {
  await createTimelineEvent({
    retailJobId,
    eventType: "payment",
    eventDate: new Date(),
    description: `Payment received: $${amount.toFixed(2)} (${paymentType})`,
    status: "completed",
  });
}

// Helper: Create timeline event when materials ordered
export async function onMaterialsOrdered(retailJobId: string, materialCount: number) {
  await createTimelineEvent({
    retailJobId,
    eventType: "materials",
    eventDate: new Date(),
    description: `Ordered ${materialCount} material(s)`,
    status: "completed",
  });
}
