// src/components/weather/PDFPreviewModal.tsx
"use client";

import React from "react";

export type PDFPreviewModalProps = {
  pdfUrl: string;
  onClose: () => void;
};

export function PDFPreviewModal({ pdfUrl, onClose }: PDFPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-5/6 w-11/12 max-w-6xl flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Weather Verification PDF</h2>
          <div className="flex gap-2">
            <a
              href={pdfUrl}
              download
              className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
            >
              Download
            </a>
            <button onClick={onClose} className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300">
              Close
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe src={pdfUrl} className="h-full w-full border-0" title="Weather PDF Preview" />
        </div>
        <div className="border-t p-2 text-xs text-gray-500">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            {pdfUrl}
          </a>
        </div>
      </div>
    </div>
  );
}
