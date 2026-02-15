import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type SupplementItem = {
  id: string;
  type: "code" | "mfr" | "safety" | "access" | "complexity" | "admin";
  label: string;
  justification?: string;
  checked?: boolean;
  estCost?: number;
};

export type SupplementsState = {
  items: SupplementItem[];
  includeOP?: boolean;
  opNote?: string;
};

export type SupplementsSectionProps = {
  value: SupplementsState;
  onChange: (v: SupplementsState) => void;
  proposalType?: "retail" | "insurance" | "comprehensive";
};

export default function SupplementsSection({
  value,
  onChange,
  proposalType = "insurance",
}: SupplementsSectionProps) {
  const [busy, setBusy] = useState(false);
  const v = useMemo<SupplementsState>(
    () => ({ includeOP: true, ...value, items: value?.items || [] }),
    [value]
  );

  function upd(patch: Partial<SupplementsState>) {
    onChange({ ...v, ...patch });
  }

  function addManual() {
    const label = prompt("Add supplement item:")?.trim();
    if (!label) return;
    upd({
      items: [...v.items, { id: crypto.randomUUID(), type: "code", label, checked: true }],
    });
  }

  function toggle(id: string) {
    const next = v.items.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it));
    upd({ items: next });
  }

  function update(ix: number, patch: Partial<SupplementItem>) {
    const next = [...v.items];
    next[ix] = { ...next[ix], ...patch };
    upd({ items: next });
  }

  function remove(id: string) {
    upd({ items: v.items.filter((x) => x.id !== id) });
  }

  const groups = useMemo(() => groupByType(v.items), [v.items]);

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Supplement Requests</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addManual}>
            + Add
          </Button>
        </div>
      </div>

      {proposalType !== "retail" && (
        <div className="flex items-center gap-3 rounded-xl border bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!v.includeOP}
              onChange={(e) => upd({ includeOP: e.target.checked })}
            />
            <span className="text-sm">Include O&P justification</span>
          </div>
          <Input
            className="flex-1"
            value={v.opNote || ""}
            onChange={(e) => upd({ opNote: e.target.value })}
            placeholder="O&P justification"
          />
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {(["code", "mfr", "safety", "access", "complexity", "admin"] as const).map((bucket) => (
          <div key={bucket} className="rounded-xl border p-3">
            <div className="mb-2 font-medium">{title(bucket)}</div>
            <ul className="space-y-2">
              {groups[bucket].map((it, ix) => (
                <li key={it.id} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={!!it.checked} onChange={() => toggle(it.id)} />
                    <Input
                      value={it.label}
                      onChange={(e) => update(ixOf(v.items, it.id), { label: e.target.value })}
                    />
                    <Button size="sm" variant="ghost" onClick={() => remove(it.id)}>
                      ✕
                    </Button>
                  </div>
                  <Textarea
                    className="text-xs"
                    value={it.justification || ""}
                    onChange={(e) =>
                      update(ixOf(v.items, it.id), {
                        justification: e.target.value,
                      })
                    }
                    placeholder="Justification"
                  />
                </li>
              ))}
              {groups[bucket].length === 0 && <div className="text-xs opacity-50">—</div>}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function ixOf(items: SupplementItem[], id: string) {
  return items.findIndex((x) => x.id === id);
}
function title(t: SupplementItem["type"]) {
  switch (t) {
    case "code":
      return "Code-driven";
    case "mfr":
      return "Manufacturer";
    case "safety":
      return "Safety";
    case "access":
      return "Access";
    case "complexity":
      return "Complexity";
    case "admin":
      return "Admin";
  }
}
function groupByType(items: SupplementItem[]) {
  const base = {
    code: [] as SupplementItem[],
    mfr: [] as SupplementItem[],
    safety: [] as SupplementItem[],
    access: [] as SupplementItem[],
    complexity: [] as SupplementItem[],
    admin: [] as SupplementItem[],
  };
  for (const it of items) (base[it.type] as SupplementItem[]).push(it);
  return base;
}
