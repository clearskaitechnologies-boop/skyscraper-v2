// components/reports/BatchReportGenerator.tsx
"use client";

import { useState } from "react";

import type { ReportSectionId,ReportType } from "@/lib/reports/types";
import { DEFAULT_SECTIONS_BY_TYPE } from "@/lib/reports/types";

interface Claim {
  id: string;
  claimNumber?: string;
  propertyAddress?: string;
  dateOfLoss?: Date;
  damageType?: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
  sections: string[];
  options?: any;
}

interface BatchResult {
  claimId: string;
  claimNumber?: string;
  status: "pending" | "success" | "error";
  url?: string;
  error?: string;
}

interface Props {
  orgId: string;
  claims: Claim[];
  templates: Template[];
}

export function BatchReportGenerator({ orgId, claims, templates }: Props) {
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [reportType, setReportType] = useState<ReportType>("INSURANCE_CLAIM");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [sections, setSections] = useState<ReportSectionId[]>(
    DEFAULT_SECTIONS_BY_TYPE["INSURANCE_CLAIM"]
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);

  function toggleClaim(claimId: string) {
    setSelectedClaims((prev) =>
      prev.includes(claimId)
        ? prev.filter((id) => id !== claimId)
        : [...prev, claimId]
    );
  }

  function selectAll() {
    setSelectedClaims(claims.map((c) => c.id));
  }

  function clearAll() {
    setSelectedClaims([]);
  }

  function applyTemplate(templateId: string) {
    setSelectedTemplate(templateId);
    if (!templateId) return;

    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setReportType(template.type as ReportType);
      setSections(template.sections as ReportSectionId[]);
    }
  }

  async function handleGenerate() {
    if (selectedClaims.length === 0) {
      alert("Please select at least one claim");
      return;
    }

    if (selectedClaims.length > 10) {
      alert("Maximum 10 claims per batch");
      return;
    }

    setIsGenerating(true);
    
    // Initialize results
    const initialResults: BatchResult[] = selectedClaims.map((claimId) => {
      const claim = claims.find((c) => c.id === claimId);
      return {
        claimId,
        claimNumber: claim?.claimNumber,
        status: "pending" as const,
      };
    });
    setResults(initialResults);

    try {
      const res = await fetch("/api/reports/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          claimIds: selectedClaims,
          config: {
            type: reportType,
            sections,
            options: {},
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Batch generation failed");
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      console.error("Batch error:", err);
      alert(err.message || "Failed to generate reports");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Configuration */}
      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold">Configuration</h2>
        
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium">Template</label>
            <select
              className="w-full rounded border px-2 py-1 text-sm"
              value={selectedTemplate}
              onChange={(e) => applyTemplate(e.target.value)}
            >
              <option value="">No template (use defaults)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Report Type</label>
            <select
              className="w-full rounded border px-2 py-1 text-sm"
              value={reportType}
              onChange={(e) => {
                const type = e.target.value as ReportType;
                setReportType(type);
                setSections(DEFAULT_SECTIONS_BY_TYPE[type]);
              }}
            >
              <option value="INSURANCE_CLAIM">Insurance Claim</option>
              <option value="RETAIL_PROPOSAL">Retail Proposal</option>
              <option value="SUPPLEMENT_PACKAGE">Supplement Package</option>
              <option value="WEATHER_ONLY">Weather Only</option>
              <option value="WARRANTY_DOC">Warranty Doc</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {sections.length} sections enabled • Max 10 claims per batch
        </p>
      </div>

      {/* Claim Selection */}
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Select Claims ({selectedClaims.length} selected)
          </h2>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        {claims.length === 0 ? (
          <p className="text-xs text-muted-foreground">No claims found</p>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {claims.map((claim) => (
              <label
                key={claim.id}
                className="flex cursor-pointer items-center gap-3 rounded border p-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedClaims.includes(claim.id)}
                  onChange={() => toggleClaim(claim.id)}
                  className="h-4 w-4"
                />
                <div className="flex-1 text-sm">
                  <span className="font-medium">
                    {claim.claimNumber || claim.id}
                  </span>
                  {" - "}
                  <span className="text-muted-foreground">
                    {claim.propertyAddress || "No address"}
                  </span>
                  {claim.damageType && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({claim.damageType})
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || selectedClaims.length === 0}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating
          ? "Generating Reports..."
          : `Generate ${selectedClaims.length} Report${selectedClaims.length !== 1 ? "s" : ""}`}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold">Results</h2>
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.claimId}
                className="flex items-center justify-between rounded border p-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  {result.status === "pending" && (
                    <span className="text-yellow-600">⏳ Pending</span>
                  )}
                  {result.status === "success" && (
                    <span className="text-green-600">✅ Success</span>
                  )}
                  {result.status === "error" && (
                    <span className="text-red-600">❌ Error</span>
                  )}
                  <span className="font-medium">
                    {result.claimNumber || result.claimId}
                  </span>
                </div>
                {result.status === "success" && result.url && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-600 underline"
                  >
                    Open PDF
                  </a>
                )}
                {result.status === "error" && (
                  <span className="text-xs text-red-600">{result.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
