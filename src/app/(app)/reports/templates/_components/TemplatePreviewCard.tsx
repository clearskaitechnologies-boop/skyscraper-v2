"use client";

import { Eye, FileText, Sparkles } from "lucide-react";

// Works with OrgTemplate data shape from the templates page
interface OrgTemplateData {
  id: string;
  templateId?: string;
  name: string;
  description?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
  version?: string | null;
}

interface TemplatePreviewCardProps {
  template: OrgTemplateData;
  onClick: () => void;
}

export function TemplatePreviewCard({ template, onClick }: TemplatePreviewCardProps) {
  const thumbnailUrl = template.thumbnailUrl || `/api/templates/${template.templateId}/thumbnail`;
  const isContractorEstimate = template.name?.toLowerCase().includes("contractor estimate");

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl border-2 border-slate-200 bg-white text-left shadow-sm transition hover:border-blue-400 hover:shadow-xl"
    >
      {/* Thumbnail Preview */}
      <div className="relative h-48 bg-slate-100">
        <img
          src={thumbnailUrl}
          alt={template.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/template-thumbs/general-contractor-estimate.svg";
          }}
        />

        {/* Featured Badge for Contractor Estimate */}
        {isContractorEstimate && (
          <div className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white shadow-lg">
            <Sparkles className="mr-1 inline h-3 w-3" />
            Featured
          </div>
        )}

        {/* Category Badge */}
        {template.category && (
          <div className="absolute right-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white shadow-lg">
            {template.category}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="mb-1 font-semibold text-slate-900 group-hover:text-blue-600">
          {template.name}
        </h3>
        {template.description && (
          <p className="mb-2 line-clamp-2 text-xs text-slate-600">{template.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            PDF Template
          </span>
          {template.version && <span>v{template.version}</span>}
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-blue-600/90 opacity-0 transition group-hover:opacity-100">
        <div className="text-center text-white">
          <Eye className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm font-semibold">Click to Preview</p>
        </div>
      </div>
    </button>
  );
}
