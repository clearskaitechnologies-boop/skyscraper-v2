import { logger } from "@/lib/logger";

/**
 * TASK 112: WEBSOCKETS
 *
 * Real-time WebSocket server with rooms, broadcasting, and connection management.
 */

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export interface WebSocketClient {
  id: string;
  userId: string;
  organizationId: string;
  rooms: Set<string>;
  lastSeen: Date;
}

/**
 * WebSocket connection manager
 */
export class WebSocketManager {
  private clients: Map<string, WebSocketClient> = new Map();
  private rooms: Map<string, Set<string>> = new Map();

  /**
   * Add client
   */
  addClient(clientId: string, client: WebSocketClient): void {
    this.clients.set(clientId, client);
  }

  /**
   * Remove client
   */
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      // Leave all rooms
      client.rooms.forEach((room) => {
        this.leaveRoom(clientId, room);
      });
      this.clients.delete(clientId);
    }
  }

  /**
   * Get client
   */
  getClient(clientId: string): WebSocketClient | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Join room
   */
  joinRoom(clientId: string, room: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.rooms.add(room);

      if (!this.rooms.has(room)) {
        this.rooms.set(room, new Set());
      }
      this.rooms.get(room)!.add(clientId);
    }
  }

  /**
   * Leave room
   */
  leaveRoom(clientId: string, room: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.rooms.delete(room);

      const roomClients = this.rooms.get(room);
      if (roomClients) {
        roomClients.delete(clientId);
        if (roomClients.size === 0) {
          this.rooms.delete(room);
        }
      }
    }
  }

  /**
   * Broadcast to room
   */
  broadcastToRoom(room: string, message: WebSocketMessage, excludeClientId?: string): void {
    const roomClients = this.rooms.get(room);
    if (roomClients) {
      roomClients.forEach((clientId) => {
        if (clientId !== excludeClientId) {
          this.sendToClient(clientId, message);
        }
      });
    }
  }

  /**
   * Send to client
   */
  sendToClient(clientId: string, message: WebSocketMessage): void {
    // Implementation would send via actual WebSocket connection
    logger.debug(`Sending to ${clientId}:`, message);
  }

  /**
   * Broadcast to organization
   */
  broadcastToOrganization(organizationId: string, message: WebSocketMessage): void {
    this.clients.forEach((client, clientId) => {
      if (client.orgId === organizationId) {
        this.sendToClient(clientId, message);
      }
    });
  }

  /**
   * Get room members
   */
  getRoomMembers(room: string): string[] {
    const roomClients = this.rooms.get(room);
    return roomClients ? Array.from(roomClients) : [];
  }

  /**
   * Get client rooms
   */
  getClientRooms(clientId: string): string[] {
    const client = this.clients.get(clientId);
    return client ? Array.from(client.rooms) : [];
  }

  /**
   * Get online users in organization
   */
  getOnlineUsers(organizationId: string): string[] {
    const userIds: string[] = [];
    this.clients.forEach((client) => {
      if (client.orgId === organizationId) {
        userIds.push(client.userId);
      }
    });
    return [...new Set(userIds)];
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    for (const client of this.clients.values()) {
      if (client.userId === userId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.clients.size;
  }

  /**
   * Get room count
   */
  getRoomCount(): number {
    return this.rooms.size;
  }

  /**
   * Cleanup inactive connections
   */
  cleanupInactive(timeoutMinutes: number = 30): void {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    const toRemove: string[] = [];

    this.clients.forEach((client, clientId) => {
      if (client.lastSeen < cutoff) {
        toRemove.push(clientId);
      }
    });

    toRemove.forEach((clientId) => {
      this.removeClient(clientId);
    });
  }
}

// Global WebSocket manager instance
export const wsManager = new WebSocketManager();

/**
 * Handle WebSocket message
 */
export async function handleWebSocketMessage(
  clientId: string,
  message: WebSocketMessage
): Promise<void> {
  const client = wsManager.getClient(clientId);
  if (!client) return;

  // Update last seen
  client.lastSeen = new Date();

  switch (message.type) {
    case "join_room":
      wsManager.joinRoom(clientId, message.payload.room);
      break;

    case "leave_room":
      wsManager.leaveRoom(clientId, message.payload.room);
      break;

    case "broadcast":
      if (message.payload.room) {
        wsManager.broadcastToRoom(
          message.payload.room,
          {
            type: "message",
            payload: message.payload.data,
            timestamp: Date.now(),
          },
          clientId
        );
      }
      break;

    case "ping":
      wsManager.sendToClient(clientId, {
        type: "pong",
        payload: {},
        timestamp: Date.now(),
      });
      break;
  }
}

/**
 * Broadcast claim update
 */
export function broadcastClaimUpdate(claimId: string, data: any): void {
  wsManager.broadcastToRoom(`claim:${claimId}`, {
    type: "claim_updated",
    payload: data,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast job update
 */
export function broadcastJobUpdate(jobId: string, data: any): void {
  wsManager.broadcastToRoom(`job:${jobId}`, {
    type: "job_updated",
    payload: data,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast task update
 */
export function broadcastTaskUpdate(taskId: string, data: any): void {
  wsManager.broadcastToRoom(`task:${taskId}`, {
    type: "task_updated",
    payload: data,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast user activity
 */
export function broadcastUserActivity(organizationId: string, activity: any): void {
  wsManager.broadcastToOrganization(organizationId, {
    type: "activity",
    payload: activity,
    timestamp: Date.now(),
  });
}

/**
 * Get WebSocket statistics
 */
export function getWebSocketStats(): {
  connections: number;
  rooms: number;
  onlineUsers: number;
} {
  return {
    connections: wsManager.getConnectionCount(),
    rooms: wsManager.getRoomCount(),
    onlineUsers: 0, // Calculate unique users
  };
}
