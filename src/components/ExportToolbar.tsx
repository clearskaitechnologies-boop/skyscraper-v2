"use client";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  EXPORT_PROFILES,
  type ExportProfileKey,
  resolveSectionsForExport,
  type SectionKey,
} from "@/lib/exportProfiles";

export type ExportToolbarProps = {
  proposalType: ExportProfileKey;
  selectedSections: SectionKey[];
  onBeforeExport: (
    sections: SectionKey[],
    profile: ExportProfileKey
  ) => Promise<Blob | void> | Blob | void;
};

export default function ExportToolbar({
  proposalType,
  selectedSections,
  onBeforeExport,
}: ExportToolbarProps) {
  const [profile, setProfile] = useState<ExportProfileKey>(proposalType);
  const [active, setActive] = useState<SectionKey[]>(selectedSections);
  const resolved = useMemo(() => resolveSectionsForExport(profile, active), [profile, active]);

  function toggle(k: SectionKey) {
    setActive((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  }

  async function doExport() {
    await onBeforeExport(resolved, profile);
  }

  return (
    <div className="space-y-2 rounded-2xl border p-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Export Profile</div>
        <div className="flex gap-2">
          {(Object.keys(EXPORT_PROFILES) as ExportProfileKey[]).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={profile === k ? "default" : "outline"}
              onClick={() => setProfile(k)}
            >
              {EXPORT_PROFILES[k].label}
            </Button>
          ))}
          <Button size="sm" onClick={doExport}>
            🧾 Export
          </Button>
        </div>
      </div>
      <div className="text-xs opacity-60">Which sections to include (after applying profile):</div>
      <div className="flex flex-wrap gap-2">
        {active.map((k) => (
          <label
            key={k}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${resolved.includes(k) ? "bg-muted" : "opacity-50"}`}
          >
            <input type="checkbox" checked={resolved.includes(k)} onChange={() => toggle(k)} />
            <span className="text-sm">{k}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
