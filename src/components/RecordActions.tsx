/**
 * RecordActions — client component for delete/archive actions on list pages
 *
 * Drop-in button for server-rendered list pages (claims, leads, jobs)
 * Renders a ⋮ dropdown with Archive and Delete options + confirmation dialog
 */

"use client";

import { Archive, MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecordActionsProps {
  /** API endpoint for DELETE, e.g. /api/claims/abc123 */
  deleteEndpoint: string;
  /** Human-readable label for the record, e.g. "Claim #1204" */
  itemLabel: string;
  /** Entity type label for dialog */
  entityType?: string;
  /** If true, the delete is soft (archive). Adjusts messaging. */
  isSoftDelete?: boolean;
  /** Callback after successful delete/archive */
  onDeleted?: () => void;
}

export default function RecordActions({
  deleteEndpoint,
  itemLabel,
  entityType = "record",
  isSoftDelete = true,
  onDeleted,
}: RecordActionsProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await fetch(deleteEndpoint, { method: "DELETE" });
      if (res.ok) {
        toast.success(
          isSoftDelete
            ? `${entityType} archived successfully`
            : `${entityType} deleted successfully`
        );
        onDeleted?.();
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || `Failed to delete ${entityType.toLowerCase()}`);
      }
    } catch {
      toast.error(`Failed to delete ${entityType.toLowerCase()}`);
    }
  };

  const handleArchive = async () => {
    // For claims/leads, the DELETE endpoint already does soft-delete (archive).
    // So "archive" = same endpoint, just friendlier wording.
    await handleDelete();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            title="Actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {isSoftDelete && (
            <DropdownMenuItem onClick={() => handleArchive()} className="gap-2">
              <Archive className="h-4 w-4" />
              Archive {entityType}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setShowDialog(true)}
            className="gap-2 text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Delete {entityType}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={`Delete this ${entityType.toLowerCase()}?`}
        description={
          isSoftDelete
            ? `This will archive the ${entityType.toLowerCase()}. It can be restored later if needed.`
            : `This will permanently delete the ${entityType.toLowerCase()}. This action cannot be undone.`
        }
        itemLabel={itemLabel}
        showArchive={false}
        onConfirmDelete={handleDelete}
        deleteLabel={isSoftDelete ? "Archive & Remove" : "Delete Permanently"}
      />
    </>
  );
}
