/**
 * ConfirmDeleteDialog — shared confirmation prompt for delete/archive actions
 *
 * Shows "Are you sure?" with option to archive instead of permanently deleting.
 */

"use client";

import { AlertTriangle, Archive, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Label shown on the item being deleted, e.g. the thread subject or claim number */
  itemLabel?: string;
  /** If true, show "Archive Instead" button */
  showArchive?: boolean;
  onConfirmDelete: () => void | Promise<void>;
  onConfirmArchive?: () => void | Promise<void>;
  /** Override labels */
  deleteLabel?: string;
  archiveLabel?: string;
}

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  itemLabel,
  showArchive = true,
  onConfirmDelete,
  onConfirmArchive,
  deleteLabel = "Delete Permanently",
  archiveLabel = "Archive Instead",
}: ConfirmDeleteDialogProps) {
  const [acting, setActing] = useState<"delete" | "archive" | null>(null);

  const handleDelete = async () => {
    setActing("delete");
    try {
      await onConfirmDelete();
    } finally {
      setActing(null);
      onOpenChange(false);
    }
  };

  const handleArchive = async () => {
    if (!onConfirmArchive) return;
    setActing("archive");
    try {
      await onConfirmArchive();
    } finally {
      setActing(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            {description || "This action cannot be undone."}
            {itemLabel && (
              <span className="mt-2 block truncate rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                &ldquo;{itemLabel}&rdquo;
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={acting !== null}
          >
            Cancel
          </Button>

          {showArchive && onConfirmArchive && (
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={handleArchive}
              disabled={acting !== null}
            >
              <Archive className="h-3.5 w-3.5" />
              {acting === "archive" ? "Archiving…" : archiveLabel}
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={handleDelete}
            disabled={acting !== null}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {acting === "delete" ? "Deleting…" : deleteLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
