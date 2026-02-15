/**
 * ResumeDraftBanner.tsx
 *
 * Displays a friendly banner when an in-progress draft is detected.
 * User can click "Resume" to hydrate the wizard, or "Dismiss" to start fresh.
 */

"use client";

import { Clock, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ResumeDraftBannerProps {
  updatedAt: string; // ISO timestamp
  onResume: () => void;
  onDismiss: () => void;
}

export function ResumeDraftBanner({ updatedAt, onResume, onDismiss }: ResumeDraftBannerProps) {
  const lastUpdated = new Date(updatedAt);
  const timeAgo = getTimeAgo(lastUpdated);

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <Clock className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">Draft in Progress</AlertTitle>
      <AlertDescription className="text-blue-800">
        <p className="mb-3">
          You have an in-progress packet from <strong>{timeAgo}</strong>.
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={onResume} size="sm" className="bg-blue-600 hover:bg-blue-700">
            Resume Draft
          </Button>
          <Button
            onClick={onDismiss}
            size="sm"
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <X className="mr-1 h-3 w-3" />
            Start Fresh
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Helper: Convert ISO timestamp to human-readable relative time
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  // Fallback: show date
  return date.toLocaleDateString();
}
