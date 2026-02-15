import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type SystemType = "Shingle" | "Tile" | "TPO" | "Metal" | "Other";

export type CatalogEntry = {
  brand: string;
  model: string;
  system: SystemType;
  colors: { name: string; hex: string }[];
};

const CATALOG: CatalogEntry[] = [
  {
    brand: "CertainTeed",
    model: "Landmark Pro",
    system: "Shingle",
    colors: [
      { name: "Weathered Wood", hex: "#6b6155" },
      { name: "Moire Black", hex: "#2b2b2b" },
      { name: "Resawn Shake", hex: "#7a5d41" },
    ],
  },
  {
    brand: "GAF",
    model: "Timberline HDZ",
    system: "Shingle",
    colors: [
      { name: "Pewter Gray", hex: "#6a6a6a" },
      { name: "Charcoal", hex: "#3a3a3a" },
      { name: "Weathered Wood", hex: "#6b6155" },
    ],
  },
  {
    brand: "Mule-Hide",
    model: "TPO 60mil",
    system: "TPO",
    colors: [
      { name: "White", hex: "#f5f5f5" },
      { name: "Gray", hex: "#9aa0a6" },
      { name: "Tan", hex: "#c8b49a" },
    ],
  },
  {
    brand: "Boral",
    model: "Concrete S Tile",
    system: "Tile",
    colors: [
      { name: "Terracotta", hex: "#b84a2b" },
      { name: "Sand", hex: "#d9c6a5" },
      { name: "Charcoal", hex: "#3a3a3a" },
    ],
  },
  {
    brand: "Englert",
    model: "24ga Standing Seam",
    system: "Metal",
    colors: [
      { name: "Slate Gray", hex: "#666d73" },
      { name: "Colonial Red", hex: "#7d2a2a" },
      { name: "Evergreen", hex: "#1e5631" },
    ],
  },
];

export type SystemMaterialsProps = {
  value: {
    systemType: string;
    materialSelected: string;
    materialColor: string;
    customSystemLabel?: string;
  };
  onChange: (v: SystemMaterialsProps["value"]) => void;
};

export default function SystemMaterialsSection({ value, onChange }: SystemMaterialsProps) {
  const [tab, setTab] = useState<SystemType>((value.systemType as SystemType) || "Shingle");
  const [customLabel, setCustomLabel] = useState(value.customSystemLabel || "");

  const bySystem = useMemo(() => CATALOG.filter((c) => c.system === tab), [tab]);

  function pickSystem(s: SystemType) {
    setTab(s);
    onChange({ ...value, systemType: s, materialSelected: "", materialColor: "" });
  }

  function pickMaterial(item: CatalogEntry) {
    const label = `${item.brand} ${item.model}`;
    onChange({ ...value, systemType: item.system, materialSelected: label });
  }

  function pickColor(name: string) {
    onChange({ ...value, materialColor: name });
  }

  return (
    <section className="mb-8 space-y-3">
      <h2 className="text-2xl font-semibold">System & Materials</h2>

      <div className="flex flex-wrap gap-2">
        {(["Shingle", "Tile", "TPO", "Metal", "Other"] as SystemType[]).map((s) => (
          <Button
            key={s}
            variant={tab === s ? "default" : "outline"}
            size="sm"
            onClick={() => pickSystem(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {tab === "Other" && (
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Custom system label (e.g., Modified Bitumen)"
            value={customLabel}
            onChange={(e) => {
              setCustomLabel(e.target.value);
              onChange({
                ...value,
                systemType: "Other",
                customSystemLabel: e.target.value,
              });
            }}
          />
          <Input
            placeholder="Material / Model"
            value={value.materialSelected}
            onChange={(e) => onChange({ ...value, materialSelected: e.target.value })}
          />
        </div>
      )}

      {tab !== "Other" && (
        <div className="grid gap-3 md:grid-cols-2">
          {bySystem.map((item) => (
            <div
              key={`${item.brand}-${item.model}`}
              className={`rounded-xl border p-3 ${
                value.materialSelected.includes(item.model) ? "border-primary bg-muted/50" : ""
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {item.brand} — {item.model}
                  </div>
                  <div className="text-xs text-muted-foreground">{item.system}</div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => pickMaterial(item)}>
                  Select
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => pickColor(c.name)}
                    className={`relative h-8 w-8 rounded-full border-2 ${
                      value.materialColor === c.name
                        ? "ring-2 ring-primary ring-offset-2"
                        : "border-border"
                    }`}
                    title={c.name}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>

              {value.materialSelected.includes(item.model) && (
                <div className="mt-2 text-xs">
                  Selected Color: <strong>{value.materialColor || "—"}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="border-t pt-3 text-sm">
        <span className="text-muted-foreground">Selected: </span>
        <span className="font-medium">
          {value.materialSelected || value.systemType}
          {value.materialColor ? ` — ${value.materialColor}` : ""}
          {value.customSystemLabel && value.systemType === "Other"
            ? ` (${value.customSystemLabel})`
            : ""}
        </span>
      </div>
    </section>
  );
}
