import { useState } from "react";

import type { ProposalType, SectionKey } from "@/components/pages/ReportWorkbench";
import { Button } from "@/components/ui/button";

export type ReportTypeLockProps = {
  proposalType: ProposalType;
  selectedSections: SectionKey[];
  onApply: (sections: SectionKey[]) => void;
};

const MAP: Record<ProposalType, SectionKey[]> = {
  retail: [
    "cover",
    "overview",
    "code",
    "mockup",
    "timeline",
    "pricing",
    "materials",
    "warranty",
    "signature",
  ],
  insurance: [
    "cover",
    "overview",
    "code",
    "timeline",
    "photos",
    "weather",
    "supplements",
    "warranty",
    "signature",
  ],
  comprehensive: [
    "cover",
    "overview",
    "code",
    "mockup",
    "timeline",
    "pricing",
    "materials",
    "photos",
    "weather",
    "supplements",
    "warranty",
    "signature",
  ],
};

export default function ReportTypeLock({
  proposalType,
  selectedSections,
  onApply,
}: ReportTypeLockProps) {
  const [temp, setTemp] = useState<SectionKey[]>(selectedSections);
  const defaults = MAP[proposalType];

  function applyDefault() {
    setTemp(defaults);
  }
  function toggle(k: SectionKey) {
    setTemp((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  }

  return (
    <div className="space-y-2 rounded-2xl border p-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Lock Sections for Export</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={applyDefault}>
            Reset to {proposalType}
          </Button>
          <Button size="sm" onClick={() => onApply(temp)}>
            Apply
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from(new Set(Object.values(MAP).flat())).map((k) => (
          <label
            key={k}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${
              temp.includes(k) ? "bg-muted/50" : ""
            }`}
          >
            <input type="checkbox" checked={temp.includes(k)} onChange={() => toggle(k)} />
            <span className="text-sm capitalize">{k.replace(/_/g, " ")}</span>
          </label>
        ))}
      </div>
      <div className="text-xs opacity-60">
        This snapshot only affects the next PDF export; your master selection stays unchanged.
      </div>
    </div>
  );
}
