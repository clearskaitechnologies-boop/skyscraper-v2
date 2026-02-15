"use client";

import { AlertCircle,CheckCircle, Upload, X } from "lucide-react";
import { useCallback,useState } from "react";

import { uploadFile, type UploadProgress } from "@/lib/storage/firebase";

type FileUploadProps = {
  onUploadCompleteAction: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  uploadPathAction: (file: File) => string;
  disabled?: boolean;
};

type FileWithProgress = {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  url?: string;
  error?: string;
};

export default function FirebaseFileUpload({
  onUploadCompleteAction,
  maxFiles = 5,
  acceptedTypes = ["image/*", ".pdf", ".doc", ".docx"],
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  uploadPathAction,
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${Math.round(maxSizeBytes / 1024 / 1024)}MB`;
    }

    const isValidType = acceptedTypes.some((type) => {
      if (type.includes("*")) {
        return file.type.startsWith(type.replace("*", ""));
      }
      return file.name.toLowerCase().endsWith(type);
    });

    if (!isValidType) {
      return `File type not supported. Accepted: ${acceptedTypes.join(", ")}`;
    }

    return null;
  };

  const addFiles = useCallback(
    (newFiles: File[]) => {
      if (disabled) return;

      const validFiles: FileWithProgress[] = [];

      for (const file of newFiles) {
        if (files.length + validFiles.length >= maxFiles) break;

        const error = validateFile(file);
        if (error) {
          validFiles.push({
            file,
            progress: 0,
            status: "error",
            error,
          });
        } else {
          validFiles.push({
            file,
            progress: 0,
            status: "pending",
          });
        }
      }

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [files.length, maxFiles, disabled, maxSizeBytes, acceptedTypes]
  );

  const uploadFile_Internal = async (fileWithProgress: FileWithProgress, index: number) => {
    if (fileWithProgress.status !== "pending") return;

    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: "uploading" as const } : f))
    );

    try {
      const url = await uploadFile(fileWithProgress.file, uploadPathAction(fileWithProgress.file), {
        onProgress: (progress: UploadProgress) => {
          setFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, progress: progress.percentage } : f))
          );
        },
      });

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "completed" as const,
                url,
                progress: 100,
              }
            : f
        )
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "error" as const,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
    }
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");

    // Upload all pending files
    await Promise.all(
      pendingFiles.map((fileWithProgress, originalIndex) => {
        const actualIndex = files.findIndex((f) => f === fileWithProgress);
        return uploadFile_Internal(fileWithProgress, actualIndex);
      })
    );

    // Get completed URLs
    const completedUrls = files.filter((f) => f.status === "completed" && f.url).map((f) => f.url!);

    if (completedUrls.length > 0) {
      onUploadCompleteAction(completedUrls);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [addFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const canUpload = files.some((f) => f.status === "pending");
  const hasCompleted = files.some((f) => f.status === "completed");

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300"} ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-slate-400"
        } `}
      >
        <Upload className="mx-auto mb-4 h-8 w-8 text-slate-400" />
        <p className="mb-2 text-slate-600">
          Drag and drop files here, or{" "}
          <label className="cursor-pointer text-blue-600 hover:text-blue-700">
            browse
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(",")}
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
          </label>
        </p>
        <p className="text-sm text-slate-500">
          Max {maxFiles} files, {Math.round(maxSizeBytes / 1024 / 1024)}MB each
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileWithProgress, index) => (
            <div
              key={`${fileWithProgress.file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {fileWithProgress.status === "completed" && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {fileWithProgress.status === "error" && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {(fileWithProgress.status === "pending" ||
                  fileWithProgress.status === "uploading") && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
                )}
              </div>

              {/* File Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {fileWithProgress.file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(fileWithProgress.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* Progress Bar */}
                {fileWithProgress.status === "uploading" && (
                  <div className="mt-1 h-1 w-full rounded-full bg-slate-200">
                    <div
                      className="h-1 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${fileWithProgress.progress}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {fileWithProgress.error && (
                  <p className="mt-1 text-xs text-red-500">{fileWithProgress.error}</p>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFile(index)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                disabled={fileWithProgress.status === "uploading"}
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={uploadAll}
            disabled={!canUpload || disabled}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Upload {files.filter((f) => f.status === "pending").length} Files
          </button>

          {hasCompleted && (
            <button
              onClick={() => setFiles([])}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
