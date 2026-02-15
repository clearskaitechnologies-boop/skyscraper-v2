/**
 * PHASE 48: RECONSTRUCTED TIMELINE UI
 * 
 * Shows:
 * - Real Timeline (what actually happened)
 * - Ideal Timeline (what should have happened)
 * - Missing Events (critical gaps)
 * - Discrepancies (where things went wrong)
 */

"use client";

import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useEffect,useState } from "react";

interface TimelineEvent {
  timestamp: string;
  title: string;
  description: string;
  source: string;
  confidence: number;
  severity?: "low" | "medium" | "high" | "critical";
}

interface MissingEvent {
  title: string;
  reason: string;
  predictedDate?: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
}

interface Discrepancy {
  realEvent: string;
  missingEvent: string;
  severity: "low" | "medium" | "high" | "critical";
  impact: string;
  recommendation: string;
}

interface Reconstruction {
  realTimeline: TimelineEvent[];
  idealTimeline: TimelineEvent[];
  missingEvents: MissingEvent[];
  discrepancies: Discrepancy[];
  aiSummary: string;
  scoreQuality: number;
}

export default function ReconstructedTimeline({ claimId }: { claimId: string }) {
  const [reconstruction, setReconstruction] = useState<Reconstruction | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"real" | "ideal" | "both">("both");
  const [showMissing, setShowMissing] = useState(true);

  useEffect(() => {
    fetchReconstruction();
  }, [claimId]);

  const fetchReconstruction = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/reconstruct`);
      if (res.ok) {
        const data = await res.json();
        setReconstruction(data.reconstruction);
      }
    } catch (error) {
      console.error("Error fetching reconstruction:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReconstruction = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/reconstruct`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setReconstruction(data.reconstruction);
      }
    } catch (error) {
      console.error("Error generating reconstruction:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportTimeline = async () => {
    try {
      const res = await fetch(`/api/claims/${claimId}/reconstruct/export`);
      if (res.ok) {
        const data = await res.json();
        // Create downloadable text file
        const blob = new Blob([data.export.disputeTimeline], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `claim_${claimId}_timeline.txt`;
        a.click();
      }
    } catch (error) {
      console.error("Error exporting timeline:", error);
    }
  };

  if (loading && !reconstruction) {
    return (
      <div className="flex items-center justify-center p-12">
        <Clock className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading reconstruction...</span>
      </div>
    );
  }

  if (!reconstruction) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Reconstruction Available</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate an AI-powered timeline reconstruction for this claim.
        </p>
        <button
          onClick={generateReconstruction}
          disabled={loading}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Reconstruction (15 tokens)"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Claim Timeline Reconstruction</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered analysis of {reconstruction.realTimeline.length} documented events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 px-4 py-2">
            <div className="text-sm font-medium text-muted-foreground">Quality Score</div>
            <div className="text-2xl font-bold text-primary">{reconstruction.scoreQuality}/100</div>
          </div>
          <button
            onClick={exportTimeline}
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            <Download className="mr-2 inline-block h-4 w-4" />
            Export
          </button>
          <button
            onClick={generateReconstruction}
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* AI Summary */}
      {reconstruction.aiSummary && (
        <div className="rounded-lg border bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-semibold text-blue-900">AI Analysis</div>
              <p className="mt-1 text-sm text-blue-700">{reconstruction.aiSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* View Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView("real")}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            view === "real" ? "bg-primary text-primary-foreground" : "bg-accent"
          }`}
        >
          Real Timeline
        </button>
        <button
          onClick={() => setView("ideal")}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            view === "ideal" ? "bg-primary text-primary-foreground" : "bg-accent"
          }`}
        >
          Ideal Timeline
        </button>
        <button
          onClick={() => setView("both")}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            view === "both" ? "bg-primary text-primary-foreground" : "bg-accent"
          }`}
        >
          Side-by-Side
        </button>
        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showMissing}
              onChange={(e) => setShowMissing(e.target.checked)}
              className="rounded"
            />
            Show Missing Events
          </label>
        </div>
      </div>

      {/* Timeline Display */}
      <div className={view === "both" ? "grid grid-cols-2 gap-6" : ""}>
        {(view === "real" || view === "both") && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">Real Timeline ({reconstruction.realTimeline.length} events)</h3>
            <div className="space-y-4">
              {reconstruction.realTimeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getSeverityColor(event.severity || "low")}`}>
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    {index < reconstruction.realTimeline.length - 1 && (
                      <div className="h-full w-0.5 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.timestamp).toLocaleString()}
                          <span>•</span>
                          <span>Source: {event.source}</span>
                          <span>•</span>
                          <span>Confidence: {event.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(view === "ideal" || view === "both") && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">Ideal Timeline (Best Practice)</h3>
            <div className="space-y-4">
              {reconstruction.idealTimeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    {index < reconstruction.idealTimeline.length - 1 && (
                      <div className="h-full w-0.5 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">{event.description}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Missing Events */}
      {showMissing && reconstruction.missingEvents.length > 0 && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-rose-900">
            <AlertTriangle className="h-5 w-5" />
            Missing Events ({reconstruction.missingEvents.length})
          </h3>
          <div className="space-y-3">
            {reconstruction.missingEvents.map((event, index) => (
              <div
                key={index}
                className={`rounded-lg border p-3 ${
                  event.severity === "critical" ? "border-rose-300 bg-rose-100" : "border-amber-300 bg-amber-50"
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className={`mt-0.5 h-4 w-4 ${event.severity === "critical" ? "text-rose-600" : "text-amber-600"}`} />
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">{event.reason}</div>
                    {event.predictedDate && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Predicted date: {new Date(event.predictedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      event.severity === "critical"
                        ? "bg-rose-200 text-rose-800"
                        : event.severity === "high"
                          ? "bg-amber-200 text-amber-800"
                          : "bg-blue-200 text-blue-800"
                    }`}
                  >
                    {event.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discrepancies */}
      {reconstruction.discrepancies.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-semibold">Discrepancies ({reconstruction.discrepancies.length})</h3>
          <div className="space-y-4">
            {reconstruction.discrepancies.map((disc, index) => (
              <div key={index} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="font-medium text-amber-900">{disc.missingEvent}</div>
                <div className="mt-1 text-sm text-amber-700">Current: {disc.realEvent}</div>
                <div className="mt-2 text-sm text-amber-800">
                  <strong>Impact:</strong> {disc.impact}
                </div>
                <div className="mt-1 text-sm text-amber-800">
                  <strong>Recommendation:</strong> {disc.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-rose-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-blue-500";
    case "low":
      return "bg-slate-500";
    default:
      return "bg-slate-500";
  }
}
