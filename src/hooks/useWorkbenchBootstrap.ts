/**
 * Bootstrap hook for auto-starting workbench with mode-specific prompts
 */
import { useEffect } from "react";

import { useQueryParams } from "./useQueryParams";

export type WorkbenchMode = "retail" | "insurance" | "inspection";

const MODE_PROMPTS: Record<WorkbenchMode, string> = {
  retail:
    "Create a customer-friendly retail proposal summary from uploaded photos and notes. Include materials, options, and payment schedule.",
  insurance:
    "Draft an insurance claim summary using photos, storm verification, and applicable code clauses. Be concise, objective, and carrier-ready.",
  inspection:
    "Summarize observed roof conditions from photos and notes. Identify damages, materials, and risk items with clear next steps.",
};

interface UseWorkbenchBootstrapProps {
  onSeedPrompt: (text: string) => void;
  ensureUploadVisible?: () => void;
}

export function useWorkbenchBootstrap({
  onSeedPrompt,
  ensureUploadVisible,
}: UseWorkbenchBootstrapProps) {
  const query = useQueryParams();

  useEffect(() => {
    const mode = (query.get("mode") || "insurance") as WorkbenchMode;
    const seedPrompt = MODE_PROMPTS[mode];

    // Set the seed prompt
    onSeedPrompt(seedPrompt);

    // Scroll to upload section if needed
    if (ensureUploadVisible) {
      setTimeout(() => {
        ensureUploadVisible();
      }, 500);
    }
  }, [query, onSeedPrompt, ensureUploadVisible]);

  return {
    mode: (query.get("mode") || "insurance") as WorkbenchMode,
  };
}
