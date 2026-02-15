"use client";

// ============================================================================
// RIGHT PANEL CONTROLS - Phase 3
// ============================================================================
// Section toggles, AI controls, export preferences

import { Check, FileText, Zap } from "lucide-react";
import { useState } from "react";

import { SECTION_REGISTRY } from "../core/SectionRegistry";
import type { ExportFormat, SectionKey } from "../types";

interface RightPanelProps {
  selectedSections: SectionKey[];
  onToggleSection: (key: SectionKey) => void;
  onRunAI: (sectionKey: SectionKey) => void;
  onApproveSection: (sectionKey: SectionKey) => void;
  exportFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
}

export default function RightPanel({
  selectedSections,
  onToggleSection,
  onRunAI,
  onApproveSection,
  exportFormat,
  onFormatChange,
}: RightPanelProps) {
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);

  return (
    <div className="flex h-screen w-80 flex-col overflow-auto border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Controls</h3>
      </div>

      {/* Export Format */}
      <div className="border-b border-gray-200 px-6 py-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">Export Format</label>
        <div className="flex gap-2">
          {(["pdf", "docx", "zip"] as ExportFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => onFormatChange(format)}
              className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
                exportFormat === format
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Section Controls */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Section Controls</h4>

          <div className="space-y-2">
            {Object.values(SECTION_REGISTRY)
              .sort((a, b) => a.order - b.order)
              .map((section) => {
                const isSelected = selectedSections.includes(section.key);
                const isExpanded = expandedSection === section.key;

                return (
                  <div
                    key={section.key}
                    className="overflow-hidden rounded-lg border border-gray-200"
                  >
                    {/* Section Header */}
                    <div
                      className={`flex cursor-pointer items-center justify-between p-3 ${
                        isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => setExpandedSection(isExpanded ? null : section.key)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSection(section.key)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                          aria-label={`Include ${section.title} section`}
                        />
                        <span className="text-sm font-medium text-gray-900">{section.title}</span>
                      </div>

                      {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                    </div>

                    {/* Expanded Controls */}
                    {isExpanded && isSelected && (
                      <div className="space-y-2 border-t border-gray-200 bg-gray-50 px-3 pb-3">
                        <button
                          onClick={() => onRunAI(section.key)}
                          className="flex w-full items-center justify-center gap-2 rounded bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200"
                        >
                          <Zap className="h-3 w-3" />
                          <span>Run AI</span>
                        </button>

                        <button
                          onClick={() => onApproveSection(section.key)}
                          className="flex w-full items-center justify-center gap-2 rounded bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve All ⚡</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 border-t border-gray-200 px-6 py-4">
        <button className="flex w-full items-center justify-center gap-2 rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          <FileText className="h-4 w-4" />
          <span>Save Template</span>
        </button>
      </div>

      {/* CRM Deep Links - Phase 4 */}
      <div className="space-y-2 border-t border-gray-200 px-6 py-4">
        <div className="mb-2 text-xs font-semibold text-gray-500">CRM ACTIONS</div>
        <a
          href="/crm/job360"
          className="flex w-full items-center justify-center gap-2 rounded bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
        >
          <span>Job 360 View</span>
        </a>
        <a
          href="/crm/funding"
          className="flex w-full items-center justify-center gap-2 rounded bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
        >
          <span>Funding</span>
        </a>
        <a
          href="/crm/documents"
          className="flex w-full items-center justify-center gap-2 rounded bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
        >
          <span>Documents</span>
        </a>
      </div>
    </div>
  );
}
