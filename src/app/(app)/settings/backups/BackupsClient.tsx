"use client";

import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";

type ExportFormat = "csv" | "json";

interface ExportHistoryItem {
  id: string;
  format: ExportFormat;
  requestedAt: string;
  status: "completed" | "processing" | "failed";
  sizeKb: number | null;
}

export function BackupsClient() {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    setExporting(format);
    try {
      const res = await fetch("/api/settings/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skai-export-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          format,
          requestedAt: new Date().toISOString(),
          status: "completed" as const,
          sizeKb: blob.size / 1024,
        },
        ...prev,
      ]);
    } catch {
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          format,
          requestedAt: new Date().toISOString(),
          status: "failed" as const,
          sizeKb: null,
        },
        ...prev,
      ]);
    } finally {
      setExporting(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Export Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* CSV Export */}
        <div className="flex flex-col items-start gap-4 rounded-lg border border-[color:var(--border)] bg-slate-50 p-5 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="font-medium text-[color:var(--text)]">Export as CSV</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Spreadsheet-friendly format for Excel, Google Sheets
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleExport("csv")}
            disabled={exporting !== null}
            className="gap-2"
            variant="outline"
          >
            {exporting === "csv" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download CSV
          </Button>
        </div>

        {/* JSON Export */}
        <div className="flex flex-col items-start gap-4 rounded-lg border border-[color:var(--border)] bg-slate-50 p-5 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <FileJson className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-[color:var(--text)]">Export as JSON</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Developer-friendly structured data format
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleExport("json")}
            disabled={exporting !== null}
            className="gap-2"
            variant="outline"
          >
            {exporting === "json" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download JSON
          </Button>
        </div>
      </div>

      {/* Export History */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[color:var(--text)]">Export History</h3>
        {history.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[color:var(--border)] py-10 text-center">
            <Download className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No exports yet. Download a CSV or JSON file to see your history here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[color:var(--border)] rounded-lg border border-[color:var(--border)]">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  {item.format === "csv" ? (
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <FileJson className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="font-medium uppercase text-[color:var(--text)]">
                    {item.format}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(item.requestedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.sizeKb !== null && (
                    <span className="text-xs text-slate-400">
                      {item.sizeKb < 1 ? "<1" : Math.round(item.sizeKb)} KB
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.status === "completed"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : item.status === "processing"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
