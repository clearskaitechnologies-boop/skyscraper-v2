"use client";

import { AlertCircle, CheckCircle, Clock, FileText, MessageSquare, Upload } from "lucide-react";

interface TimelineEventProps {
  id: string;
  type:
    | "created"
    | "updated"
    | "status_change"
    | "document_added"
    | "message_sent"
    | "photo_uploaded"
    | "custom";
  title: string;
  description?: string;
  user?: string;
  timestamp: Date;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function TimelineEvent({
  type,
  title,
  description,
  user,
  timestamp,
  isFirst,
  isLast,
}: TimelineEventProps) {
  const getIcon = () => {
    switch (type) {
      case "created":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "status_change":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case "document_added":
        return <FileText className="h-4 w-4 text-blue-400" />;
      case "message_sent":
        return <MessageSquare className="h-4 w-4 text-purple-400" />;
      case "photo_uploaded":
        return <Upload className="h-4 w-4 text-cyan-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500 dark:text-white/50" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "created":
        return "border-green-500/30 bg-green-500/10";
      case "status_change":
        return "border-yellow-500/30 bg-yellow-500/10";
      case "document_added":
        return "border-blue-500/30 bg-blue-500/10";
      case "message_sent":
        return "border-purple-500/30 bg-purple-500/10";
      case "photo_uploaded":
        return "border-cyan-500/30 bg-cyan-500/10";
      default:
        return "border-slate-200 bg-white dark:border-white/20 dark:bg-white/5";
    }
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 h-full w-px bg-slate-200 dark:bg-white/10" />
      )}

      {/* Icon */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border backdrop-blur-xl ${getColor()}`}
      >
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white/90">{title}</p>
              {description && (
                <p className="mt-1 text-xs text-slate-600 dark:text-white/60">{description}</p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-white/40">
                {user && <span>{user}</span>}
                <span>•</span>
                <span>{timestamp.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
