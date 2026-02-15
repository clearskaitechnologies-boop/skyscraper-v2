"use client";

import { useEffect,useMemo, useState } from "react";

import type {
  ReportConfig,
  ReportSectionId,
  ReportType,
} from "@/lib/reports/types";
import { DEFAULT_SECTIONS_BY_TYPE, SECTION_GROUPS } from "@/lib/reports/types";

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  sections: string[];
  options?: any;
}

type Props = {
  orgId: string;
  claimId: string;
  defaultType?: ReportType;
};

export function ReportBuilderPanel({ orgId, claimId, defaultType }: Props) {
  // Harden with fallbacks for all props
  const safeOrgId = orgId || "";
  const safeClaimId = claimId || "";
  const safeDefaultType = defaultType ?? "INSURANCE_CLAIM";

  const [type, setType] = useState<ReportType>(safeDefaultType);

  const [selectedSections, setSelectedSections] = useState<ReportSectionId[]>(
    DEFAULT_SECTIONS_BY_TYPE?.[safeDefaultType] || []
  );

  const [warrantyOptionId, setWarrantyOptionId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customNotes, setCustomNotes] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastReportUrl, setLastReportUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Template state
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const isClaimType = useMemo(
    () => type === "INSURANCE_CLAIM" || type === "SUPPLEMENT_PACKAGE",
    [type]
  );

  function toggleSection(section: ReportSectionId) {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  }

  function setTypeAndDefaults(nextType: ReportType) {
    setType(nextType);
    setSelectedSections(DEFAULT_SECTIONS_BY_TYPE?.[nextType] || []);
  }

  // Load templates when type changes
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch(`/api/report-templates?type=${type}`);
        if (res?.ok) {
          const data = await res.json();
          setTemplates(data?.templates || []);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    }
    fetchTemplates();
  }, [type]);

  // Apply template when selected
  function applyTemplate(templateId: string) {
    setSelectedTemplate(templateId);
    if (!templateId) return;

    const template = templates?.find((t) => t?.id === templateId);
    if (!template) return;

    setSelectedSections((template?.sections as ReportSectionId[]) || []);
    if (template?.options) {
      setCustomTitle(template.options?.customTitle || "");
      setCustomNotes(template.options?.customNotes || "");
      setWarrantyOptionId(template.options?.warrantyOptionId || "");
    }
  }

  // Save current config as template
  async function handleSaveTemplate() {
    if (!templateName.trim()) {
      setError("Template name is required");
      return;
    }

    try {
      const res = await fetch("/api/report-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          type,
          sections: selectedSections,
          options: {
            customTitle,
            customNotes,
            warrantyOptionId,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save template");
      }

      const data = await res.json();
      setTemplates((prev) => [...prev, data.template]);
      setTemplateName("");
      setShowSaveTemplate(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to save template");
    }
  }

  async function handleGenerate() {
    try {
      setIsSubmitting(true);
      setError(null);
      setLastReportUrl(null);

      const payload: ReportConfig = {
        orgId: safeOrgId,
        claimId: safeClaimId,
        type,
        sections: selectedSections || [],
        options: {
          ...(customTitle ? { customTitle } : {}),
          ...(customNotes ? { customNotes } : {}),
          ...(warrantyOptionId ? { warrantyOptionId } : {}),
        },
      };

      const res = await fetch("/api/pdf/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res?.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Failed to generate report");
      }

      const json = await res.json();
      setLastReportUrl(json?.url || json?.pdfUrl || null);
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar: type + title */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            📄 Report Configuration
          </h2>
          <p className="text-xs text-muted-foreground">
            Choose report type and sections. This will call <code>/api/pdf/create</code>.
          </p>
        </div>

        {/* Template selector */}
        <div className="flex items-center gap-2">
          <select
            className="rounded border px-2 py-1 text-sm"
            value={selectedTemplate}
            onChange={(e) => applyTemplate(e.target.value)}
            aria-label="Select template"
          >
            <option value="">No template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowSaveTemplate(!showSaveTemplate)}
            className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
          >
            Save as Template
          </button>
        </div>
      </div>

      {/* Save template form */}
      {showSaveTemplate && (
        <div className="rounded border bg-blue-50 p-3">
          <label className="mb-1 block text-xs font-medium">Template Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 rounded border px-2 py-1 text-sm"
              placeholder="e.g., Standard Insurance Report"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <button
              onClick={handleSaveTemplate}
              className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveTemplate(false)}
              className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Type buttons moved down */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <ReportTypeButton
            label="Insurance Claim"
            value="INSURANCE_CLAIM"
            current={type}
            onClick={setTypeAndDefaults}
          />
          <ReportTypeButton
            label="Retail Proposal"
            value="RETAIL_PROPOSAL"
            current={type}
            onClick={setTypeAndDefaults}
          />
          <ReportTypeButton
            label="Supplement Package"
            value="SUPPLEMENT_PACKAGE"
            current={type}
            onClick={setTypeAndDefaults}
          />
          <ReportTypeButton
            label="Weather Only"
            value="WEATHER_ONLY"
            current={type}
            onClick={setTypeAndDefaults}
          />
          <ReportTypeButton
            label="Warranty Doc"
            value="WARRANTY_DOC"
            current={type}
            onClick={setTypeAndDefaults}
          />
        </div>
      </div>

      {/* Title + notes */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" htmlFor="customTitle">
            Custom Title (optional)
          </label>
          <input
            id="customTitle"
            className="rounded border px-2 py-1 text-sm"
            placeholder="Override default report title"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            aria-label="Custom report title"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" htmlFor="customNotes">
            Internal Notes (stored in report record)
          </label>
          <textarea
            id="customNotes"
            className="min-h-[40px] rounded border px-2 py-1 text-sm"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            aria-label="Internal notes"
          />
        </div>
      </div>

      {/* Warranty selector */}
      <div className="flex max-w-md flex-col gap-1">
        <label className="text-xs font-medium" htmlFor="warrantyOptionId">
          Warranty Option ID (optional)
        </label>
        <input
          id="warrantyOptionId"
          className="rounded border px-2 py-1 text-sm"
          placeholder="Paste warrantyOptionId from branding config"
          value={warrantyOptionId}
          onChange={(e) => setWarrantyOptionId(e.target.value)}
          aria-label="Warranty option ID"
        />
        <p className="text-[11px] text-muted-foreground">
          This hooks into <code>buildWarrantySection()</code> to pull the correct warranty language & AI summary.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* LEFT: section toggles */}
        <div className="flex flex-col gap-3 rounded-lg border p-3">
          {SECTION_GROUPS.map((group) => (
            <div key={group.label} className="mb-2 border-b pb-2 last:mb-0 last:border-b-0 last:pb-0">
              <p className="mb-1 text-xs font-semibold">{group.label}</p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-2 text-xs"
                  >
                    <input
                      type="checkbox"
                      className="mt-[2px]"
                      checked={selectedSections.includes(item.id)}
                      onChange={() => toggleSection(item.id)}
                      aria-label={`Toggle ${item.label} section`}
                    />
                    <span>
                      <span className="font-medium">{item.label}</span>
                      {item.description && (
                        <span className="block text-[11px] text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: summary + action */}
        <div className="flex flex-col justify-between gap-3 rounded-lg border p-3">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold">📊 Report Summary</p>
            <p className="text-xs text-muted-foreground">
              Type: <span className="font-medium">{type}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Sections enabled:{" "}
              <span className="font-medium">{selectedSections.length}</span>
            </p>

            <ul className="mt-1 list-inside list-disc text-[11px]">
              {selectedSections.map((s) => (
                <li key={s}>{s.replace(/_/g, " ")}</li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600">
              ❌ {error}
            </div>
          )}

          {lastReportUrl && (
            <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px]">
              <p className="mb-1 font-semibold">✅ Report generated</p>
              <a
                href={lastReportUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-emerald-700 underline"
              >
                {lastReportUrl}
              </a>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-2 text-xs font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "⏳ Generating…" : "📥 Generate PDF Report"}
          </button>

          {isClaimType && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              💡 For claim-based reports, make sure you've already attached
              photos, weather, estimate, and materials to this claim so the
              report data is complete.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type TypeButtonProps = {
  label: string;
  value: ReportType;
  current: ReportType;
  onClick: (value: ReportType) => void;
};

function ReportTypeButton({ label, value, current, onClick }: TypeButtonProps) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={[
        "px-2 py-1 rounded-md text-xs border transition-colors",
        active
          ? "bg-sky-600 text-white border-sky-600"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
