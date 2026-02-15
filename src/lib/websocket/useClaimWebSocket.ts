"use client";

/**
 * WebSocket Client Hook
 *
 * Usage:
 * const { connected, events } = useClaimWebSocket(claimId);
 *
 * // Listen for events:
 * useEffect(() => {
 *   if (events.timeline) {
 *     // Handle new timeline event
 *   }
 * }, [events.timeline]);
 */

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import { APP_URL } from "@/lib/env";

interface ClaimEvents {
  timeline?: any;
  note?: any;
  document?: any;
  photo?: any;
  claimUpdate?: any;
}

export function useClaimWebSocket(claimId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<ClaimEvents>({});

  useEffect(() => {
    if (!claimId) return;

    // Initialize socket connection
    const socketIO = io(APP_URL, {
      transports: ["websocket", "polling"],
    });

    socketIO.on("connect", () => {
      console.log("[WebSocket] Connected");
      setConnected(true);
      socketIO.emit("join:claim", claimId);
    });

    socketIO.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setConnected(false);
    });

    // Listen for claim-specific events
    socketIO.on("timeline:new", (data: any) => {
      console.log("[WebSocket] New timeline event:", data);
      setEvents((prev) => ({ ...prev, timeline: data }));
    });

    socketIO.on("note:new", (data: any) => {
      console.log("[WebSocket] New note:", data);
      setEvents((prev) => ({ ...prev, note: data }));
    });

    socketIO.on("document:new", (data: any) => {
      console.log("[WebSocket] New document:", data);
      setEvents((prev) => ({ ...prev, document: data }));
    });

    socketIO.on("photo:new", (data: any) => {
      console.log("[WebSocket] New photo:", data);
      setEvents((prev) => ({ ...prev, photo: data }));
    });

    socketIO.on("claim:updated", (data: any) => {
      console.log("[WebSocket] Claim updated:", data);
      setEvents((prev) => ({ ...prev, claimUpdate: data }));
    });

    setSocket(socketIO);

    return () => {
      console.log("[WebSocket] Cleaning up");
      if (claimId) {
        socketIO.emit("leave:claim", claimId);
      }
      socketIO.disconnect();
    };
  }, [claimId]);

  return { socket, connected, events };
}
