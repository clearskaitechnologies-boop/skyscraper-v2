"use client";

import { Download, Loader2,X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  onDownload: () => void;
  isGenerating?: boolean;
}

export function PdfPreviewModal({
  isOpen,
  onClose,
  pdfUrl,
  onDownload,
  isGenerating = false,
}: PdfPreviewModalProps) {
  const [loading, setLoading] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[90vh] max-w-6xl flex-col">
        <DialogHeader>
          <DialogTitle>PDF Preview</DialogTitle>
          <DialogDescription>Review your report before downloading</DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
          {isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-4 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                <p className="text-gray-600 dark:text-gray-400">Generating PDF preview...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-950">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                className="h-full w-full border-0"
                onLoad={() => setLoading(false)}
                title="PDF Preview"
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">No PDF available to preview</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
          <Button onClick={onDownload} disabled={!pdfUrl || isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
