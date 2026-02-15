"use client";

// ============================================================================
// RIGHT PANEL - Phase 5.1: Role Guards
// ============================================================================

import GuardedButton from "@/modules/ui/guards/GuardedButton";

type RightPanelProps = {
  canEdit: boolean;
  onRunAIAction: () => void;
  onExportAction: () => void;
};

export function RightPanelGuarded({ canEdit, onRunAIAction, onExportAction }: RightPanelProps) {
  return (
    <div className="space-y-3">
      <GuardedButton canEdit={canEdit} onClick={onRunAIAction}>
        Run AI
      </GuardedButton>
      <GuardedButton canEdit={canEdit} onClick={onExportAction} variant="secondary">
        Export
      </GuardedButton>
    </div>
  );
}
