"use client";

import { AlertTriangle } from "lucide-react";
import React from "react";

import { getMaintenanceMessage, isMaintenanceModeEnabled } from "@/lib/feature-flags";

export default function MaintenanceBanner() {
  const maintenanceMode = isMaintenanceModeEnabled();

  if (!maintenanceMode) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 border-b border-orange-300 bg-orange-100 px-4 py-3 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-900">
            <strong>Maintenance Mode:</strong> {getMaintenanceMessage()}
          </p>
          <p className="mt-0.5 text-xs text-orange-700">
            Write operations are temporarily disabled. You can still view data.
          </p>
        </div>
      </div>
    </div>
  );
}
