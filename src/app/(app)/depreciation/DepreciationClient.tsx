"use client";

import { Calculator, ChevronDown, ChevronUp, Download } from "lucide-react";
import { useState } from "react";

import type { DepreciationSummary } from "./actions";

export default function DepreciationClient({ summaries }: { summaries: DepreciationSummary[] }) {
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);

  const toggleClaim = (claimId: string) => {
    setExpandedClaim(expandedClaim === claimId ? null : claimId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  const handleExportPDF = (claimId: string) => {
    // TODO: Implement PDF export with jsPDF or similar
    alert("PDF export coming soon!");
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Calculator className="h-4 w-4" />
            Total RCV
          </div>
          <div className="mt-1 text-2xl font-bold text-[color:var(--text)]">
            {formatCurrency(summaries.reduce((sum, s) => sum + s.totalRCV, 0))}
          </div>
        </div>

        <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Calculator className="h-4 w-4" />
            Total Depreciation
          </div>
          <div className="mt-1 text-2xl font-bold text-orange-600">
            {formatCurrency(summaries.reduce((sum, s) => sum + s.totalDepreciation, 0))}
          </div>
        </div>

        <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Calculator className="h-4 w-4" />
            Total ACV
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {formatCurrency(summaries.reduce((sum, s) => sum + s.totalACV, 0))}
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {summaries.map((summary) => (
          <div
            key={summary.claimId}
            className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] shadow-sm"
          >
            {/* Claim Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-[color:var(--text)]">
                    Claim #{summary.claimNumber}
                  </h3>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {summary.itemCount} items
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  {summary.propertyAddress}
                </p>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-slate-700 dark:text-slate-300">
                    RCV: <strong>{formatCurrency(summary.totalRCV)}</strong>
                  </span>
                  <span className="text-orange-600">
                    Depreciation: <strong>{formatCurrency(summary.totalDepreciation)}</strong>
                  </span>
                  <span className="text-green-600">
                    ACV: <strong>{formatCurrency(summary.totalACV)}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPDF(summary.claimId)}
                  aria-label="Export to PDF"
                  className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-[var(--surface-2)]"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleClaim(summary.claimId)}
                  aria-label={
                    expandedClaim === summary.claimId
                      ? "Collapse claim details"
                      : "Expand claim details"
                  }
                  className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-[var(--surface-2)]"
                >
                  {expandedClaim === summary.claimId ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Item Details */}
            {expandedClaim === summary.claimId && (
              <div className="border-t border-[color:var(--border)] bg-[var(--surface-2)] p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--surface-1)]">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-[color:var(--text)]">
                          Description
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-[color:var(--text)]">
                          Category
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-[color:var(--text)]">
                          Age
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-[color:var(--text)]">
                          Life
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-[color:var(--text)]">
                          RCV
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-[color:var(--text)]">
                          Dep. Rate
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-[color:var(--text)]">
                          Dep. Amount
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-[color:var(--text)]">
                          ACV
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-[var(--surface-1)]">
                      {summary.items.map((item) => (
                        <tr key={item.id} className="hover:bg-[var(--surface-2)]">
                          <td className="px-3 py-2 text-[color:var(--text)]">{item.description}</td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                            {item.category}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                            {item.age}y
                          </td>
                          <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                            {item.lifeExpectancy}y
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-[color:var(--text)]">
                            {formatCurrency(item.rcv)}
                          </td>
                          <td className="px-3 py-2 text-right text-orange-600">
                            {formatPercentage(item.depreciationRate)}
                          </td>
                          <td className="px-3 py-2 text-right text-orange-600">
                            {formatCurrency(item.depreciationAmount)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-green-600">
                            {formatCurrency(item.acv)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
