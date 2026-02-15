/**
 * REPORT METRICS WIDGET
 * Dashboard widget showing Universal Report usage metrics
 * Admin-only view with key performance indicators
 */

"use client";

import {
  CheckCircle,
  Clock,
  Cloud,
  Download,
  FileText,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";

interface ReportMetricsWidgetProps {
  orgId: string;
}

interface MetricsData {
  totalReports: number;
  reportsThisMonth: number;
  reportsFinalized: number;
  reportsSubmitted: number;
  pdfGenerations: number;
  averageDaysToFinalize: number | null;
  weatherPullsQuick: number;
  weatherPullsFull: number;
  aiTokensUsed: number;
  averageReportBuildTime: number | null;
}

export function ReportMetricsWidget({ orgId }: ReportMetricsWidgetProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Feature flag check
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_UNIVERSAL_REPORTS === "true";

  useEffect(() => {
    if (!isEnabled) {
      setIsLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/admin/report-metrics?orgId=${orgId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error("Error fetching report metrics:", err);
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [orgId, isEnabled]);

  // Don't render if feature disabled
  if (!isEnabled) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          <span className="text-sm text-neutral-600">Loading report metrics...</span>
        </div>
      </Card>
    );
  }

  // Error state
  if (error || !metrics) {
    return (
      <Card className="p-6">
        <div className="text-center text-sm text-neutral-500">
          <p>Unable to load report metrics</p>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Universal Report Metrics</h3>
        <FileText className="h-5 w-5 text-neutral-400" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Reports */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
            <FileText className="h-4 w-4" />
            Total Reports
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">{metrics.totalReports}</div>
          <div className="mt-1 text-xs text-neutral-500">{metrics.reportsThisMonth} this month</div>
        </div>

        {/* Finalized */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
            <CheckCircle className="h-4 w-4" />
            Finalized
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-900">{metrics.reportsFinalized}</div>
          <div className="mt-1 text-xs text-blue-600">Ready for review</div>
        </div>

        {/* Submitted */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-green-700">
            <Send className="h-4 w-4" />
            Submitted
          </div>
          <div className="mt-2 text-2xl font-bold text-green-900">{metrics.reportsSubmitted}</div>
          <div className="mt-1 text-xs text-green-600">Sent to carriers</div>
        </div>

        {/* PDF Downloads */}
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-700">
            <Download className="h-4 w-4" />
            PDFs Generated
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-900">{metrics.pdfGenerations}</div>
          <div className="mt-1 text-xs text-purple-600">Total downloads</div>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {/* Weather Pulls */}
        <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-cyan-700">
            <Cloud className="h-4 w-4" />
            Weather
          </div>
          <div className="mt-2 text-xl font-bold text-cyan-900">
            {metrics.weatherPullsQuick + metrics.weatherPullsFull}
          </div>
          <div className="mt-1 text-xs text-cyan-600">
            {metrics.weatherPullsQuick} quick / {metrics.weatherPullsFull} full
          </div>
        </div>

        {/* AI Tokens */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
            <Sparkles className="h-4 w-4" />
            AI Tokens
          </div>
          <div className="mt-2 text-xl font-bold text-amber-900">
            {(metrics.aiTokensUsed / 1000).toFixed(1)}K
          </div>
          <div className="mt-1 text-xs text-amber-600">Total used</div>
        </div>

        {/* Avg Build Time */}
        {metrics.averageReportBuildTime !== null && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
              <Clock className="h-4 w-4" />
              Build Time
            </div>
            <div className="mt-2 text-xl font-bold text-indigo-900">
              {metrics.averageReportBuildTime}m
            </div>
            <div className="mt-1 text-xs text-indigo-600">Average</div>
          </div>
        )}
      </div>

      {/* Average Time to Finalize */}
      {metrics.averageDaysToFinalize !== null && (
        <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <Clock className="h-4 w-4" />
              Average Time to Finalize
            </div>
            <div className="text-xl font-bold text-neutral-900">
              {metrics.averageDaysToFinalize.toFixed(1)} days
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <p className="mt-4 text-xs text-neutral-500">
        Metrics updated in real-time based on report activity across your organization.
      </p>
    </Card>
  );
}
