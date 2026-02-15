"use client";

import { deleteObject, getStorage, ref } from "firebase/storage";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import app from "@/lib/firebase";
import { notify } from "@/lib/toast-utils";

interface ReportViewerProps {
  file: { name: string; url: string } | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function ReportViewerModal({ file, onClose, onDeleted }: ReportViewerProps) {
  const [deleting, setDeleting] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const storage = getStorage(app!);

  if (!file) return null;

  const handleDelete = async () => {
    if (!confirm(`Delete ${file.name}?`)) return;
    setDeleting(true);
    try {
      const fileRef = ref(storage, `uploads/${file.name}`);
      await deleteObject(fileRef);
      notify.success("File deleted successfully!");
      onDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      notify.error("Error deleting file.");
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    notify.loading(`Generating AI Summary for ${file.name}...`);
    // TODO: Connect to your AI summary API endpoint
    setTimeout(() => {
      notify.success("AI Summary generated successfully!");
      setLoadingAI(false);
    }, 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(file.url);
    notify.success("Link copied to clipboard!");
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key="modal"
          className="relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-neutral-50 px-6 py-4">
            <h2 className="text-lg font-semibold">{file.name}</h2>
            <button
              onClick={onClose}
              className="text-lg text-neutral-500 transition hover:text-neutral-700"
            >
              ✕
            </button>
          </div>

          {/* Viewer */}
          <div className="flex flex-1 items-center justify-center bg-neutral-100">
            {file.name.endsWith(".pdf") ? (
              <iframe src={file.url} className="h-full w-full border-none" title={file.name} />
            ) : (
              <img src={file.url} alt={file.name} className="max-h-full object-contain" />
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between border-t bg-white px-6 py-4">
            <div className="flex gap-3">
              <Button onClick={handleGenerateAI} disabled={loadingAI} variant="default" size="sm">
                {loadingAI ? "Generating..." : "Generate AI Summary"}
              </Button>
              <Button onClick={handleShare} variant="secondary" size="sm">
                Share Link
              </Button>
            </div>
            <Button onClick={handleDelete} disabled={deleting} variant="destructive" size="sm">
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
