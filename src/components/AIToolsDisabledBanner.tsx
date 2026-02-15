"use client";

import { Bot, X } from "lucide-react";
import React from "react";

import { areAIToolsEnabled } from "@/lib/feature-flags";

export default function AIToolsDisabledBanner() {
  const [dismissed, setDismissed] = React.useState(false);
  const aiEnabled = areAIToolsEnabled();

  if (aiEnabled || dismissed) {
    return null;
  }

  return (
    <div className="relative rounded-lg border border-purple-300 bg-purple-100 px-4 py-3 shadow-sm">
      <div className="flex items-start gap-3">
        <Bot className="h-5 w-5 flex-shrink-0 text-purple-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-900">
            <strong>AI Tools Temporarily Disabled</strong>
          </p>
          <p className="mt-0.5 text-xs text-purple-700">
            AI generation features are currently unavailable. Please check back soon or contact
            support.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 rounded-full p-1 text-purple-600 hover:bg-purple-200"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
