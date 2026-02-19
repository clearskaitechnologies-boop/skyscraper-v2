// src/app/(app)/claims/[claimId]/photos/page.tsx
"use client";

import {
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  X,
  ZoomIn,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import PhotoOverlay, { type DamageBox } from "@/components/photos/PhotoOverlay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClaimPhotoUpload } from "@/components/uploads";
import { logger } from "@/lib/logger";

import SectionCard from "../_components/SectionCard";

interface AICaption {
  materialType?: string;
  damageType?: string;
  functionalImpact?: string;
  applicableCode?: string;
  dolTieIn?: string;
  summary?: string;
}

interface Photo {
  id: string;
  filename: string;
  publicUrl: string;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
  note?: string;
  // AI Analysis fields
  aiCaption?: AICaption;
  damageBoxes?: DamageBox[];
  severity?: "none" | "minor" | "moderate" | "severe";
  confidence?: number;
  analyzed?: boolean;
}

export default function PhotosPage() {
  const params = useParams();
  const claimIdParam = params?.claimId;
  const claimId = Array.isArray(claimIdParam) ? claimIdParam[0] : claimIdParam;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "analysis">("grid");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label?: string } | null>(null);

  const fetchPhotos = async () => {
    if (!claimId) return;
    try {
      const res = await fetch(`/api/claims/${claimId}/photos`);
      const data = await res.json();
      if (data.photos) {
        setPhotos(data.photos);
      }
    } catch (error) {
      logger.error("Failed to fetch photos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimId]);

  if (!claimId) return null;

  const handleUploadComplete = async () => {
    await fetchPhotos();
  };

  const handleDelete = (photoId: string) => {
    setDeleteTarget({ id: photoId });
  };

  const confirmDeletePhoto = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/claims/${claimId}/files/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      }
    } catch (error) {
      logger.error("Delete error:", error);
    }
  };

  const handleAnalyze = async (photoId: string) => {
    setAnalyzing(photoId);

    const photo = photos.find((p) => p.id === photoId);
    if (!photo) {
      setAnalyzing(null);
      return;
    }

    try {
      const res = await fetch("/api/photos/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: photo.publicUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        logger.error("AI analysis error:", data.error);
        alert(data.error || "AI analysis failed");
        setAnalyzing(null);
        return;
      }

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? {
                ...p,
                analyzed: true,
                severity: data.severity,
                confidence: data.confidence,
                aiCaption: data.aiCaption,
                damageBoxes: data.damageBoxes,
              }
            : p
        )
      );
    } catch (error) {
      logger.error("Analyze error:", error);
      alert("Failed to run AI analysis. Please try again.");
    }

    setAnalyzing(null);
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "severe":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "moderate":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "minor":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const analyzedCount = photos.filter((p) => p.analyzed).length;
  const severeCount = photos.filter((p) => p.severity === "severe").length;

  return (
    <SectionCard title="Photos & AI Analysis">
      {/* Stats Bar */}
      {photos.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-500" />
            <span className="font-medium">{photos.length} Photos</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>{analyzedCount} Analyzed</span>
          </div>
          {severeCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-600 dark:text-red-400">{severeCount} Severe</span>
            </div>
          )}
          <div className="ml-auto">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "analysis")}>
              <TabsList className="h-8">
                <TabsTrigger value="grid" className="text-xs">
                  Grid View
                </TabsTrigger>
                <TabsTrigger value="analysis" className="text-xs">
                  Analysis View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      {/* Upload Component */}
      <div className="mb-8">
        <ClaimPhotoUpload claimId={claimId} onUploadComplete={handleUploadComplete} />
      </div>

      {/* Photos Display */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : photos.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <ImageIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-300">
            No photos yet. Upload your first photo above.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-slate-200 transition-all hover:shadow-lg dark:border-slate-700"
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* Photo with overlay if analyzed */}
              {photo.analyzed && photo.damageBoxes && photo.damageBoxes.length > 0 ? (
                <div className="relative h-full w-full">
                  <img
                    src={photo.publicUrl}
                    alt={photo.filename}
                    className="h-full w-full object-cover"
                  />
                  {/* Damage boxes overlay - inline styles required for dynamic positioning */}
                  {photo.damageBoxes.map((box, i) => (
                    <div
                      key={i}
                      className="absolute border-2 border-red-500 bg-red-500/10"
                      // eslint-disable-next-line react/forbid-dom-props
                      style={{
                        left: `${box.x * 100}%`,
                        top: `${box.y * 100}%`,
                        width: `${box.w * 100}%`,
                        height: `${box.h * 100}%`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={photo.publicUrl}
                  alt={photo.filename}
                  className="h-full w-full object-cover"
                />
              )}

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(photo.id);
                }}
                className="absolute right-2 top-2 rounded-full bg-red-500/80 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                aria-label="Delete photo"
                title="Delete photo"
              >
                <X className="h-4 w-4" />
              </button>

              {/* AI Badge */}
              {photo.analyzed && (
                <div className="absolute left-2 top-2">
                  <Badge className={getSeverityColor(photo.severity)}>
                    <Sparkles className="mr-1 h-3 w-3" />
                    {photo.severity}
                  </Badge>
                </div>
              )}

              {/* Bottom info bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="truncate text-xs text-white">{photo.filename}</p>
                {photo.aiCaption?.damageType && (
                  <p className="truncate text-xs text-blue-300">{photo.aiCaption.damageType}</p>
                )}
              </div>

              {/* Analyze button for non-analyzed photos */}
              {!photo.analyzed && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnalyze(photo.id);
                    }}
                    disabled={analyzing === photo.id}
                  >
                    {analyzing === photo.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Analysis View - Detailed cards */
        <div className="space-y-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              {/* Thumbnail with overlay */}
              <div
                className="relative h-32 w-32 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setSelectedPhoto(photo)}
              >
                {photo.analyzed && photo.damageBoxes ? (
                  <PhotoOverlay
                    url={photo.publicUrl}
                    boxes={photo.damageBoxes}
                    showControls={false}
                  />
                ) : (
                  <img
                    src={photo.publicUrl}
                    alt={photo.filename}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                  <ZoomIn className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{photo.filename}</h3>
                    {photo.analyzed && (
                      <div className="mt-1 flex items-center gap-2">
                        <Badge className={getSeverityColor(photo.severity)}>{photo.severity}</Badge>
                        {photo.confidence && (
                          <span className="text-xs text-slate-500">
                            {Math.round(photo.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {!photo.analyzed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnalyze(photo.id)}
                      disabled={analyzing === photo.id}
                    >
                      {analyzing === photo.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* AI Caption */}
                {photo.aiCaption && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        Material:
                      </span>{" "}
                      <span className="text-slate-900 dark:text-white">
                        {photo.aiCaption.materialType}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        Damage:
                      </span>{" "}
                      <span className="text-red-600 dark:text-red-400">
                        {photo.aiCaption.damageType}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        Impact:
                      </span>{" "}
                      <span className="text-slate-900 dark:text-white">
                        {photo.aiCaption.functionalImpact}
                      </span>
                    </p>
                    {photo.aiCaption.applicableCode && (
                      <p>
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          Code:
                        </span>{" "}
                        <span className="text-blue-600 dark:text-blue-400">
                          {photo.aiCaption.applicableCode}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {!photo.analyzed && (
                  <p className="mt-2 text-sm text-slate-500">
                    Click &quot;Analyze&quot; to run AI damage detection on this photo.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Detail Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.title}</DialogTitle>
            <DialogDescription>
              {selectedPhoto?.analyzed
                ? `AI Analysis: ${selectedPhoto.aiCaption?.summary || "Analysis complete"}`
                : "Photo not yet analyzed"}
            </DialogDescription>
          </DialogHeader>

          {selectedPhoto && (
            <div className="space-y-4">
              {/* Large photo with overlay */}
              <div className="relative overflow-hidden rounded-lg">
                {selectedPhoto.analyzed && selectedPhoto.damageBoxes ? (
                  <PhotoOverlay
                    url={selectedPhoto.publicUrl}
                    boxes={selectedPhoto.damageBoxes}
                    showControls={true}
                    onBoxesChange={(newBoxes) => {
                      setPhotos((prev) =>
                        prev.map((p) =>
                          p.id === selectedPhoto.id ? { ...p, damageBoxes: newBoxes } : p
                        )
                      );
                      setSelectedPhoto({ ...selectedPhoto, damageBoxes: newBoxes });
                    }}
                  />
                ) : (
                  <img
                    src={selectedPhoto.publicUrl}
                    alt={selectedPhoto.filename}
                    className="h-auto w-full rounded-lg"
                  />
                )}
              </div>

              {/* Analysis details */}
              {selectedPhoto.aiCaption && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Analysis Results
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Material Type</p>
                      <p className="text-sm">{selectedPhoto.aiCaption.materialType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Damage Type</p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {selectedPhoto.aiCaption.damageType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Functional Impact</p>
                      <p className="text-sm">{selectedPhoto.aiCaption.functionalImpact}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Applicable Code</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {selectedPhoto.aiCaption.applicableCode}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-medium text-slate-500">Date of Loss Correlation</p>
                      <p className="text-sm">{selectedPhoto.aiCaption.dolTieIn}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {!selectedPhoto.analyzed && (
                  <Button
                    onClick={() => handleAnalyze(selectedPhoto.id)}
                    disabled={analyzing === selectedPhoto.id}
                  >
                    {analyzing === selectedPhoto.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Run AI Analysis
                      </>
                    )}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedPhoto(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Photo"
        description="This photo will be permanently removed."
        showArchive={false}
        onConfirmDelete={confirmDeletePhoto}
      />
    </SectionCard>
  );
}
