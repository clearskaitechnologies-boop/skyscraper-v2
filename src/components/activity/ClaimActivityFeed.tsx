"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertCircle,CheckCircle, Clock, FileText, MessageSquare, Upload } from "lucide-react";
import { useEffect, useState } from "react";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

interface ClaimActivityFeedProps {
  claimId: string;
}

const activityIcons: Record<string, React.ReactNode> = {
  claim_created: <Clock className="h-4 w-4" />,
  timeline_update: <Clock className="h-4 w-4" />,
  document_uploaded: <Upload className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  approval: <CheckCircle className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  claim_created: "bg-blue-100 text-blue-600",
  timeline_update: "bg-slate-100 text-slate-600",
  document_uploaded: "bg-green-100 text-green-600",
  message: "bg-purple-100 text-purple-600",
  approval: "bg-amber-100 text-amber-600",
};

export function ClaimActivityFeed({ claimId }: ClaimActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch(`/api/activity/claim/${claimId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch activity");
        }
        const data = await res.json();
        setActivities(data.activities || []);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
        setError("Failed to load activity");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [claimId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded bg-slate-100" />
        <div className="h-16 animate-pulse rounded bg-slate-100" />
        <div className="h-16 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-4 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Clock className="mx-auto mb-2 h-12 w-12 opacity-50" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity, index) => {
        const icon = activityIcons[activity.type] || <FileText className="h-4 w-4" />;
        const colorClass = activityColors[activity.type] || "bg-slate-100 text-slate-600";

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded border bg-card p-3 transition-colors hover:bg-accent"
          >
            <div className={`rounded-full p-2 ${colorClass} flex-shrink-0`}>{icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="truncate text-sm text-muted-foreground">{activity.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
            {index === 0 && (
              <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                Latest
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
