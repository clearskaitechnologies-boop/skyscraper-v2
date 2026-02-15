// ============================================================================
// AI MARKER COMPONENT
// ============================================================================
// Displays ⚡ badge for AI-generated fields with tooltip

"use client";

import { Check, X,Zap } from "lucide-react";
import React from "react";

interface AIMarkerProps {
  approved: boolean;
  confidence?: number;
  source?: string;
  onApprove?: () => void;
  onReject?: () => void;
}

export function AIMarker({ approved, confidence, source, onApprove, onReject }: AIMarkerProps) {
  if (approved) {
    return (
      <div className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
        <Check className="h-3 w-3" />
        <span>AI Approved</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div className="group relative">
        <div className="flex animate-pulse items-center gap-1 rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
          <Zap className="h-3 w-3" />
          <span>AI Generated</span>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full left-0 z-10 mb-2 hidden w-64 rounded border border-border bg-popover p-3 text-xs text-popover-foreground shadow-lg group-hover:block">
          <p className="mb-1 font-semibold">AI-generated content</p>
          <p className="mb-2">Review and approve to finalize this field.</p>
          {confidence !== undefined && (
            <p className="text-gray-300">Confidence: {Math.round(confidence * 100)}%</p>
          )}
          {source && <p className="text-gray-300">Source: {source}</p>}
        </div>
      </div>

      {/* Quick actions */}
      {onApprove && onReject && (
        <div className="flex items-center gap-1">
          <button
            onClick={onApprove}
            className="rounded bg-green-100 p-1 text-green-700 transition-colors hover:bg-green-200"
            title="Approve"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={onReject}
            className="rounded bg-red-100 p-1 text-red-700 transition-colors hover:bg-red-200"
            title="Reject"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Field wrapper with AI marker
 */
interface AIFieldWrapperProps {
  children: React.ReactNode;
  field: {
    aiGenerated: boolean;
    approved: boolean;
    confidence?: number;
    source?: string;
  };
  onApprove?: () => void;
  onReject?: () => void;
}

export function AIFieldWrapper({ children, field, onApprove, onReject }: AIFieldWrapperProps) {
  if (!field.aiGenerated) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="mb-2">
        <AIMarker
          approved={field.approved}
          confidence={field.confidence}
          source={field.source}
          onApprove={onApprove}
          onReject={onReject}
        />
      </div>
      {children}
    </div>
  );
}
