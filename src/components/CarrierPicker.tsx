"use client";

import { useState } from "react";

export type CarrierKey = "STATE_FARM" | "AAA" | "FARMERS" | "ALLSTATE" | "USAA";
export const CARRIERS: { key: CarrierKey; label: string }[] = [
  { key: "STATE_FARM", label: "State Farm" },
  { key: "AAA", label: "AAA" },
  { key: "FARMERS", label: "Farmers" },
  { key: "ALLSTATE", label: "Allstate" },
  { key: "USAA", label: "USAA" },
];

export function CarrierPicker({
  value,
  onChangeAction,
  className = "",
  label = "Carrier",
}: {
  value?: CarrierKey;
  onChangeAction: (k: CarrierKey) => void;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <button
        type="button"
        className="w-full rounded-md border bg-background px-3 py-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        {CARRIERS.find(c => c.key === value)?.label ?? "Select…"}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-sm">
          {CARRIERS.map((c) => (
            <button
              key={c.key}
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-accent"
              onClick={() => {
                onChangeAction(c.key);
                setOpen(false);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
