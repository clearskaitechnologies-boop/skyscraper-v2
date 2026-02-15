// components/reports/BatchReportGenerator.tsx
"use client";

import { useState } from "react";

import { ReportSectionId, ReportType } from "@/lib/reports/types";

interface Claim {
  id: string;
  claimNumber: string | null;
  propertyAddress: string | null;
}

interface BatchReportGeneratorProps {
  claims: Claim[];
  orgId?: string;
  templates?: any[];
}

export function BatchReportGenerator({ claims }: BatchReportGeneratorProps) {
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());
  const [reportType, setReportType] = useState<ReportType>("INSURANCE_CLAIM");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const toggleClaim = (claimId: string) => {
    const newSet = new Set(selectedClaims);
    if (newSet.has(claimId)) {
      newSet.delete(claimId);
    } else {
      newSet.add(claimId);
    }
    setSelectedClaims(newSet);
  };

  const toggleAll = () => {
    if (selectedClaims.size === claims.length) {
      setSelectedClaims(new Set());
    } else {
      setSelectedClaims(new Set(claims.map((c) => c.id)));
    }
  };

  const generateBatch = async () => {
    if (selectedClaims.size === 0) {
      setResult({ success: false, message: "Please select at least one claim" });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/reports/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimIds: Array.from(selectedClaims),
          reportType,
          sections: getDefaultSections(reportType),
          emailWhenDone: false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully generated ${data.totalGenerated} of ${data.totalRequested} reports`,
        });
        setSelectedClaims(new Set());
      } else {
        setResult({ success: false, message: data.error || "Failed to generate reports" });
      }
    } catch (error) {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Batch Report Generator</h3>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as ReportType)}
          className="rounded-md border px-3 py-1 text-sm"
          disabled={isGenerating}
          aria-label="Report type"
        >
          <option value="INSURANCE_CLAIM">Insurance Claim</option>
          <option value="RETAIL_PROPOSAL">Retail Proposal</option>
          <option value="SUPPLEMENT">Supplement</option>
        </select>
      </div>

      <div className="max-h-60 space-y-2 overflow-y-auto">
        <label className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={selectedClaims.size === claims.length && claims.length > 0}
            onChange={toggleAll}
            disabled={isGenerating}
            className="rounded"
          />
          <span className="text-sm font-medium">Select All ({claims.length})</span>
        </label>

        {claims.map((claim) => (
          <label
            key={claim.id}
            className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={selectedClaims.has(claim.id)}
              onChange={() => toggleClaim(claim.id)}
              disabled={isGenerating}
              className="rounded"
            />
            <span className="text-sm">
              {claim.claimNumber || claim.id.slice(0, 8)} - {claim.propertyAddress || "No address"}
            </span>
          </label>
        ))}
      </div>

      {result && (
        <div
          className={`rounded p-3 text-sm ${
            result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {result.message}
        </div>
      )}

      <button
        onClick={generateBatch}
        disabled={isGenerating || selectedClaims.size === 0}
        className="w-full rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating
          ? "Generating Reports..."
          : `Generate ${selectedClaims.size} Report${selectedClaims.size !== 1 ? "s" : ""}`}
      </button>
    </div>
  );
}

function getDefaultSections(reportType: ReportType): ReportSectionId[] {
  if (reportType === "RETAIL_PROPOSAL") {
    return [
      "COVER",
      "CLIENT_SNAPSHOT",
      "MAPS_AND_PHOTOS",
      "MATERIALS",
      "WARRANTY_DETAILS",
      "AI_SUMMARY_RETAIL",
    ];
  }
  return [
    "COVER",
    "CLAIM_SNAPSHOT",
    "CLIENT_SNAPSHOT",
    "MAPS_AND_PHOTOS",
    "WEATHER_QUICK_DOL",
    "AI_DAMAGE",
    "ESTIMATE_INITIAL",
    "AI_SUMMARY_CLAIM",
  ];
}
