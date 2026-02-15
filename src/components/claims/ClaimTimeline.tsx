"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Upload,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  body?: string;
  createdAt: string;
  createdById?: string;
  visibleToClient: boolean;
}

interface ClaimTimelineProps {
  claimId: string;
  orgId?: string;
}

const EVENT_ICONS: Record<string, any> = {
  photo_uploaded: Upload,
  ai_damage_ran: Zap,
  weather_report_generated: Zap,
  document_generated: FileText,
  note: MessageSquare,
  status_change: CheckCircle2,
  default: Clock,
};

const EVENT_COLORS: Record<string, string> = {
  photo_uploaded: "bg-blue-100 text-blue-600",
  ai_damage_ran: "bg-purple-100 text-purple-600",
  weather_report_generated: "bg-indigo-100 text-indigo-600",
  document_generated: "bg-green-100 text-green-600",
  note: "bg-amber-100 text-amber-600",
  status_change: "bg-emerald-100 text-emerald-600",
  default: "bg-slate-100 text-slate-600",
};

export default function ClaimTimeline({ claimId, orgId }: ClaimTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [claimId]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/claims/${claimId}/timeline`);
      if (!res.ok) throw new Error("Failed to load timeline");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err: any) {
      console.error("Timeline fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex animate-pulse gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-red-600" />
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          onClick={fetchEvents}
          className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-4 text-sm font-medium text-slate-600">No events yet</p>
        <p className="mt-1 text-xs text-slate-500">
          As you work this claim, key actions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Timeline line */}
      <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-slate-200" />

      {events.map((event, index) => {
        const Icon = EVENT_ICONS[event.type] || EVENT_ICONS.default;
        const colorClass = EVENT_COLORS[event.type] || EVENT_COLORS.default;

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Icon */}
            <div
              className={`z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{event.title}</h4>
                    {event.body && <p className="mt-1 text-sm text-slate-600">{event.body}</p>}
                  </div>
                  <time className="flex-shrink-0 text-xs text-slate-500">
                    {formatDistanceToNow(new Date(event.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
