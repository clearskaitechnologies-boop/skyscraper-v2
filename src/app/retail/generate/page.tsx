"use client";

import React from "react";

import RetailWizard from "@/features/retail/wizard/RetailWizard";
import { isFeatureEnabled } from "@/lib/env";

/**
 * Retail Packet Generator Page
 *
 * Mounts the 8-step RetailWizard component
 *
 * Feature Flag: FEATURE_RETAIL_WIZARD (defaults to true in dev/preview)
 */

function FeatureDisabledNotice() {
  return (
    <div className="mx-auto mt-16 max-w-2xl rounded-lg border border-yellow-200 bg-yellow-50 p-6">
      <h2 className="mb-2 text-xl font-semibold text-yellow-900">Feature Unavailable</h2>
      <p className="text-sm text-yellow-800">
        The <span className="font-medium">Retail Wizard</span> feature is currently disabled.
        Contact your administrator to enable it.
      </p>
      <div className="mt-4 text-sm text-yellow-700">
        <p className="font-medium">To enable:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Set <code className="rounded bg-yellow-100 px-1">FEATURE_RETAIL_WIZARD=true</code> in
            environment variables
          </li>
          <li>Or remove the flag to use default (enabled in dev/preview)</li>
        </ul>
      </div>
    </div>
  );
}

export default function RetailGeneratePage() {
  // Check feature flag
  const wizardEnabled = isFeatureEnabled("RETAIL_WIZARD");

  if (!wizardEnabled) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <FeatureDisabledNotice />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Retail Packet Builder</h1>
          <p className="mt-2 text-sm text-gray-600">
            Step-by-step wizard to create professional roofing proposals. Auto-save will activate
            once the database and API layer are connected.
          </p>
        </div>

        {/* Wizard Component */}
        <RetailWizard />
      </div>
    </main>
  );
}
