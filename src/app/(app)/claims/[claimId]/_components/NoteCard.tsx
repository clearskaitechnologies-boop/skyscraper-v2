"use client";

import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";

interface NoteCardProps {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt?: Date;
  visibleToClient: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string, visible: boolean) => void;
}

export default function NoteCard({
  id,
  content,
  author,
  createdAt,
  updatedAt,
  visibleToClient,
  onEdit,
  onDelete,
  onToggleVisibility,
}: NoteCardProps) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl dark:hover:border-white/20">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900 dark:text-white/90">{author}</span>
            {visibleToClient ? (
              <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                <Eye className="h-3 w-3" />
                Client Visible
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/10 dark:text-white/50">
                <EyeOff className="h-3 w-3" />
                Team Only
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
            {createdAt.toLocaleString()}
            {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
              <span className="ml-2">(edited {updatedAt.toLocaleString()})</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onToggleVisibility && (
            <button
              onClick={() => onToggleVisibility(id, !visibleToClient)}
              className="rounded-lg bg-slate-100 p-1.5 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20"
              title={visibleToClient ? "Hide from client" : "Show to client"}
            >
              {visibleToClient ? (
                <EyeOff className="h-4 w-4 text-slate-600 dark:text-white/70" />
              ) : (
                <Eye className="h-4 w-4 text-slate-600 dark:text-white/70" />
              )}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="rounded-lg bg-slate-100 p-1.5 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20"
              title="Edit note"
            >
              <Edit className="h-4 w-4 text-slate-600 dark:text-white/70" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="rounded-lg bg-red-500/20 p-1.5 transition-colors hover:bg-red-500/30"
              title="Delete note"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-white/80">{content}</p>
    </div>
  );
}
