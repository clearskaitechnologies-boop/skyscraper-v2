"use client";

import { Calendar, Download, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";

// Local type definitions for artifact management
type ArtifactStatus = "DRAFT" | "FINAL" | "APPROVED" | "SUBMITTED" | "REJECTED" | "ARCHIVED";

type ArtifactType =
  | "ROOF_ESTIMATE"
  | "ROOF_REPORT"
  | "WATER_DAMAGE_REPORT"
  | "SUPPLEMENT_REQUEST"
  | "REBUTTAL_LETTER"
  | "INSPECTION_REPORT"
  | "INVOICE"
  | "CUSTOM";

interface UniversalTemplate {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  created_at: Date;
  updated_at: Date;
}

interface GeneratedArtifact {
  id: string;
  claim_id: string;
  org_id: string;
  type: ArtifactType;
  status: ArtifactStatus;
  title: string;
  pdfUrl?: string | null;
  thumbnailUrl?: string | null;
  version: number;
  metadata?: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

type ArtifactWithTemplate = GeneratedArtifact & {
  sourceTemplate?: UniversalTemplate | null;
};

interface ArtifactCardProps {
  artifact: ArtifactWithTemplate;
  onDownload?: () => void;
  onRegenerate?: () => void;
  onView?: () => void;
  compact?: boolean;
}

// Format artifact type for display
const formatType = (type: ArtifactType): string => {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// Get status color
const getStatusColor = (status: ArtifactStatus): string => {
  switch (status) {
    case "FINAL":
    case "APPROVED":
      return "bg-green-100 text-green-700 border-green-200";
    case "DRAFT":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "SUBMITTED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "REJECTED":
      return "bg-red-100 text-red-700 border-red-200";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// Get type color
const getTypeColor = (type: ArtifactType): string => {
  if (type.includes("ROOF")) return "bg-purple-100 text-purple-700";
  if (type.includes("WATER")) return "bg-blue-100 text-blue-700";
  if (type.includes("SUPPLEMENT") || type.includes("REBUTTAL"))
    return "bg-orange-100 text-orange-700";
  if (type.includes("REPORT")) return "bg-indigo-100 text-indigo-700";
  if (type.includes("INVOICE")) return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
};

export function ArtifactCard({
  artifact,
  onDownload,
  onRegenerate,
  onView,
  compact = false,
}: ArtifactCardProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div
      className={`rounded-lg border bg-white transition-colors hover:border-primary/50 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      {/* Thumbnail */}
      {!compact && artifact.thumbnailUrl && (
        <div className="relative mb-3 h-32 w-full overflow-hidden rounded bg-gray-100">
          <img
            src={artifact.thumbnailUrl}
            alt={artifact.title}
            className="h-full w-full object-cover"
          />
          {artifact.version > 1 && (
            <div className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
              v{artifact.version}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {/* Type Badge */}
        <div className="flex items-center gap-2">
          <span className={`rounded px-2 py-1 text-xs font-medium ${getTypeColor(artifact.type)}`}>
            {formatType(artifact.type)}
          </span>
          <span
            className={`rounded border px-2 py-1 text-xs font-medium ${getStatusColor(artifact.status)}`}
          >
            {artifact.status}
          </span>
        </div>

        {/* Title */}
        <h3 className={`line-clamp-2 font-semibold ${compact ? "text-sm" : "text-base"}`}>
          {artifact.title}
        </h3>

        {/* Template info */}
        {!compact && artifact.sourceTemplate && (
          <p className="text-xs text-muted-foreground">Template: {artifact.sourceTemplate.name}</p>
        )}

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span className="text-xs">
            {new Date(artifact.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Version info */}
        {artifact.version > 1 && (
          <p className="text-xs text-muted-foreground">Version {artifact.version}</p>
        )}

        {/* Actions */}
        <div className={`flex gap-2 pt-2 ${compact ? "flex-col" : "flex-wrap"}`}>
          {onView && (
            <button
              onClick={onView}
              className="flex items-center justify-center gap-2 rounded bg-gray-100 px-3 py-1.5 text-sm transition-colors hover:bg-gray-200"
            >
              <ExternalLink className="h-3 w-3" />
              View
            </button>
          )}

          {artifact.pdfUrl && onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center justify-center gap-2 rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="h-3 w-3" />
              {compact ? "PDF" : "Download PDF"}
            </button>
          )}

          {artifact.status === "DRAFT" && onRegenerate && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center justify-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:border-gray-400 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`} />
              {isRegenerating ? "Regenerating..." : compact ? "Regen" : "Regenerate"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Grid view for multiple artifacts
interface ArtifactGridProps {
  artifacts: ArtifactWithTemplate[];
  onDownload?: (artifactId: string) => void;
  onRegenerate?: (artifactId: string) => void;
  onView?: (artifactId: string) => void;
  groupByType?: boolean;
  compact?: boolean;
}

export function ArtifactGrid({
  artifacts,
  onDownload,
  onRegenerate,
  onView,
  groupByType = false,
  compact = false,
}: ArtifactGridProps) {
  if (groupByType) {
    // Group artifacts by type
    const grouped: Record<string, ArtifactWithTemplate[]> = artifacts.reduce(
      (acc, artifact) => {
        const type = artifact.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(artifact);
        return acc;
      },
      {} as Record<string, ArtifactWithTemplate[]>
    );

    return (
      <div className="space-y-8">
        {(Object.entries(grouped) as [string, ArtifactWithTemplate[]][]).map(
          ([type, typeArtifacts]) => (
            <div key={type}>
              <h3 className="mb-4 text-lg font-semibold">
                {formatType(type as ArtifactType)} ({typeArtifacts.length})
              </h3>
              <div
                className={`grid gap-4 ${
                  compact
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {typeArtifacts.map((artifact) => (
                  <ArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    onDownload={onDownload ? () => onDownload(artifact.id) : undefined}
                    onRegenerate={onRegenerate ? () => onRegenerate(artifact.id) : undefined}
                    onView={onView ? () => onView(artifact.id) : undefined}
                    compact={compact}
                  />
                ))}
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  // Regular grid
  return (
    <div
      className={`grid gap-4 ${
        compact
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      }`}
    >
      {artifacts.map((artifact) => (
        <ArtifactCard
          key={artifact.id}
          artifact={artifact}
          onDownload={onDownload ? () => onDownload(artifact.id) : undefined}
          onRegenerate={onRegenerate ? () => onRegenerate(artifact.id) : undefined}
          onView={onView ? () => onView(artifact.id) : undefined}
          compact={compact}
        />
      ))}
    </div>
  );
}
