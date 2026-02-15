/**
 * Document Generation Actions Component
 *
 * Provides "Generate Supplement" and "Generate Rebuttal" buttons
 * with status polling and navigation to Reports History
 */

"use client";

import { AlertCircle, FileCheck, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DocumentGenerationActionsProps {
  claimId: string;
  carrier: string | null;
}

export function DocumentGenerationActions({ claimId, carrier }: DocumentGenerationActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSupplement = () => {
    setError(null);
    // Navigate to claim-scoped supplement page
    router.push(`/claims/${claimId}/supplement`);
  };

  const handleGenerateRebuttal = () => {
    if (!carrier) {
      setError("Please assign a carrier to this claim before generating a rebuttal");
      return;
    }

    setError(null);
    // Navigate to rebuttal tool page with claimId
    router.push(`/ai/tools/rebuttal?claimId=${claimId}`);
  };

  return (
    <div className="space-y-4">
      {/* Info Text */}
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Generate intelligent documents powered by AI analysis and carrier-specific strategies.
      </p>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Generate Supplement Button */}
        <button
          onClick={handleGenerateSupplement}
          className="flex items-center justify-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900"
        >
          <FileText className="h-4 w-4" />
          Generate Supplement
        </button>

        {/* Generate Rebuttal Button */}
        <button
          onClick={handleGenerateRebuttal}
          disabled={!carrier}
          className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
        >
          <FileCheck className="h-4 w-4" />
          Generate Rebuttal
        </button>
      </div>

      {/* Helper Text */}
      <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-start gap-2">
          <span className="font-medium text-orange-600 dark:text-orange-400">Supplement:</span>
          <span>
            Compares adjuster vs contractor scope, identifies variances, generates justification
            narrative
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-medium text-red-600 dark:text-red-400">Rebuttal:</span>
          <span>
            {carrier
              ? `Generates ${carrier}-specific rebuttal letter with carrier-aware tone and emphasis`
              : "Requires carrier assignment - generates carrier-specific rebuttal letter"}
          </span>
        </div>
      </div>
    </div>
  );
}
