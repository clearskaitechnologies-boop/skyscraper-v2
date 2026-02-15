import { useEffect, useMemo, useState } from "react";

import { ALL_SECTIONS, PRESETS, type ProposalType, type SectionKey } from "@/lib/proposalPresets";

export default function ProposalTypePicker({
  report,
  onChange,
}: {
  report: any;
  onChange: (v: { type: ProposalType; sections: SectionKey[] }) => void;
}) {
  const [type, setType] = useState<ProposalType>(report?.report_data?.proposalType || "retail");
  const [sections, setSections] = useState<SectionKey[]>(
    report?.report_data?.sections || PRESETS[type]
  );

  useEffect(() => {
    setSections(PRESETS[type]);
  }, [type]);
  useEffect(() => {
    onChange({ type, sections });
  }, [type, sections, onChange]);

  const ordered = useMemo(() => {
    const keys = Object.keys(ALL_SECTIONS) as SectionKey[];
    return keys.map((k) => ({ key: k, label: ALL_SECTIONS[k], selected: sections.includes(k) }));
  }, [sections]);

  function toggle(k: SectionKey) {
    setSections((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-sm font-medium">Report Type</div>
        <div className="flex flex-wrap gap-2">
          {(["retail", "insurance", "comprehensive"] as ProposalType[]).map((t) => (
            <button
              key={t}
              className={`rounded-full border px-3 py-1 text-sm ${t === type ? "border-foreground bg-muted" : "border-border"}`}
              onClick={() => setType(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium">Select Proposal Sections</div>
        <div className="grid gap-2 md:grid-cols-2">
          {ordered.map(({ key, label, selected }) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 ${selected ? "border-foreground bg-muted" : "border-border"}`}
            >
              <input type="checkbox" checked={selected} onChange={() => toggle(key)} />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
