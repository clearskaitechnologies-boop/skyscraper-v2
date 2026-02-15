"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  MessageCircle,
  Upload,
  UserPlus,
} from "lucide-react";

type ActivityLogEntry = {
  id: string;
  actionType: string;
  description: string;
  createdAt: Date | string;
  metadata?: Record<string, any>;
};

type ClaimActivityTimelineProps = {
  activities: ActivityLogEntry[];
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  created: <FileText className="h-4 w-4" />,
  status_changed: <AlertCircle className="h-4 w-4" />,
  comment_added: <MessageCircle className="h-4 w-4" />,
  file_uploaded: <Upload className="h-4 w-4" />,
  assigned: <UserPlus className="h-4 w-4" />,
  estimate_updated: <DollarSign className="h-4 w-4" />,
  payment_received: <CheckCircle className="h-4 w-4" />,
  inspection_scheduled: <Calendar className="h-4 w-4" />,
};

const ACTION_COLORS: Record<string, string> = {
  created: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  status_changed: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  comment_added: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  file_uploaded: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  assigned: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  estimate_updated: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  payment_received: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  inspection_scheduled: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
};

export function ClaimActivityTimeline({ activities }: ClaimActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
        <div>
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm font-medium text-foreground">No activity yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Activity will appear here as work progresses on this claim
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const icon = ACTION_ICONS[activity.actionType] || <FileText className="h-4 w-4" />;
        const colorClass =
          ACTION_COLORS[activity.actionType] ||
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

        return (
          <div key={activity.id} className="relative flex gap-4">
            {/* Timeline Line */}
            {index < activities.length - 1 && (
              <div className="absolute left-[19px] top-10 h-full w-0.5 bg-border" />
            )}

            {/* Icon */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}
            >
              {icon}
            </div>

            {/* Content */}
            <div className="flex-1 rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.description}</p>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {activity.metadata.old_value && activity.metadata.new_value && (
                        <p>
                          Changed from{" "}
                          <span className="font-medium">{activity.metadata.old_value}</span> to{" "}
                          <span className="font-medium">{activity.metadata.new_value}</span>
                        </p>
                      )}
                      {activity.metadata.file_url && (
                        <a
                          href={activity.metadata.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View file
                        </a>
                      )}
                      {activity.metadata.amount && (
                        <p className="font-medium">
                          ${(activity.metadata.amount / 100).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <time className="text-xs text-muted-foreground">
                  {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
