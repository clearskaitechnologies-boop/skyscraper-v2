/**
 * SkaiPDF Intelligence Panel
 * 
 * Main container for displaying AI-enhanced lead insights.
 * Shows summary, urgency, job type, next actions, materials, flags, vision, and prep.
 * 
 * Phase 25.5 - SkaiPDF UI Components
 */

"use client";

import { AlertTriangle, Brain, Loader2, Sparkles } from "lucide-react";
import { logger } from "@/lib/logger";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DominusTabs } from "./DominusTabs";

export interface DominusPanelProps {
  leadId: string;
  aiData: {
    aiSummary?: string | null;
    aiSummaryJson?: any;
    aiUrgencyScore?: number | null;
    aiNextActions?: any;
    aiJobType?: string | null;
    aiMaterials?: any;
    aiFlags?: any;
    aiImages?: any;
    aiConfidence?: number | null;
  };
  photos?: any[];
}

export function DominusPanel({ leadId, aiData, photos }: DominusPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [localAiData, setLocalAiData] = useState(aiData);

  // Check if AI analysis has been run
  const hasAnalysis = !!(
    localAiData.aiSummaryJson ||
    localAiData.aiUrgencyScore ||
    localAiData.aiNextActions
  );

  // Handle AI analysis trigger
  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/ai/skai/analyze-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          toast.error("Insufficient Tokens", {
            description: data.message || "Your organization needs more AI tokens to run this analysis.",
          });
        } else {
          toast.error("Analysis Failed", {
            description: data.message || "Failed to analyze lead. Please try again.",
          });
        }
        return;
      }

      // Update local state with new AI data
      const updatedLead = data.lead;
      setLocalAiData({
        aiSummary: updatedLead.aiSummary,
        aiSummaryJson: updatedLead.aiSummaryJson,
        aiUrgencyScore: updatedLead.aiUrgencyScore,
        aiNextActions: updatedLead.aiNextActions,
        aiJobType: updatedLead.aiJobType,
        aiMaterials: updatedLead.aiMaterials,
        aiFlags: updatedLead.aiFlags,
        aiImages: updatedLead.aiImages,
        aiConfidence: updatedLead.aiConfidence,
      });

      toast.success("AI Analysis Complete", {
        description: `Lead analyzed successfully with ${data.analysis.confidence.toFixed(0)}% confidence.`,
      });

      // Refresh the page to show updated data
      window.location.reload();

    } catch (error) {
      logger.error("Error analyzing lead:", error);
      toast.error("Network Error", {
        description: "Failed to connect to AI service. Please check your connection.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">SkaiPDF Intelligence</CardTitle>
              <CardDescription>
                {hasAnalysis
                  ? "AI-powered lead analysis and recommendations"
                  : "Run AI analysis to unlock intelligent insights"}
              </CardDescription>
            </div>
          </div>

          {localAiData.aiConfidence && (
            <Badge variant="outline" className="ml-auto">
              <Sparkles className="mr-1 h-3 w-3" />
              {Math.round(localAiData.aiConfidence * 100)}% Confidence
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!hasAnalysis ? (
          // No AI analysis yet - show call to action
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="rounded-full bg-purple-100 p-6 dark:bg-purple-900/30">
              <Brain className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">AI Analysis Not Yet Run</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Run SkaiPDF to analyze this lead and get intelligent insights including urgency
                scoring, job classification, damage detection, and recommended next actions.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Lead...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Run SkaiPDF Analysis
                </>
              )}
            </Button>
            {photos && photos.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Will analyze {photos.length} photo{photos.length > 1 ? "s" : ""} for damage detection
              </p>
            )}
          </div>
        ) : (
          // AI analysis exists - show tabs with insights
          <div className="space-y-4">
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {localAiData.aiUrgencyScore !== null && localAiData.aiUrgencyScore !== undefined && (
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs font-medium text-muted-foreground">Urgency Score</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{localAiData.aiUrgencyScore}</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                  {localAiData.aiUrgencyScore >= 80 && (
                    <Badge variant="destructive" className="mt-2">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      High Priority
                    </Badge>
                  )}
                </div>
              )}

              {localAiData.aiJobType && (
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs font-medium text-muted-foreground">Job Type</div>
                  <div className="mt-1 text-sm font-semibold capitalize">
                    {localAiData.aiJobType.replace(/-/g, " ")}
                  </div>
                </div>
              )}

              {localAiData.aiNextActions && (
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs font-medium text-muted-foreground">Next Actions</div>
                  <div className="mt-1 text-2xl font-bold">
                    {Array.isArray(localAiData.aiNextActions) ? localAiData.aiNextActions.length : 0}
                  </div>
                </div>
              )}

              {localAiData.aiImages && (
                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs font-medium text-muted-foreground">Photos Analyzed</div>
                  <div className="mt-1 text-2xl font-bold">
                    {Array.isArray(localAiData.aiImages) ? localAiData.aiImages.length : 0}
                  </div>
                </div>
              )}
            </div>

            {/* Re-analyze button */}
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Re-analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-3 w-3" />
                    Re-Analyze Lead
                  </>
                )}
              </Button>
            </div>

            {/* Tabs with detailed insights */}
            <DominusTabs leadId={leadId} aiData={localAiData} photos={photos} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
