"use client";

import { CheckCircle, Clock, Edit, Mail, Phone, Trash2 } from "lucide-react";

interface TradeCardProps {
  id: string;
  tradeName: string;
  category: "roofing" | "gutters" | "siding" | "drywall" | "painting" | "flooring" | "other";
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: "pending" | "scheduled" | "in_progress" | "completed";
  estimatedCost?: number;
  notes?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TradeCard({
  id,
  tradeName,
  category,
  contactName,
  contactPhone,
  contactEmail,
  status,
  estimatedCost,
  notes,
  onEdit,
  onDelete,
}: TradeCardProps) {
  const getCategoryColor = () => {
    switch (category) {
      case "roofing":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "gutters":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "siding":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "drywall":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "painting":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "flooring":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-white/70 dark:border-white/20";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        );
      case "scheduled":
        return (
          <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-400">
            Scheduled
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-white/50">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl dark:hover:border-white/20">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white/90">{tradeName}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getCategoryColor()}`}
            >
              {category.toUpperCase()}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="rounded-lg bg-slate-100 p-1.5 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20"
              title="Edit trade"
            >
              <Edit className="h-4 w-4 text-slate-600 dark:text-white/70" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="rounded-lg bg-red-500/20 p-1.5 transition-colors hover:bg-red-500/30"
              title="Delete trade"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Contact Info */}
      {(contactName || contactPhone || contactEmail) && (
        <div className="mb-3 space-y-1">
          {contactName && (
            <p className="text-xs text-slate-600 dark:text-white/70">{contactName}</p>
          )}
          <div className="flex items-center gap-3">
            {contactPhone && (
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <Phone className="h-3 w-3" />
                {contactPhone}
              </a>
            )}
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <Mail className="h-3 w-3" />
                {contactEmail}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Estimated Cost */}
      {estimatedCost && (
        <div className="mb-2">
          <p className="mb-0.5 text-xs text-slate-500 dark:text-white/50">Estimated Cost</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white/90">
            ${estimatedCost.toLocaleString()}
          </p>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-white/60">{notes}</p>
      )}
    </div>
  );
}
