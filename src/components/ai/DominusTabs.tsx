/**
 * SkaiPDF Tabs Component
 * 
 * Tabbed interface for viewing different AI insight categories.
 * Summary | Urgency | Job Type | Next Actions | Materials | Flags | Vision | Prep
 * 
 * Phase 25.5 - SkaiPDF UI Components
 */

"use client";

import {
  AlertCircle,
  Briefcase,
  Camera,
  Clipboard,
  FileCode,
  FileSignature,
  FileText,
  Flag,
  Hammer,
  ListChecks,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ClaimWriterPanel } from "./ClaimWriterPanel";
import { DominusInsightCard } from "./DominusInsightCard";
import { DominusPhotoAnalysis } from "./DominusPhotoAnalysis";
import { EstimateExportPanel } from "./EstimateExportPanel";

interface DominusTabsProps {
  leadId?: string;
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

export function DominusTabs({ leadId, aiData, photos }: DominusTabsProps) {
  const summaryData = aiData.aiSummaryJson || {};
  const nextActions = Array.isArray(aiData.aiNextActions) ? aiData.aiNextActions : [];
  const materials = Array.isArray(aiData.aiMaterials) ? aiData.aiMaterials : [];
  const flags = aiData.aiFlags || {};
  const images = Array.isArray(aiData.aiImages) ? aiData.aiImages : [];

  const activeFlags = Object.entries(flags).filter(([, value]) => value === true);

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
        <TabsTrigger value="summary" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span className="hidden sm:inline">Summary</span>
        </TabsTrigger>
        <TabsTrigger value="urgency" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span className="hidden sm:inline">Urgency</span>
        </TabsTrigger>
        <TabsTrigger value="jobtype" className="flex items-center gap-1">
          <Briefcase className="h-3 w-3" />
          <span className="hidden sm:inline">Job Type</span>
        </TabsTrigger>
        <TabsTrigger value="actions" className="flex items-center gap-1">
          <ListChecks className="h-3 w-3" />
          <span className="hidden sm:inline">Actions</span>
          {nextActions.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 min-w-4 p-0 text-[10px]">
              {nextActions.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="materials" className="flex items-center gap-1">
          <Hammer className="h-3 w-3" />
          <span className="hidden sm:inline">Materials</span>
        </TabsTrigger>
        <TabsTrigger value="flags" className="flex items-center gap-1">
          <Flag className="h-3 w-3" />
          <span className="hidden sm:inline">Flags</span>
          {activeFlags.length > 0 && (
            <Badge variant="destructive" className="ml-1 h-4 min-w-4 p-0 text-[10px]">
              {activeFlags.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="vision" className="flex items-center gap-1">
          <Camera className="h-3 w-3" />
          <span className="hidden sm:inline">Vision</span>
        </TabsTrigger>
        <TabsTrigger value="prep" className="flex items-center gap-1">
          <Clipboard className="h-3 w-3" />
          <span className="hidden sm:inline">Prep</span>
        </TabsTrigger>
        <TabsTrigger value="claim" className="flex items-center gap-1">
          <FileSignature className="h-3 w-3" />
          <span className="hidden sm:inline">Claim Writer</span>
        </TabsTrigger>
        <TabsTrigger value="export" className="flex items-center gap-1">
          <FileCode className="h-3 w-3" />
          <span className="hidden sm:inline">Export</span>
        </TabsTrigger>
      </TabsList>

      {/* Summary Tab */}
      <TabsContent value="summary" className="mt-4 space-y-4">
        <DominusInsightCard
          title="AI Summary"
          description="AI-generated overview of this lead"
          icon={FileText}
        >
          <div className="space-y-3">
            {summaryData.overview && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Overview</h4>
                <p className="text-sm text-muted-foreground">{summaryData.overview}</p>
              </div>
            )}

            {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Key Points</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {summaryData.keyPoints.map((point: string, idx: number) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {summaryData.concerns && summaryData.concerns.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Concerns
                </h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {summaryData.concerns.map((concern: string, idx: number) => (
                    <li key={idx}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}

            {!summaryData.overview && aiData.aiSummary && (
              <p className="text-sm text-muted-foreground">{aiData.aiSummary}</p>
            )}
          </div>
        </DominusInsightCard>
      </TabsContent>

      {/* Urgency Tab */}
      <TabsContent value="urgency" className="mt-4">
        <DominusInsightCard
          title="Urgency Analysis"
          description="AI-scored priority level for this lead"
          icon={AlertCircle}
          severity={aiData.aiUrgencyScore || 0}
        >
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{aiData.aiUrgencyScore || 0}</span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  style={{ width: `${aiData.aiUrgencyScore || 0}%` }}
                />
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">Priority Level</h4>
              <Badge
                variant={
                  (aiData.aiUrgencyScore || 0) >= 80
                    ? "destructive"
                    : (aiData.aiUrgencyScore || 0) >= 50
                    ? "default"
                    : "secondary"
                }
              >
                {(aiData.aiUrgencyScore || 0) >= 80
                  ? "High Priority"
                  : (aiData.aiUrgencyScore || 0) >= 50
                  ? "Medium Priority"
                  : "Low Priority"}
              </Badge>
            </div>

            {summaryData.concerns && summaryData.concerns.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Factors Contributing to Urgency</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {summaryData.concerns.map((concern: string, idx: number) => (
                    <li key={idx}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DominusInsightCard>
      </TabsContent>

      {/* Job Type Tab */}
      <TabsContent value="jobtype" className="mt-4">
        <DominusInsightCard
          title="Job Classification"
          description="AI-detected job type and category"
          icon={Briefcase}
        >
          <div className="space-y-4">
            {aiData.aiJobType && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Classified As</h4>
                <Badge variant="outline" className="text-base font-medium capitalize">
                  {aiData.aiJobType.replace(/-/g, " ")}
                </Badge>
              </div>
            )}

            {aiData.aiConfidence && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Confidence</h4>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${aiData.aiConfidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{Math.round(aiData.aiConfidence * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        </DominusInsightCard>
      </TabsContent>

      {/* Next Actions Tab */}
      <TabsContent value="actions" className="mt-4 space-y-3">
        {nextActions.length > 0 ? (
          nextActions.map((action: any, idx: number) => (
            <DominusInsightCard
              key={idx}
              title={action.title}
              description={action.description}
              icon={ListChecks}
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    action.priority === "urgent"
                      ? "destructive"
                      : action.priority === "high"
                      ? "default"
                      : "secondary"
                  }
                >
                  {action.priority}
                </Badge>
                {action.deadline && (
                  <span className="text-xs text-muted-foreground">Due: {action.deadline}</span>
                )}
                {action.category && (
                  <Badge variant="outline" className="text-xs">
                    {action.category}
                  </Badge>
                )}
              </div>
            </DominusInsightCard>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No next actions generated</p>
        )}
      </TabsContent>

      {/* Materials Tab */}
      <TabsContent value="materials" className="mt-4 space-y-3">
        {materials.length > 0 ? (
          <DominusInsightCard
            title="Estimated Materials"
            description="AI-estimated materials needed for this job"
            icon={Hammer}
          >
            <div className="space-y-2">
              {materials.map((material: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{material.material}</div>
                    {material.notes && (
                      <div className="text-xs text-muted-foreground">{material.notes}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {material.quantity} {material.unit}
                    </div>
                    {material.confidence && (
                      <div className="text-xs text-muted-foreground">
                        {Math.round(material.confidence * 100)}% confident
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DominusInsightCard>
        ) : (
          <p className="text-sm text-muted-foreground">No material estimates available</p>
        )}
      </TabsContent>

      {/* Flags Tab */}
      <TabsContent value="flags" className="mt-4">
        <DominusInsightCard
          title="Safety & Risk Flags"
          description="AI-detected concerns and safety indicators"
          icon={Flag}
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {Object.entries(flags).map(([flag, value]) => (
              <Badge
                key={flag}
                variant={value ? "destructive" : "outline"}
                className="justify-center capitalize"
              >
                {flag}
              </Badge>
            ))}
          </div>
          {activeFlags.length === 0 && (
            <p className="text-sm text-muted-foreground">No safety concerns detected</p>
          )}
        </DominusInsightCard>
      </TabsContent>

      {/* Vision Tab */}
      <TabsContent value="vision" className="mt-4">
        {images.length > 0 ? (
          <DominusPhotoAnalysis images={images} photos={photos} />
        ) : (
          <DominusInsightCard
            title="Vision Analysis"
            description="No photos analyzed yet"
            icon={Camera}
          >
            <p className="text-sm text-muted-foreground">
              Upload photos and run AI analysis to see damage detection results
            </p>
          </DominusInsightCard>
        )}
      </TabsContent>

      {/* Prep Tab */}
      <TabsContent value="prep" className="mt-4">
        <DominusInsightCard
          title="Inspection Preparation"
          description="Recommended checklist for field inspection"
          icon={Clipboard}
        >
          <p className="text-sm text-muted-foreground">
            Inspection prep checklist will be displayed here after AI analysis includes inspection preparation data.
          </p>
        </DominusInsightCard>
      </TabsContent>

      {/* Claim Writer Tab */}
      <TabsContent value="claim" className="mt-4">
        {leadId ? (
          <ClaimWriterPanel leadId={leadId} />
        ) : (
          <DominusInsightCard
            title="Claim Writer"
            description="AI-powered insurance claim generation"
            icon={FileSignature}
          >
            <p className="text-sm text-muted-foreground">
              Lead ID is required to generate claims. Please refresh the page or contact support.
            </p>
          </DominusInsightCard>
        )}
      </TabsContent>

      {/* Estimate Export Tab */}
      <TabsContent value="export" className="mt-4">
        {leadId ? (
          <EstimateExportPanel leadId={leadId} />
        ) : (
          <DominusInsightCard
            title="Estimate Export"
            description="Export to Xactimate and Symbility"
            icon={FileCode}
          >
            <p className="text-sm text-muted-foreground">
              Lead ID is required to export estimates. Please refresh the page or contact support.
            </p>
          </DominusInsightCard>
        )}
      </TabsContent>
    </Tabs>
  );
}
