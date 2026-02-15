"use client";

/**
 * Export Error Note
 * Shows helpful error messages and hints when export fails
 */

import { AlertCircle, Info } from "lucide-react";
import React from "react";

import type { ExportErrorCode } from "@/modules/reports/types";

interface ExportErrorNoteProps {
  hint: string;
  code?: ExportErrorCode;
  error?: string;
}

const errorIcons: Record<ExportErrorCode, React.ElementType> = {
  MISSING_BRANDING: AlertCircle,
  EMPTY_SECTION: Info,
  AI_UNAPPROVED: AlertCircle,
  DATA_PROVIDER_EMPTY: Info,
  UNSUPPORTED_FORMAT: AlertCircle,
  UNKNOWN: AlertCircle,
};

const errorColors: Record<ExportErrorCode, string> = {
  MISSING_BRANDING: "bg-red-50 border-red-200 text-red-800",
  EMPTY_SECTION: "bg-blue-50 border-blue-200 text-blue-800",
  AI_UNAPPROVED: "bg-yellow-50 border-yellow-200 text-yellow-800",
  DATA_PROVIDER_EMPTY: "bg-blue-50 border-blue-200 text-blue-800",
  UNSUPPORTED_FORMAT: "bg-red-50 border-red-200 text-red-800",
  UNKNOWN: "bg-gray-50 border-gray-200 text-gray-800",
};

export function ExportErrorNote({ hint, code = "UNKNOWN", error }: ExportErrorNoteProps) {
  const Icon = errorIcons[code];
  const colorClass = errorColors[code];

  return (
    <div className={`rounded-lg border p-4 ${colorClass}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="mb-1 text-sm font-semibold">Export Failed</p>
          {error && <p className="mb-2 text-sm">{error}</p>}
          <p className="text-sm opacity-90">{hint}</p>
        </div>
      </div>
    </div>
  );
}
