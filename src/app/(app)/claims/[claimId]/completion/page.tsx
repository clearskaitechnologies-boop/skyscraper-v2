"use client";

import { useState } from "react";
import { CompletionChecklist } from "@/components/completion/CompletionChecklist";
import { CompletionUploadZone } from "@/components/completion/CompletionUploadZone";
import { CompletionStatusPanel } from "@/components/completion/CompletionStatusPanel";
import { DepreciationPackagePanel } from "@/components/depreciation/DepreciationPackagePanel";

interface ClaimCompletionPageProps {
  params: { claim_id: string };
}

export default function ClaimCompletionPage({ params }: ClaimCompletionPageProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          🏁 Completion Center
          <span className="text-sm font-normal px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
            PHASE 13.1 — DEPRECIATION BUILDER
          </span>
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Mark the build complete and prepare for AI-powered depreciation processing.
        </p>
      </div>

      {/* Status Panel */}
      <div className="mb-6">
        <CompletionStatusPanel key={refreshKey} claimId={params.claim_id} />
      </div>

      {/* Checklist */}
      <div className="mb-6">
        <CompletionChecklist claimId={params.claim_id} onStatusChange={handleRefresh} />
      </div>

      {/* Upload Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">📄 Completion Documents</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload signed completion forms, final invoices, or walkthrough documentation.
          </p>
          <CompletionUploadZone
            claimId={params.claim_id}
            type="document"
            onUploadComplete={handleRefresh}
          />
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">📸 Completion Photos</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload final build photos. AI will analyze these for timeline and supplement detection.
          </p>
          <CompletionUploadZone
            claimId={params.claim_id}
            type="photo"
            onUploadComplete={handleRefresh}
          />
        </div>
      </div>

      {/* Depreciation Package Section */}
      <div className="mt-8">
        <DepreciationPackagePanel claimId={params.claim_id} onPackageGenerated={handleRefresh} />
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-blue-900 mb-3">
          🚀 What Happens After Completion?
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>AI Timeline Builder:</strong> Sorts photos by phase (tear-off, mid-build,
              completion) and creates a chronological build narrative
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Supplement Detection:</strong> Compares photos to carrier estimate and
              auto-generates supplement for unpaid items
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Contractor Statement:</strong> Auto-generates professional completion
              statement for adjuster review
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Final Invoice:</strong> Calculates depreciation owed, supplements, tax, and
              generates carrier-ready invoice
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Depreciation Packet:</strong> Combines everything into one comprehensive PDF
              with one-click email to adjuster
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
