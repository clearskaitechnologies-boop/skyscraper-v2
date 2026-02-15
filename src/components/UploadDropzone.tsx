"use client";

import { AlertCircle, CheckCircle, File, FileText, Image, Lock,Upload, X } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UploadedFile {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl: string;
  category?: string;
  note?: string;
}

interface UploadQueueItem {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  result?: UploadedFile;
  error?: string;
}

export default function UploadDropzone({
  leadId,
  claimId,
  onUploadedAction,
  category = "other",
  note,
}: {
  leadId?: string;
  claimId?: string;
  onUploadedAction?: (f: UploadedFile) => void;
  category?: "damage" | "estimate" | "invoice" | "carrier" | "other";
  note?: string;
}) {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [uploadNote, setUploadNote] = useState(note || "");

  // Check storage status
  const { data: storageData } = useSWR("/api/health/storage", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000,
  });

  const storageEnabled = storageData?.enabled ?? true;
  const storageReady = storageData?.ready ?? true;
  const isStorageDisabled = !storageEnabled || !storageReady;

  const isUploading = uploadQueue.some((item) => item.status === "uploading");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    // Convert FileList to Array for easier handling
    const fileArray = Array.from(files);

    // Validate bulk limits
    if (fileArray.length > 10) {
      setError("Maximum 10 files per upload");
      return;
    }

    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 200 * 1024 * 1024) {
      setError("Total file size exceeds 200MB limit");
      return;
    }

    // Client-side validation for each file
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const maxSize = file.type.startsWith("image/") ? 25 * 1024 * 1024 : 50 * 1024 * 1024;

      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (max ${maxSize / 1024 / 1024}MB)`);
        continue;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not allowed`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join("; "));
      return;
    }

    if (validFiles.length === 0) {
      setError("No valid files to upload");
      return;
    }

    // Add files to upload queue
    const newQueueItems: UploadQueueItem[] = validFiles.map((file) => ({
      file,
      status: "pending",
      progress: 0,
    }));

    setUploadQueue((prev) => [...prev, ...newQueueItems]);
    setError(null);

    // Start upload process
    await uploadFiles(newQueueItems);
  }

  async function uploadFiles(queueItems: UploadQueueItem[]) {
    const form = new FormData();

    // Add all files to FormData
    queueItems.forEach((item) => {
      form.append("file", item.file);
    });

    // Add metadata
    if (leadId) form.append("leadId", leadId);
    if (claimId) form.append("claimId", claimId);
    form.append("category", selectedCategory);
    if (uploadNote.trim()) form.append("note", uploadNote.trim());

    // Update queue status to uploading
    setUploadQueue((prev) =>
      prev.map((item) =>
        queueItems.includes(item) ? { ...item, status: "uploading", progress: 0 } : item
      )
    );

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402 && data.code === "INSUFFICIENT_TOKENS") {
          setError(`Insufficient tokens. You have ${data.remaining || 0} tokens remaining.`);
        } else {
          setError(data?.error || "Upload failed");
        }

        // Mark all as error
        setUploadQueue((prev) =>
          prev.map((item) =>
            queueItems.includes(item)
              ? {
                  ...item,
                  status: "error",
                  error: data?.error || "Upload failed",
                }
              : item
          )
        );
        return;
      }

      // Handle successful uploads and errors
      const { uploaded, errors: uploadErrors } = data;

      setUploadQueue((prev) =>
        prev.map((item) => {
          if (!queueItems.includes(item)) return item;

          // Find corresponding result
          const success = uploaded.find((u: any) => u.filename === item.file.name);
          const error = uploadErrors.find((e: any) => e.filename === item.file.name);

          if (success) {
            // Call success callback
            onUploadedAction?.(success);
            return {
              ...item,
              status: "success",
              progress: 100,
              result: success,
            };
          } else if (error) {
            return { ...item, status: "error", error: error.error };
          } else {
            return { ...item, status: "error", error: "Unknown error" };
          }
        })
      );
    } catch (err) {
      setError("Upload failed. Please try again.");
      setUploadQueue((prev) =>
        prev.map((item) =>
          queueItems.includes(item) ? { ...item, status: "error", error: "Network error" } : item
        )
      );
    }
  }

  const clearQueue = () => {
    setUploadQueue((prev) => prev.filter((item) => item.status === "uploading"));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (mimeType === "application/pdf") return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getStatusIcon = (status: UploadQueueItem["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "uploading":
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        );
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Storage Disabled State */}
      {isStorageDisabled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Uploads temporarily disabled</p>
              <p className="text-xs text-amber-600">
                We'll enable uploads as soon as billing is verified.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Configuration */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={isUploading || isStorageDisabled}
            title="Select file category"
            aria-disabled={isStorageDisabled ? "true" : "false"}
          >
            <option value="damage">Damage Photos</option>
            <option value="estimate">Estimates</option>
            <option value="invoice">Invoices</option>
            <option value="carrier">Insurance Documents</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Note (Optional)</label>
          <input
            type="text"
            value={uploadNote}
            onChange={(e) => setUploadNote(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Add a note about these files..."
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!isStorageDisabled) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => {
          if (!isStorageDisabled) {
            document.getElementById("fileInput")?.click();
          }
        }}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragOver && !isStorageDisabled
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${
          isUploading || isStorageDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        } `}
      >
        {!isStorageDisabled && (
          <input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            accept="image/*,application/pdf"
            disabled={isUploading || isStorageDisabled}
            multiple
            title="Select files to upload"
          />
        )}

        <div className="flex flex-col items-center space-y-2">
          {isUploading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}

          <div className="text-sm text-gray-600">
            {isUploading ? (
              "Uploading files..."
            ) : (
              <>
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Up to 10 files • Photos (25MB max) or PDFs (50MB max) • Total 200MB max
          </div>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Upload Queue ({uploadQueue.length})</h4>
            {!isUploading && (
              <button onClick={clearQueue} className="text-xs text-gray-500 hover:text-gray-700">
                Clear completed
              </button>
            )}
          </div>

          <div className="max-h-60 space-y-1 overflow-y-auto">
            {uploadQueue.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 rounded-md bg-gray-50 p-2">
                {getStatusIcon(item.status)}
                {getFileIcon(item.file.type)}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">{item.file.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(item.file.size)}
                    {item.status === "error" && item.error && (
                      <span className="ml-2 text-red-500">• {item.error}</span>
                    )}
                  </div>
                </div>
                {item.status === "uploading" && (
                  <div className="text-xs text-gray-500">{item.progress}%</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
          <span className="text-sm text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
            title="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
