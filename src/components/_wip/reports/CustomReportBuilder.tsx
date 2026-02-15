"use client";

import { BarChart3, LineChart, Loader2,PieChart, Save, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const FIELD_OPTIONS = [
  { value: "claimNumber", label: "Claim Number" },
  { value: "lifecycleStage", label: "Lifecycle Stage" },
  { value: "damageType", label: "Damage Type" },
  { value: "estimatedExposure", label: "Estimated Exposure" },
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
];

const CHART_TYPES = [
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "pie", label: "Pie Chart", icon: PieChart },
  { value: "line", label: "Line Chart", icon: LineChart },
  { value: "metric", label: "Metric Card", icon: TrendingUp },
];

export default function CustomReportBuilder() {
  const [reportName, setReportName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [chartType, setChartType] = useState("bar");
  const [groupBy, setGroupBy] = useState("lifecycleStage");
  const [loading, setLoading] = useState(false);

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleSave = async () => {
    if (!reportName || selectedFields.length === 0) {
      toast.error("Please provide a report name and select at least one field");
      return;
    }

    setLoading(true);

    try {
      const config = {
        fields: selectedFields,
        chartType,
        groupBy,
      };

      const response = await fetch("/api/reports/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reportName,
          description,
          reportType: "claims",
          config,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save custom report");
      }

      toast.success("Custom report saved successfully!");
      
      // Reset form
      setReportName("");
      setDescription("");
      setSelectedFields([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
          <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-[color:var(--text)]">
          Build Custom Report
        </h3>
      </div>

      <div className="space-y-6">
        {/* Report Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
            Report Name *
          </label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Q1 Claims Analysis"
            className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Detailed analysis of claims by damage type and stage"
            className="w-full resize-none rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
          />
        </div>

        {/* Field Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
            Select Fields *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FIELD_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--surface-2)] p-3 transition hover:bg-[var(--surface-glass)]"
              >
                <input
                  type="checkbox"
                  checked={selectedFields.includes(option.value)}
                  onChange={() => toggleField(option.value)}
                  className="h-4 w-4 rounded text-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]"
                />
                <span className="text-sm text-[color:var(--text)]">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Chart Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
            Visualization Type
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {CHART_TYPES.map((option) => (
              <button
                key={option.value}
                onClick={() => setChartType(option.value)}
                className={`flex flex-col items-center gap-2 rounded-xl p-3 font-medium transition ${
                  chartType === option.value
                    ? "bg-[var(--primary)] text-white shadow-[var(--glow)]"
                    : "bg-[var(--surface-2)] text-[color:var(--muted)] hover:bg-[var(--surface-glass)]"
                }`}
              >
                <option.icon className="h-5 w-5" />
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Group By */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
            Group By
          </label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
          >
            <option value="lifecycleStage">Lifecycle Stage</option>
            <option value="damageType">Damage Type</option>
            <option value="createdAt">Created Date</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading || !reportName || selectedFields.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-6 py-3 font-semibold text-white shadow-[var(--glow)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving Report...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Custom Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
