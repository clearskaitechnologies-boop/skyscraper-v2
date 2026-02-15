"use client";

// ============================================================================
// TEMPLATES MENU - Phase 5.1: Role Guards
// ============================================================================

import GuardedButton from "@/modules/ui/guards/GuardedButton";

type TemplatesMenuProps = {
  canEdit: boolean;
  onSaveAction: () => void;
  onApplyAction: () => void;
  onDeleteAction: () => void;
};

export function TemplatesMenuGuarded({
  canEdit,
  onSaveAction,
  onApplyAction,
  onDeleteAction,
}: TemplatesMenuProps) {
  return (
    <div className="flex items-center gap-2">
      <GuardedButton canEdit={canEdit} onClick={onSaveAction}>
        Save
      </GuardedButton>
      <GuardedButton canEdit={canEdit} onClick={onApplyAction} variant="secondary">
        Apply
      </GuardedButton>
      <GuardedButton canEdit={canEdit} onClick={onDeleteAction} variant="danger">
        Delete
      </GuardedButton>
    </div>
  );
}
