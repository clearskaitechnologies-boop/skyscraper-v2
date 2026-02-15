// src/app/(app)/claims/[claimId]/ai/page.tsx
"use client";

import { useParams } from "next/navigation";

import SmartClaimAssistant from "@/components/ai/SmartClaimAssistant";

/**
 * AI ASSISTANT TAB - FUNCTIONAL IMPLEMENTATION
 * This is the ONLY AI chat interface in the claim workspace
 * Uses SmartClaimAssistant component with OpenAI integration
 */
export default function AIPage() {
  const params = useParams();
  const claimIdParam = params?.claimId;
  const claimId = Array.isArray(claimIdParam) ? claimIdParam[0] : claimIdParam;

  if (!claimId) {
    return null;
  }

  return (
    <div className="h-full p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">AI Claim Assistant</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ask questions about this claim, request analysis, or get strategic recommendations.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <SmartClaimAssistant claimId={claimId} />
        </div>
      </div>
    </div>
  );
}
