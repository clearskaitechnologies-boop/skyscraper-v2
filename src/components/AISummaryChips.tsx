import { useState } from "react";

import { Button } from "@/components/ui/button";

const PRESETS = [
  { k: "short", label: "Short Summary", sys: "Summarize briefly in 3-5 bullet points." },
  {
    k: "client",
    label: "Client-Friendly",
    sys: "Rewrite for a homeowner with clear, non-technical language.",
  },
  {
    k: "ins",
    label: "Insurance-Ready",
    sys: "Summarize using claim-adjuster terminology, include damage extent.",
  },
  {
    k: "action",
    label: "Next Steps",
    sys: "Extract next steps with responsible party and timeline.",
  },
];

interface AISummaryChipsProps {
  onRun: (presetKey: string, systemPrompt: string) => Promise<void> | void;
}

export function AISummaryChips({ onRun }: AISummaryChipsProps) {
  const [busy, setBusy] = useState<string>("");

  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((p) => (
        <Button
          key={p.k}
          variant="outline"
          size="sm"
          disabled={!!busy}
          className="rounded-full"
          aria-label={`Run ${p.label}`}
          onClick={async () => {
            setBusy(p.k);
            try {
              await onRun(p.k, p.sys);
            } finally {
              setBusy("");
            }
          }}
        >
          {busy === p.k ? "…" : p.label}
        </Button>
      ))}
    </div>
  );
}
