import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type OverviewSectionProps = {
  aiSummary: string;
  onAiSummary: (v: string) => void;
  customNotes: string;
  onCustomNotes: (v: string) => void;
  damageScore?: string;
  onDamageScore?: (v: string) => void;
  busy?: boolean;
  summarize: () => Promise<void>;
};

export default function OverviewSection({
  aiSummary,
  onAiSummary,
  customNotes,
  onCustomNotes,
  damageScore,
  onDamageScore,
  busy,
  summarize,
}: OverviewSectionProps) {
  const [localNotes, setLocalNotes] = useState(customNotes);

  function handleBlur() {
    if (localNotes !== customNotes) onCustomNotes(localNotes);
  }

  return (
    <section className="mb-8 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Overview of Damage</h2>
        <Button size="sm" onClick={summarize} disabled={!!busy}>
          ⚡ AI-Generate
        </Button>
      </div>

      {aiSummary ? (
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            AI-Generated Summary
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{aiSummary}</pre>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Use AI-Generate to pull a structured summary from your inputs.
        </p>
      )}

      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Custom Notes
        </div>
        <Textarea
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          onBlur={handleBlur}
          placeholder="Add on-site observations, access notes, HOA/permit details, etc."
          className="min-h-[100px]"
        />
      </div>

      {onDamageScore && (
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Damage Score
          </div>
          <input
            className="w-[100px] rounded border px-3 py-2"
            type="text"
            value={damageScore || ""}
            onChange={(e) => onDamageScore(e.target.value)}
            placeholder="1–10"
          />
          {damageScore && (
            <div className="h-2 w-48 overflow-hidden rounded bg-muted">
              <div
                className="h-2 bg-primary"
                style={{
                  width: `${Math.min(100, Math.max(0, Number(damageScore) * 10))}%`,
                }}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
