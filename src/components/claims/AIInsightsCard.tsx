/**
 * AI Insights Card
 *
 * Displays actionable AI-generated insights and recommendations
 * for a specific claim. Shows what the AI "sees" and suggests next steps.
 */

"use client";

import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Progress } from "@/components/ui/progress";

interface AIInsightsCardProps {
  claimId: string;
  analysis?: any;
}

interface Insight {
  type: "warning" | "success" | "info" | "action";
  title: string;
  description: string;
  confidence: number;
  icon: React.ReactNode;
}

export function AIInsightsCard({ claimId, analysis }: AIInsightsCardProps) {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  if (!analysis || !analysis.history?.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="text-center">
          <Sparkles className="mx-auto mb-3 h-12 w-12 text-slate-400" />
          <h3 className="mb-2 font-semibold text-slate-900">No AI Insights Yet</h3>
          <p className="text-sm text-slate-600">
            Run AI analyses to generate insights and recommendations
          </p>
        </div>
      </div>
    );
  }

  // Generate insights from analysis results
  const insights: Insight[] = [];

  // Triage insights
  if (analysis.triage?.output) {
    const triage = analysis.triage.output;

    if (triage.complexity === "high") {
      insights.push({
        type: "warning",
        title: "Complex Claim Detected",
        description: "This claim requires senior adjuster review and multi-trade coordination.",
        confidence: analysis.triage.confidence,
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    }

    if (triage.estimatedValue > 50000) {
      insights.push({
        type: "info",
        title: "High-Value Claim",
        description: `Estimated total loss: $${(triage.estimatedValue / 100).toLocaleString()}. Consider involving PA early.`,
        confidence: analysis.triage.confidence,
        icon: <DollarSign className="h-5 w-5" />,
      });
    }

    if (triage.suggestedWorkflow) {
      insights.push({
        type: "action",
        title: "Suggested Workflow",
        description: `Recommended path: ${triage.suggestedWorkflow.join(" → ")}`,
        confidence: analysis.triage.confidence,
        icon: <ChevronRight className="h-5 w-5" />,
      });
    }
  }

  // Damage assessment insights
  if (analysis.damageAssessment?.output) {
    const damage = analysis.damageAssessment.output;

    if (damage.hailDetected) {
      insights.push({
        type: "warning",
        title: "Hail Damage Detected",
        description: `${damage.hailCount || "Multiple"} impact points identified. Severity: ${damage.severity || "medium"}`,
        confidence: analysis.damageAssessment.confidence,
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    }

    if (damage.ageRelatedDamage) {
      insights.push({
        type: "info",
        title: "Age-Related Wear Detected",
        description: "Pre-existing wear may affect coverage. Document clearly for carrier.",
        confidence: analysis.damageAssessment.confidence,
        icon: <Clock className="h-5 w-5" />,
      });
    }

    if (damage.recommendedActions) {
      insights.push({
        type: "action",
        title: "Recommended Actions",
        description: damage.recommendedActions.slice(0, 2).join(". "),
        confidence: analysis.damageAssessment.confidence,
        icon: <FileText className="h-5 w-5" />,
      });
    }
  }

  // Policy optimization insights
  if (analysis.policyOptimization?.output) {
    const policy = analysis.policyOptimization.output;

    if (policy.timelineSuggestion) {
      insights.push({
        type: "success",
        title: "Timeline Optimization",
        description: `Recommended completion: ${policy.timelineSuggestion.days} days. ${policy.timelineSuggestion.reasoning}`,
        confidence: analysis.policyOptimization.confidence,
        icon: <Clock className="h-5 w-5" />,
      });
    }

    if (policy.resourceAllocation) {
      insights.push({
        type: "action",
        title: "Resource Allocation",
        description: `Optimal team: ${policy.resourceAllocation.join(", ")}`,
        confidence: analysis.policyOptimization.confidence,
        icon: <Users className="h-5 w-5" />,
      });
    }
  }

  const getInsightColor = (type: Insight["type"]) => {
    switch (type) {
      case "warning":
        return "border-yellow-500 bg-yellow-50 text-yellow-800";
      case "success":
        return "border-green-500 bg-green-50 text-green-800";
      case "info":
        return "border-blue-500 bg-blue-50 text-blue-800";
      case "action":
        return "border-purple-500 bg-purple-50 text-purple-800";
    }
  };

  const getInsightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "info":
        return <TrendingUp className="h-5 w-5" />;
      case "action":
        return <ChevronRight className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI-Generated Insights
        </h3>
        <span className="text-sm text-slate-600">
          {insights.length} insight{insights.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <button
            key={index}
            onClick={() => setSelectedInsight(insight)}
            className={`w-full rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${getInsightColor(insight.type)} `}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
              <div className="flex-1">
                <div className="mb-1 font-semibold">{insight.title}</div>
                <div className="text-sm opacity-90">{insight.description}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="text-xs opacity-75">
                    Confidence: {Math.round(insight.confidence * 100)}%
                  </div>
                  <div className="flex-1">
                    <Progress
                      className="h-1.5 bg-white/30"
                      indicatorClassName="bg-current opacity-60"
                      value={Math.round(insight.confidence * 100)}
                      aria-label="Insight confidence"
                    />
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-600">
            No actionable insights yet. Run more analyses to generate recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
