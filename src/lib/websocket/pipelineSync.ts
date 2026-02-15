/**
 * Real-time Pipeline Synchronization
 *
 * WebSocket integration for all pipelines (Claims, Leads, Retail, Financed)
 * Live updates for status changes, messages, assignments
 */

export type PipelineType = "CLAIMS" | "LEADS" | "RETAIL" | "FINANCED";

export type UpdateType =
  | "STATUS_CHANGE"
  | "ASSIGNMENT"
  | "NEW_MESSAGE"
  | "NEW_DOCUMENT"
  | "NEW_NOTE"
  | "PAYMENT_RECEIVED"
  | "MILESTONE_REACHED"
  | "USER_JOINED"
  | "USER_LEFT";

export interface PipelineUpdate {
  type: UpdateType;
  pipeline: PipelineType;
  itemId: string;
  orgId: string;
  userId?: string;
  timestamp: Date;
  data: Record<string, any>;
}

/**
 * WebSocket connection manager (singleton)
 */
class WebSocketManager {
  private connections: Map<string, Set<any>> = new Map();

  /**
   * Subscribe to pipeline updates
   */
  subscribe(orgId: string, pipeline: PipelineType, connection: any): void {
    const key = `${orgId}:${pipeline}`;

    if (!this.connections.has(key)) {
      this.connections.set(key, new Set());
    }

    this.connections.get(key)!.add(connection);
    console.log(`🔌 Subscribed to ${key}`);
  }

  /**
   * Unsubscribe from pipeline updates
   */
  unsubscribe(orgId: string, pipeline: PipelineType, connection: any): void {
    const key = `${orgId}:${pipeline}`;
    const subs = this.connections.get(key);

    if (subs) {
      subs.delete(connection);

      if (subs.size === 0) {
        this.connections.delete(key);
      }
    }

    console.log(`🔌 Unsubscribed from ${key}`);
  }

  /**
   * Broadcast update to all subscribers
   */
  broadcast(orgId: string, pipeline: PipelineType, update: PipelineUpdate): void {
    const key = `${orgId}:${pipeline}`;
    const subs = this.connections.get(key);

    if (!subs || subs.size === 0) {
      console.log(`📡 No subscribers for ${key}`);
      return;
    }

    console.log(`📡 Broadcasting to ${subs.size} subscribers on ${key}`);

    const message = JSON.stringify(update);

    for (const connection of subs) {
      try {
        if (connection.readyState === 1) {
          // OPEN
          connection.send(message);
        }
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
        subs.delete(connection);
      }
    }
  }

  /**
   * Get subscriber count
   */
  getSubscriberCount(orgId: string, pipeline: PipelineType): number {
    const key = `${orgId}:${pipeline}`;
    return this.connections.get(key)?.size || 0;
  }
}

export const wsManager = new WebSocketManager();

/**
 * Notify status change
 */
export async function notifyStatusChange(
  orgId: string,
  pipeline: PipelineType,
  itemId: string,
  oldStatus: string,
  newStatus: string,
  userId?: string
): Promise<void> {
  const update: PipelineUpdate = {
    type: "STATUS_CHANGE",
    pipeline,
    itemId,
    orgId,
    userId,
    timestamp: new Date(),
    data: {
      oldStatus,
      newStatus,
    },
  };

  wsManager.broadcast(orgId, pipeline, update);

  // Also persist to activity feed
  await recordActivity(update);
}

/**
 * Notify assignment change
 */
export async function notifyAssignment(
  orgId: string,
  pipeline: PipelineType,
  itemId: string,
  assignedTo: string,
  assignedBy: string
): Promise<void> {
  const update: PipelineUpdate = {
    type: "ASSIGNMENT",
    pipeline,
    itemId,
    orgId,
    userId: assignedBy,
    timestamp: new Date(),
    data: {
      assignedTo,
      assignedBy,
    },
  };

  wsManager.broadcast(orgId, pipeline, update);
  await recordActivity(update);
}

/**
 * Notify new message
 */
export async function notifyNewMessage(
  orgId: string,
  pipeline: PipelineType,
  itemId: string,
  messageId: string,
  senderId: string,
  preview: string
): Promise<void> {
  const update: PipelineUpdate = {
    type: "NEW_MESSAGE",
    pipeline,
    itemId,
    orgId,
    userId: senderId,
    timestamp: new Date(),
    data: {
      messageId,
      senderId,
      preview,
    },
  };

  wsManager.broadcast(orgId, pipeline, update);
  await recordActivity(update);
}

/**
 * Notify new document
 */
export async function notifyNewDocument(
  orgId: string,
  pipeline: PipelineType,
  itemId: string,
  documentId: string,
  documentName: string,
  uploadedBy: string
): Promise<void> {
  const update: PipelineUpdate = {
    type: "NEW_DOCUMENT",
    pipeline,
    itemId,
    orgId,
    userId: uploadedBy,
    timestamp: new Date(),
    data: {
      documentId,
      documentName,
      uploadedBy,
    },
  };

  wsManager.broadcast(orgId, pipeline, update);
  await recordActivity(update);
}

/**
 * Notify milestone reached
 */
export async function notifyMilestone(
  orgId: string,
  pipeline: PipelineType,
  itemId: string,
  milestone: string,
  userId?: string
): Promise<void> {
  const update: PipelineUpdate = {
    type: "MILESTONE_REACHED",
    pipeline,
    itemId,
    orgId,
    userId,
    timestamp: new Date(),
    data: {
      milestone,
    },
  };

  wsManager.broadcast(orgId, pipeline, update);
  await recordActivity(update);
}

/**
 * Notify user joined/left (presence)
 */
export async function notifyPresence(
  orgId: string,
  pipeline: PipelineType,
  itemId: string,
  userId: string,
  action: "JOINED" | "LEFT"
): Promise<void> {
  const update: PipelineUpdate = {
    type: action === "JOINED" ? "USER_JOINED" : "USER_LEFT",
    pipeline,
    itemId,
    orgId,
    userId,
    timestamp: new Date(),
    data: {
      action,
    },
  };

  wsManager.broadcast(orgId, pipeline, update);
  // Don't record presence in activity feed (too noisy)
}

/**
 * Record activity to feed (persistent)
 */
async function recordActivity(update: PipelineUpdate): Promise<void> {
  try {
    const { default: prisma } = await import("@/lib/prisma");

    await prisma.activityFeed
      .create({
        data: {
          orgId: update.orgId,
          type: update.type,
          pipeline: update.pipeline,
          itemId: update.itemId,
          userId: update.userId,
          data: update.data,
        },
      })
      .catch(() => {
        // Graceful fallback if table doesn't exist
      });
  } catch (error) {
    console.error("Failed to record activity:", error);
  }
}

/**
 * Get real-time subscriber stats
 */
export function getSubscriberStats(orgId: string): Record<PipelineType, number> {
  return {
    CLAIMS: wsManager.getSubscriberCount(orgId, "CLAIMS"),
    LEADS: wsManager.getSubscriberCount(orgId, "LEADS"),
    RETAIL: wsManager.getSubscriberCount(orgId, "RETAIL"),
    FINANCED: wsManager.getSubscriberCount(orgId, "FINANCED"),
  };
}
