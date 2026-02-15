"use client";

import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import app from "@/lib/firebase";
import { notify } from "@/lib/toast-utils";

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete?: () => void;
}

export default function UploadModal({ onClose, onUploadComplete }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{
      name: string;
      progress: number;
      status: "uploading" | "completed" | "error";
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storage = getStorage(app!);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    // Filter for allowed file types
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        notify.error(`File type not supported: ${file.name}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        notify.error(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Initialize upload states
    const initialStates = validFiles.map((file) => ({
      name: file.name,
      progress: 0,
      status: "uploading" as const,
    }));
    setUploadingFiles(initialStates);

    // Upload each file
    validFiles.forEach(async (file, index) => {
      try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `uploads/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Progress tracking
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadingFiles((prev) =>
              prev.map((item, i) => (i === index ? { ...item, progress } : item))
            );
          },
          (error) => {
            // Error handling
            console.error("Upload error:", error);
            setUploadingFiles((prev) =>
              prev.map((item, i) => (i === index ? { ...item, status: "error" } : item))
            );
            notify.error(`Upload failed: ${file.name}`);
          },
          async () => {
            // Success
            setUploadingFiles((prev) =>
              prev.map((item, i) =>
                i === index ? { ...item, status: "completed", progress: 100 } : item
              )
            );
            notify.success(`Upload completed: ${file.name}`);

            // Check if all files are done
            const allCompleted = uploadingFiles.every(
              (item, i) => i === index || item.status === "completed" || item.status === "error"
            );
            if (allCompleted && onUploadComplete) {
              onUploadComplete();
            }
          }
        );
      } catch (error) {
        console.error("Upload initialization error:", error);
        setUploadingFiles((prev) =>
          prev.map((item, i) => (i === index ? { ...item, status: "error" } : item))
        );
        notify.error(`Upload failed: ${file.name}`);
      }
    });
  };

  const clearCompleted = () => {
    setUploadingFiles((prev) => prev.filter((file) => file.status === "uploading"));
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#081A2F]">Upload Files</h2>
            <button
              onClick={onClose}
              className="text-lg text-neutral-500 transition hover:text-neutral-700"
            >
              ✕
            </button>
          </div>

          {/* Drop Zone */}
          <div
            className={`rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
              isDragging
                ? "border-[#147BFF] bg-[#147BFF]/5"
                : "border-neutral-300 hover:border-[#147BFF]/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-accent">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Drop files here or click to browse</h3>
            <p className="mb-4 text-neutral-600">
              Support for PDF, JPEG, PNG, and GIF files up to 10MB
            </p>
            <Button onClick={() => fileInputRef.current?.click()} variant="default" size="sm">
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Choose files to upload"
            />
          </div>

          {/* Upload Progress */}
          {uploadingFiles.length > 0 && (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Upload Progress</h3>
                <button
                  onClick={clearCompleted}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Clear Completed
                </button>
              </div>
              <div className="space-y-3">
                {uploadingFiles.map((file, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="truncate font-medium">{file.name}</span>
                      <span
                        className={`text-sm ${
                          file.status === "completed"
                            ? "text-green-600"
                            : file.status === "error"
                              ? "text-red-600"
                              : "text-[#147BFF]"
                        }`}
                      >
                        {file.status === "completed"
                          ? "Complete"
                          : file.status === "error"
                            ? "Failed"
                            : `${Math.round(file.progress)}%`}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-200">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          file.status === "completed"
                            ? "bg-green-500"
                            : file.status === "error"
                              ? "bg-red-500"
                              : "bg-[#147BFF]"
                        }`}
                        {...{ style: { width: `${file.progress}%` } }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 rounded-lg bg-neutral-50 p-4">
            <h4 className="mb-2 font-medium">Tips for best results:</h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>• Use high-resolution images for better AI analysis</li>
              <li>• PDF files should be text-readable (not scanned images)</li>
              <li>• Multiple angles of damage help generate better reports</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
