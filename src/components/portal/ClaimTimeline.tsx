/**
 * Enhanced Claim Timeline Component
 * Visual claim progress timeline with document grouping for client portal
 */

"use client";

import { format } from "date-fns";
import { AlertCircle,CheckCircle, Clock, FileText, Image, MessageSquare } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  createdAt: Date;
  visibleToClient: boolean;
}

interface ClaimTimelineProps {
  events: TimelineEvent[];
  claimStatus: string;
}

const getIconForEventType = (type: string) => {
  if (type.includes("document") || type.includes("file")) return FileText;
  if (type.includes("photo") || type.includes("image")) return Image;
  if (type.includes("message") || type.includes("comment")) return MessageSquare;
  if (type.includes("approve") || type.includes("complete")) return CheckCircle;
  if (type.includes("pending") || type.includes("waiting")) return Clock;
  return AlertCircle;
};

const getColorForEventType = (type: string) => {
  if (type.includes("approve") || type.includes("complete")) return "bg-green-500";
  if (type.includes("pending") || type.includes("waiting")) return "bg-yellow-500";
  if (type.includes("message")) return "bg-blue-500";
  return "bg-primary";
};

export default function ClaimTimeline({ events, claimStatus }: ClaimTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-8 text-center shadow-sm">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No Activity Yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Timeline updates will appear here as your claim progresses.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Claim Timeline</h2>
      <p className="mt-1 text-sm text-muted-foreground">Track every update and milestone</p>

      <div className="mt-6 space-y-6">
        {events.map((event, idx) => {
          const Icon = getIconForEventType(event.type);
          const colorClass = getColorForEventType(event.type);
          const isLast = idx === events.length - 1;

          return (
            <div key={event.id} className="relative flex gap-4">
              {/* Timeline line */}
              {!isLast && <div className="absolute left-5 top-10 h-full w-0.5 bg-border" />}

              {/* Icon */}
              <div
                className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{event.title}</p>
                    {event.body && (
                      <p className="mt-1 text-sm text-muted-foreground">{event.body}</p>
                    )}
                  </div>
                  <time className="ml-4 text-xs text-muted-foreground">
                    {format(new Date(event.createdAt), "MMM d, h:mm a")}
                  </time>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status summary */}
      <div className="mt-6 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Current Status:</span>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
              claimStatus === "approved"
                ? "bg-green-100 text-green-800"
                : claimStatus === "in_progress"
                  ? "bg-blue-100 text-blue-800"
                  : claimStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-muted text-foreground"
            }`}
          >
            {claimStatus.replace(/_/g, " ").toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
