"use client";

import { Download, FileText, Loader2,Table2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DataExportPanel() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("claims");
  const [format, setFormat] = useState("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleExport = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        format,
        type: reportType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await fetch(`/api/reports/export?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      if (format === "csv") {
        // Download CSV file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `export_${reportType}_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Data exported successfully!");
      } else {
        const data = await response.json();
        // For JSON, show preview or download
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `export_${reportType}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Data exported successfully!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
          <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-[color:var(--text)]">Export Data</h3>
      </div>

      <div className="space-y-4">
        {/* Report Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
            Report Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "claims", label: "Claims", icon: FileText },
              { value: "properties", label: "Properties", icon: Table2 },
              { value: "financial", label: "Financial", icon: Download },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setReportType(option.value)}
                className={`flex items-center gap-2 rounded-xl p-3 font-medium transition ${
                  reportType === option.value
                    ? "bg-[var(--primary)] text-white shadow-[var(--glow)]"
                    : "bg-[var(--surface-2)] text-[color:var(--muted)] hover:bg-[var(--surface-glass)]"
                }`}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
            Export Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
          >
            <option value="csv">CSV (Excel Compatible)</option>
            <option value="json">JSON</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
            />
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Export {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Data
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
        💡 Exports include all data matching your filters. CSV format works great with Excel and Google Sheets.
      </div>
    </div>
  );
}
