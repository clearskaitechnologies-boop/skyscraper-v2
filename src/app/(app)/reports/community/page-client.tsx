"use client";

/**
 * Community Reports Page (Client Component)
 * UNIFIED: Single-home reports + Batch Proposals
 * Batch Proposals are now a mode of Community Reports
 */

import { Briefcase, CheckCircle2, CloudHail, FileText, Home, Plus, Wind, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BatchJobsList } from "@/components/batch-proposals/BatchJobsList";
import { BatchProposalWizard } from "@/components/batch-proposals/BatchProposalWizard";
import { PricingTable } from "@/components/batch-proposals/PricingTable";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { PageSectionCard } from "@/components/layout/PageSectionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMMUNITY_REPORTS } from "@/config/communityReports";

export default function CommunityReportsPage() {
  const searchParams = useSearchParams();
  const [generating, setGenerating] = useState<string | null>(null);
  const [showBatchWizard, setShowBatchWizard] = useState(false);
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");

  // Read tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "batch") {
      setActiveTab("batch");
    }
  }, [searchParams]);

  async function generateReport(sku: string) {
    try {
      setGenerating(sku);
      const res = await fetch("/api/reports/community/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Report generated! ${data.message}`);
        if (data.artifactUrl) {
          window.open(data.artifactUrl, "_blank");
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to generate report");
    } finally {
      setGenerating(null);
    }
  }

  return (
    <PageContainer>
      <PageHero
        section="reports"
        title="Community Reports"
        description="Single-home professional reports + Neighborhood-scale batch proposals"
      />

      {/* Mode Selector */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "single" | "batch")}
        className="mb-8"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Single Reports
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Batch Proposals
          </TabsTrigger>
        </TabsList>

        {/* SINGLE REPORTS MODE */}
        <TabsContent value="single" className="space-y-8">
          {/* Reports Grid */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
              Available Reports
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {COMMUNITY_REPORTS.map((report) => (
                <Card key={report.id} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {report.type === "HAIL" ? (
                          <CloudHail className="h-5 w-5 text-blue-600" />
                        ) : report.type === "WIND" ? (
                          <Wind className="h-5 w-5 text-cyan-600" />
                        ) : report.type === "ROOF_INSPECTION" ? (
                          <Home className="h-5 w-5 text-amber-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary" />
                        )}
                        <CardTitle className="text-base">{report.title}</CardTitle>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        1 credit
                      </span>
                    </div>
                    <CardDescription>
                      {report.city}, {report.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{report.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {report.type.replace(/_/g, " ")}
                        </span>
                        {report.severityTags.slice(0, 1).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              tag.includes("High")
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Features */}
                      <div className="space-y-1">
                        {report.features.slice(0, 3).map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Event: {new Date(report.eventDate).toLocaleDateString()}
                      </p>

                      {/* Generate Button */}
                      <Button
                        onClick={() => generateReport(report.sku)}
                        disabled={generating === report.sku}
                        className="w-full"
                        size="sm"
                      >
                        {generating === report.sku ? (
                          "Generating..."
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Generate Report
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Why Use Community Reports?</CardTitle>
              <CardDescription>Professional reports save you time and money</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Included in Every Report:
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Verified NOAA weather data
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Professional damage assessments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      AI-generated insights
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Insurance carrier format
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">How It Works:</h4>
                  <ol className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        1
                      </span>
                      <span>Browse available community reports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        2
                      </span>
                      <span>Generate reports instantly — unlimited with your subscription</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        3
                      </span>
                      <span>Download and submit to insurance carriers</span>
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BATCH PROPOSALS MODE */}
        <TabsContent value="batch" className="space-y-8">
          {!showBatchWizard && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowBatchWizard(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="h-6 w-6" />
                Create Batch Proposal
              </button>
            </div>
          )}

          {showBatchWizard ? (
            <PageSectionCard title="New Batch Proposal">
              <BatchProposalWizard onComplete={() => setShowBatchWizard(false)} />
            </PageSectionCard>
          ) : (
            <>
              <PageSectionCard title="Simple, Fair Pricing">
                <p className="mb-6 text-sm text-muted-foreground">
                  Batch Proposals start at <strong>$20 per home</strong>. For every additional 100
                  homes, the price drops <strong>$1 per home</strong> — capped at $5 total savings.
                </p>
                <PricingTable />
              </PageSectionCard>

              <PageSectionCard title="Your Batch Proposals">
                <BatchJobsList />
              </PageSectionCard>
            </>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
