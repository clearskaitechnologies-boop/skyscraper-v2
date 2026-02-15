// src/app/(app)/claims/[claimId]/_components/ClaimAIColumn.tsx
"use client";

import { AlertCircle, CheckCircle, Clock, Sparkles } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import SectionCard from "./SectionCard";

/**
 * RIGHT SIDEBAR - NO AI WIDGET
 * AI Assistant is ONLY in the AI tab now
 * This sidebar shows recommendations, activity, and quick actions
 */
export default function ClaimAIColumn() {
  const params = useParams();
  const router = useRouter();
  const claimId = params?.claimId as string;

  return (
    <div className="h-full space-y-6 overflow-y-auto p-6">
      <SectionCard title="AI Recommendations">
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm text-slate-900">Missing damage photo of rear elevation</p>
              <button
                onClick={() => router.push(`/claims/${claimId}/photos`)}
                className="mt-2 text-xs text-yellow-700 hover:text-yellow-900"
              >
                Add Photo →
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm text-slate-900">
                Carrier response suggests negotiation opportunity
              </p>
              <button
                onClick={() => router.push(`/claims/${claimId}/ai`)}
                className="mt-2 text-xs text-blue-700 hover:text-blue-900"
              >
                View Details →
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
            <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm text-slate-900">Documentation is complete</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Recent Activity */}
      <SectionCard title="Recent Activity">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Clock className="mt-1 h-4 w-4 text-slate-400" />
            <div className="flex-1">
              <p className="text-sm text-slate-700">Claim created</p>
              <p className="text-xs text-slate-500">Recently</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Quick Actions */}
      <SectionCard title="Quick Actions">
        <div className="space-y-2">
          <button
            onClick={() => router.push(`/claims/${claimId}/supplement`)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            Generate Supplement
          </button>
          <button
            onClick={() => router.push(`/claims/${claimId}/weather`)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            Weather Verification
          </button>
          <button
            onClick={() => router.push(`/claims/${claimId}/documents`)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            Analyze Documents
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
