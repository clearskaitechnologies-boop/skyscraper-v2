/**
 * Photo Gallery Section Component
 *
 * Professional photo layout for PDF reports.
 * Shows damage photos with captions and AI analysis.
 */

"use client";

import Image from "next/image";
import React from "react";

import type { AnnotatedPhoto } from "@/lib/ai/photo-annotator";

export interface PhotoGallerySectionProps {
  photos: AnnotatedPhoto[];
  title?: string;
  layout?: "grid" | "list" | "single";
  showAnnotations?: boolean;
  groupByType?: boolean;
}

export default function PhotoGallerySection({
  photos,
  title = "Damage Documentation",
  layout = "grid",
  showAnnotations = true,
  groupByType = false,
}: PhotoGallerySectionProps) {
  // Group photos by damage type if requested
  const groupedPhotos = React.useMemo(() => {
    if (!groupByType) return { all: photos };

    const groups: Record<string, AnnotatedPhoto[]> = {};
    photos.forEach((photo) => {
      photo.annotations.forEach((ann) => {
        if (!groups[ann.type]) {
          groups[ann.type] = [];
        }
        if (!groups[ann.type].includes(photo)) {
          groups[ann.type].push(photo);
        }
      });
    });
    return groups;
  }, [photos, groupByType]);

  return (
    <div className="photo-gallery-section rounded-lg bg-white p-6 shadow">
      {/* Header */}
      <div className="mb-6 border-b-2 border-green-600 pb-3">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">
          {photos.length} photo{photos.length !== 1 ? "s" : ""} documenting damage findings
        </p>
      </div>

      {/* Photo Groups */}
      {Object.entries(groupedPhotos).map(([groupName, groupPhotos]) => (
        <div key={groupName} className="mb-8">
          {groupByType && groupName !== "all" && (
            <h3 className="mb-4 text-lg font-semibold capitalize text-gray-800">
              {groupName.replace("_", " ")}
            </h3>
          )}

          {/* Grid Layout */}
          {layout === "grid" && (
            <div className="grid grid-cols-2 gap-4">
              {groupPhotos.map((photo, idx) => (
                <PhotoCard
                  key={photo.photoId}
                  photo={photo}
                  showAnnotations={showAnnotations}
                  index={idx + 1}
                />
              ))}
            </div>
          )}

          {/* List Layout */}
          {layout === "list" && (
            <div className="space-y-6">
              {groupPhotos.map((photo, idx) => (
                <PhotoCard
                  key={photo.photoId}
                  photo={photo}
                  showAnnotations={showAnnotations}
                  index={idx + 1}
                  fullWidth
                />
              ))}
            </div>
          )}

          {/* Single Layout (one per page) */}
          {layout === "single" && (
            <div className="space-y-8">
              {groupPhotos.map((photo, idx) => (
                <div key={photo.photoId} className="break-after-page">
                  <PhotoCard
                    photo={photo}
                    showAnnotations={showAnnotations}
                    index={idx + 1}
                    fullWidth
                    large
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Summary */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{photos.length}</p>
            <p className="text-sm text-gray-600">Total Photos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {photos.reduce((sum, p) => sum + p.annotations.length, 0)}
            </p>
            <p className="text-sm text-gray-600">Damage Points</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {photos.filter((p) => p.annotations.some((a) => a.severity === "severe")).length}
            </p>
            <p className="text-sm text-gray-600">Severe Areas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {photos.filter((p) => p.annotations.some((a) => a.urgency === "immediate")).length}
            </p>
            <p className="text-sm text-gray-600">Urgent Repairs</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PhotoCardProps {
  photo: AnnotatedPhoto;
  showAnnotations: boolean;
  index: number;
  fullWidth?: boolean;
  large?: boolean;
}

function PhotoCard({
  photo,
  showAnnotations,
  index,
  fullWidth = false,
  large = false,
}: PhotoCardProps) {
  const severityColor = {
    minor: "bg-green-100 text-green-800 border-green-300",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
    severe: "bg-red-100 text-red-800 border-red-300",
    catastrophic: "bg-red-200 text-red-900 border-red-400",
  };

  const urgencyColor = {
    low: "text-green-600",
    medium: "text-yellow-600",
    high: "text-orange-600",
    immediate: "text-red-600",
  };

  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 ${fullWidth ? "w-full" : ""}`}
    >
      {/* Photo */}
      <div className={`relative bg-gray-100 ${large ? "h-96" : fullWidth ? "h-64" : "h-48"}`}>
        <Image src={photo.photoUrl} alt={photo.caption} fill className="object-cover" />
        <div className="absolute left-2 top-2 rounded bg-white px-2 py-1 text-sm font-semibold shadow">
          #{index}
        </div>
        <div className="absolute right-2 top-2 rounded bg-black bg-opacity-75 px-2 py-1 text-xs text-white">
          {photo.annotations.length} damage point
          {photo.annotations.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Caption */}
      <div className="p-4">
        <p className="mb-2 text-sm font-medium text-gray-900">{photo.caption}</p>

        {/* Annotations */}
        {showAnnotations && photo.annotations.length > 0 && (
          <div className="mt-3 space-y-2">
            {photo.annotations.map((ann, idx) => (
              <div
                key={idx}
                className={`rounded border p-2 text-xs ${severityColor[ann.severity]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold capitalize">{ann.type.replace("_", " ")}</span>
                  <span className={`font-semibold ${urgencyColor[ann.urgency]}`}>
                    {ann.urgency.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1 text-gray-700">{ann.description}</p>
                <p className="mt-1 text-gray-500">
                  Confidence: {(ann.confidence * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
