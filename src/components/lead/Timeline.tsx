/**
 * PHASE 46: LEAD TIMELINE COMPONENT
 * 
 * Visual timeline showing all events in lead lifecycle.
 * Auto-updates when automation events trigger.
 */

"use client";

import { AlertTriangle,CheckCircle2, Circle, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";

interface TimelineEvent {
  id: string;
  stageName: string;
  eventType: string;
  triggered: boolean;
  triggeredAt: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface TimelineProps {
  leadId: string;
  refreshInterval?: number; // ms
}

export function Timeline({ leadId, refreshInterval = 10000 }: TimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/leads/${leadId}/timeline`);
      if (!response.ok) throw new Error("Failed to fetch timeline");
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Timeline fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, refreshInterval);
    return () => clearInterval(interval);
  }, [leadId, refreshInterval]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lead Timeline</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-border" />

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const isCompleted = event.triggered;
            const isLast = index === events.length - 1;

            return (
              <div key={event.id} className="relative pl-10">
                {/* Icon */}
                <div
                  className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : "border-2 border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>

                {/* Content */}
                <div
                  className={`rounded-lg border p-4 ${
                    isCompleted ? "border-emerald-200 bg-emerald-50" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">{event.stageName}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {getEventTypeLabel(event.eventType)}
                      </p>
                      {event.triggeredAt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(event.triggeredAt).toLocaleString()}
                        </p>
                      )}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="mt-2 space-y-1 text-xs">
                          {renderMetadata(event.metadata)}
                        </div>
                      )}
                    </div>
                    {!isCompleted && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    lead_created: "Lead created in system",
    stage_change: "Pipeline stage updated",
    ai_analysis: "AI analysis completed",
    video_created: "Presentation video generated",
    packet_generated: "Adjuster packet created",
    denial_created: "Denial response generated",
    storm_report: "Storm impact report created",
    build_scheduled: "Build work scheduled",
    approval: "Claim approved by carrier",
    build_complete: "Build work completed",
  };
  return labels[eventType] || eventType;
}

function renderMetadata(metadata: Record<string, any>): React.ReactNode {
  const entries = Object.entries(metadata).slice(0, 3); // Show first 3 items
  return entries.map(([key, value]) => (
    <div key={key} className="flex gap-2">
      <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
      <span className="text-muted-foreground">
        {typeof value === "object" ? JSON.stringify(value).slice(0, 50) : String(value)}
      </span>
    </div>
  ));
}
