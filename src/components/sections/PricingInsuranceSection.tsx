import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { totalInsurance } from "./pricing/math";
import { dollars,InsuranceLine, InsurancePricingState } from "./pricing/types";

const blankLineI = (): InsuranceLine => ({
  id: crypto.randomUUID(),
  scope: "",
  qty: 1,
  unit: "EA",
  unitPrice: 0,
  roomOrArea: "",
  wastePct: 0,
});

export type PricingInsuranceProps = {
  value: InsurancePricingState;
  onChange: (v: InsurancePricingState) => void;
  onAi?: (seed: string) => Promise<InsuranceLine[]>;
  seedText?: string;
};

export default function PricingInsuranceSection({
  value,
  onChange,
  onAi,
  seedText,
}: PricingInsuranceProps) {
  const [busy, setBusy] = useState(false);
  const totals = useMemo(() => totalInsurance(value), [value]);

  function add() {
    onChange({ ...value, lines: [...value.lines, blankLineI()] });
  }
  function del(id: string) {
    onChange({ ...value, lines: value.lines.filter((l) => l.id !== id) });
  }
  function upd(id: string, patch: Partial<InsuranceLine>) {
    onChange({ ...value, lines: value.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  }

  async function aiPropose() {
    if (!onAi) return;
    setBusy(true);
    try {
      const lines = await onAi(seedText || "");
      if (lines?.length) onChange({ ...value, lines: mergeLinesI(value.lines, lines) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Scope + Unit Pricing (Insurance)</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={add}>
            + Add line
          </Button>
          {onAi && (
            <Button size="sm" onClick={aiPropose} disabled={busy}>
              🤖 Propose from AI
            </Button>
          )}
        </div>
      </div>

      <div
        className="grid grid-cols-12 gap-2 text-xs font-medium opacity-60"
        data-key="insurance-columns"
      >
        <div className="col-span-2">Room/Area</div>
        <div className="col-span-3">Scope</div>
        <div className="col-span-2">Code Ref</div>
        <div className="col-span-1">Qty</div>
        <div className="col-span-1">Unit</div>
        <div className="col-span-2">Unit Price</div>
        <div className="col-span-1">Waste %</div>
      </div>

      {value.lines.map((l) => (
        <div key={l.id} className="grid grid-cols-12 items-center gap-2">
          <Input
            className="col-span-2"
            value={l.roomOrArea || ""}
            onChange={(e) => upd(l.id, { roomOrArea: e.target.value })}
            placeholder="Slope A"
          />
          <Input
            className="col-span-3"
            value={l.scope}
            onChange={(e) => upd(l.id, { scope: e.target.value })}
            placeholder="R&R shingles"
          />
          <Input
            className="col-span-2"
            value={l.codeRef || ""}
            onChange={(e) => upd(l.id, { codeRef: e.target.value })}
            placeholder="IRC R905.2"
          />
          <Input
            className="col-span-1"
            type="number"
            value={l.qty}
            onChange={(e) => upd(l.id, { qty: Number(e.target.value) })}
          />
          <Input
            className="col-span-1"
            value={l.unit}
            onChange={(e) => upd(l.id, { unit: e.target.value })}
            placeholder="SQ"
          />
          <Input
            className="col-span-2"
            type="number"
            value={l.unitPrice}
            onChange={(e) => upd(l.id, { unitPrice: Number(e.target.value) })}
          />
          <Input
            className="col-span-1"
            type="number"
            value={l.wastePct || 0}
            onChange={(e) => upd(l.id, { wastePct: Number(e.target.value) })}
          />
          <Button size="sm" variant="ghost" onClick={() => del(l.id)}>
            ✕
          </Button>
        </div>
      ))}

      <div className="grid gap-3 rounded-xl border bg-muted/50 p-3 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.includeOP}
            onChange={(e) => onChange({ ...value, includeOP: e.target.checked })}
          />
          <span className="text-sm">Include O&P</span>
        </div>
        <div>
          <div className="mb-1 text-xs opacity-60">Overhead %</div>
          <Input
            type="number"
            value={value.overheadPct}
            onChange={(e) => onChange({ ...value, overheadPct: Number(e.target.value) })}
          />
        </div>
        <div>
          <div className="mb-1 text-xs opacity-60">Profit %</div>
          <Input
            type="number"
            value={value.profitPct}
            onChange={(e) => onChange({ ...value, profitPct: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 text-sm">
        <div>
          Subtotal: <b>{dollars(totals.sub)}</b>
        </div>
        {value.includeOP && (
          <div>
            O&P: <b>{dollars(totals.op)}</b>
          </div>
        )}
        <div className="text-base">
          Total: <b>{dollars(totals.total)}</b>
        </div>
      </div>
    </section>
  );
}

function mergeLinesI(existing: InsuranceLine[], incoming: InsuranceLine[]) {
  const key = (l: InsuranceLine) =>
    `${(l.roomOrArea || "").toLowerCase()}|${l.scope.toLowerCase()}`;
  const seen = new Set(existing.map(key));
  const add = incoming.filter((l) => !seen.has(key(l)));
  return [...existing, ...add];
}
