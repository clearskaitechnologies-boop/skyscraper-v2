"use client";

/**
 * DamageReviewPanel
 *
 * UI component for reviewing AI-analyzed damage photos.
 * Allows adjusters to approve, reject, or edit damage findings.
 */

import { Check, ChevronLeft, ChevronRight, Edit2, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DamageAnalysis {
  damageType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  confidence: number;
  location?: { x: number; y: number; width: number; height: number };
}

interface PhotoAnalysis {
  photoUrl?: string;
  caption: string;
  damages: DamageAnalysis[];
  overallCondition: string;
  analyzedAt?: string;
}

interface DamageReviewPanelProps {
  photos: PhotoAnalysis[];
  onApprove?: (photoIndex: number, damageIndex: number) => void;
  onReject?: (photoIndex: number, damageIndex: number) => void;
  onEdit?: (photoIndex: number, damageIndex: number, updates: Partial<DamageAnalysis>) => void;
  onApproveAll?: () => void;
  className?: string;
}

const SEVERITY_COLORS = {
  low: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  high: "bg-red-100 text-red-800 border-red-300",
  critical: "bg-purple-100 text-purple-800 border-purple-300",
};

const SEVERITY_BADGE = {
  low: "bg-green-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
  critical: "bg-purple-500",
};

export function DamageReviewPanel({
  photos,
  onApprove,
  onReject,
  onEdit,
  onApproveAll,
  className,
}: DamageReviewPanelProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedDamage, setSelectedDamage] = useState<number | null>(null);
  const [approvedDamages, setApprovedDamages] = useState<Set<string>>(new Set());
  const [rejectedDamages, setRejectedDamages] = useState<Set<string>>(new Set());

  const currentPhoto = photos[currentPhotoIndex];
  const totalDamages = photos.reduce((sum, p) => sum + p.damages.length, 0);
  const approvedCount = approvedDamages.size;

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => Math.max(0, prev - 1));
    setSelectedDamage(null);
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => Math.min(photos.length - 1, prev + 1));
    setSelectedDamage(null);
  };

  const getDamageKey = (photoIdx: number, damageIdx: number) => `${photoIdx}-${damageIdx}`;

  const handleApproveDamage = (damageIdx: number) => {
    const key = getDamageKey(currentPhotoIndex, damageIdx);
    setApprovedDamages((prev) => new Set(prev).add(key));
    setRejectedDamages((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    onApprove?.(currentPhotoIndex, damageIdx);
  };

  const handleRejectDamage = (damageIdx: number) => {
    const key = getDamageKey(currentPhotoIndex, damageIdx);
    setRejectedDamages((prev) => new Set(prev).add(key));
    setApprovedDamages((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    onReject?.(currentPhotoIndex, damageIdx);
  };

  const handleApproveAll = () => {
    const newApproved = new Set(approvedDamages);
    photos.forEach((photo, pIdx) => {
      photo.damages.forEach((_, dIdx) => {
        newApproved.add(getDamageKey(pIdx, dIdx));
      });
    });
    setApprovedDamages(newApproved);
    setRejectedDamages(new Set());
    onApproveAll?.();
  };

  if (photos.length === 0) {
    return (
      <div className={cn("rounded-lg border bg-gray-50 p-8 text-center", className)}>
        <p className="text-gray-500">No photos to review. Upload photos for AI analysis.</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-white shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold text-gray-900">Damage Review</h3>
          <p className="text-sm text-gray-500">
            {approvedCount} of {totalDamages} damages reviewed
          </p>
        </div>
        <Button variant="success" size="sm" onClick={handleApproveAll}>
          <Check className="mr-1 h-4 w-4" />
          Approve All
        </Button>
      </div>

      {/* Photo Viewer */}
      <div className="relative">
        {/* Navigation */}
        <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={handlePrevPhoto}
            disabled={currentPhotoIndex === 0}
            className="rounded-full bg-black/50 p-2 text-white disabled:opacity-30"
            title="Previous photo"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={handleNextPhoto}
            disabled={currentPhotoIndex === photos.length - 1}
            className="rounded-full bg-black/50 p-2 text-white disabled:opacity-30"
            title="Next photo"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Photo with Annotations */}
        <div className="relative aspect-video w-full bg-gray-900">
          {currentPhoto.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentPhoto.photoUrl}
              alt={currentPhoto.caption}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No photo available
            </div>
          )}

          {/* Annotation Overlays */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {currentPhoto.damages.map((damage, idx) => {
              if (!damage.location) return null;
              const key = getDamageKey(currentPhotoIndex, idx);
              const isApproved = approvedDamages.has(key);
              const isRejected = rejectedDamages.has(key);
              const isSelected = selectedDamage === idx;

              const color = isRejected
                ? "#6B7280"
                : SEVERITY_BADGE[damage.severity].replace("bg-", "");
              const strokeColor = isSelected ? "#3B82F6" : color;

              return damage.damageType.includes("hail") ? (
                <circle
                  key={idx}
                  cx={`${damage.location.x}%`}
                  cy={`${damage.location.y}%`}
                  r="20"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray={isRejected ? "4" : "0"}
                  opacity={isApproved ? 1 : 0.7}
                  className="cursor-pointer"
                  onClick={() => setSelectedDamage(idx)}
                />
              ) : (
                <rect
                  key={idx}
                  x={`${damage.location.x - damage.location.width / 2}%`}
                  y={`${damage.location.y - damage.location.height / 2}%`}
                  width={`${damage.location.width}%`}
                  height={`${damage.location.height}%`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray={isRejected ? "4" : "0"}
                  opacity={isApproved ? 1 : 0.7}
                />
              );
            })}
          </svg>
        </div>

        {/* Photo Counter */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
          {currentPhotoIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Caption */}
      <div className="border-t bg-gray-50 px-4 py-2">
        <p className="text-sm text-gray-700">{currentPhoto.caption}</p>
        <p className="text-xs text-gray-500">{currentPhoto.overallCondition}</p>
      </div>

      {/* Damage List */}
      <div className="max-h-64 divide-y overflow-y-auto">
        {currentPhoto.damages.map((damage, idx) => {
          const key = getDamageKey(currentPhotoIndex, idx);
          const isApproved = approvedDamages.has(key);
          const isRejected = rejectedDamages.has(key);

          return (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-between px-4 py-3 transition-colors",
                selectedDamage === idx && "bg-blue-50",
                isRejected && "bg-gray-50 opacity-60"
              )}
              onClick={() => setSelectedDamage(idx)}
            >
              <div className="flex items-center gap-3">
                {/* Severity Badge */}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    SEVERITY_COLORS[damage.severity]
                  )}
                >
                  {damage.severity}
                </span>

                <div>
                  <p className="font-medium text-gray-900">
                    {damage.damageType.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-gray-500">{damage.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Confidence */}
                <span className="text-xs text-gray-400">
                  {Math.round(damage.confidence * 100)}%
                </span>

                {/* Status Indicators */}
                {isApproved && <Check className="h-5 w-5 text-green-500" />}
                {isRejected && <X className="h-5 w-5 text-gray-400" />}

                {/* Action Buttons */}
                {!isApproved && !isRejected && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveDamage(idx);
                      }}
                      className="rounded p-1 text-green-600 hover:bg-green-50"
                      title="Approve"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectDamage(idx);
                      }}
                      className="rounded p-1 text-red-600 hover:bg-red-50"
                      title="Reject"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(currentPhotoIndex, idx, {});
                      }}
                      className="rounded p-1 text-gray-600 hover:bg-gray-50"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="border-t bg-gray-50 px-4 py-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Analyzed:{" "}
            {currentPhoto.analyzedAt ? new Date(currentPhoto.analyzedAt).toLocaleString() : "—"}
          </span>
          <span className="font-medium text-gray-700">
            {currentPhoto.damages.length} damage{currentPhoto.damages.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>
    </div>
  );
}
