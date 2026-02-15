// components/automation/DominusRecommendations.tsx
/**
 * 🔥 RECOMMENDATIONS DASHBOARD
 * AI-powered next action suggestions
 */

"use client";

import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Recommendation {
  id: string;
  recommendationType: string;
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  priority: string;
  actionButton?: string;
  actionEndpoint?: string;
}

interface DominusRecommendationsProps {
  recommendations: Recommendation[];
  onAccept: (recommendationId: string) => void;
  onDismiss: (recommendationId: string) => void;
}

export function DominusRecommendations({
  recommendations,
  onAccept,
  onDismiss,
}: DominusRecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-600">No recommendations at this time</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <div key={rec.id} className="rounded-lg border-2 border-purple-200 bg-purple-50 p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                <h4 className="font-bold text-purple-900">{rec.title}</h4>
                <span className="rounded-full bg-purple-200 px-2 py-1 text-xs font-semibold text-purple-900">
                  {(rec.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-700">{rec.description}</p>

              <p className="mt-2 text-xs italic text-gray-600">💡 Why: {rec.reasoning}</p>

              <div className="mt-4 flex items-center gap-2">
                {rec.actionButton && (
                  <Button
                    size="sm"
                    onClick={() => onAccept(rec.id)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {rec.actionButton}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onDismiss(rec.id)}>
                  <X className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
