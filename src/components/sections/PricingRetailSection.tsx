import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { totalRetail } from "./pricing/math";
import { dollars,RetailLine, RetailPricingState } from "./pricing/types";

const blankLine = (): RetailLine => ({
  id: crypto.randomUUID(),
  label: "",
  qty: 1,
  unitPrice: 0,
  unit: "",
  taxExempt: false,
});

export type PricingRetailProps = {
  value: RetailPricingState;
  onChange: (v: RetailPricingState) => void;
  onAi?: (seed: string) => Promise<RetailLine[]>;
  seedText?: string;
};

export default function PricingRetailSection({
  value,
  onChange,
  onAi,
  seedText,
}: PricingRetailProps) {
  const [busy, setBusy] = useState(false);
  const totals = useMemo(() => totalRetail(value), [value]);

  function add() {
    onChange({ ...value, lines: [...value.lines, blankLine()] });
  }
  function del(id: string) {
    onChange({ ...value, lines: value.lines.filter((l) => l.id !== id) });
  }
  function upd(id: string, patch: Partial<RetailLine>) {
    onChange({ ...value, lines: value.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  }

  async function aiPropose() {
    if (!onAi) return;
    setBusy(true);
    try {
      const lines = await onAi(seedText || "");
      if (lines?.length) onChange({ ...value, lines: mergeLines(value.lines, lines) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Price Breakdown (Retail)</h2>
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

      <div className="grid grid-cols-12 gap-2 text-xs font-medium opacity-60">
        <div className="col-span-5">Item</div>
        <div className="col-span-2">Qty</div>
        <div className="col-span-1">Unit</div>
        <div className="col-span-2">Unit Price</div>
        <div className="col-span-1">Tax?</div>
        <div className="col-span-1"></div>
      </div>

      {value.lines.map((l) => (
        <div key={l.id} className="grid grid-cols-12 items-center gap-2">
          <Input
            className="col-span-5"
            value={l.label}
            onChange={(e) => upd(l.id, { label: e.target.value })}
            placeholder="Tear-off and disposal (SQ)"
          />
          <Input
            className="col-span-2"
            type="number"
            value={l.qty}
            onChange={(e) => upd(l.id, { qty: Number(e.target.value) })}
          />
          <Input
            className="col-span-1"
            value={l.unit || ""}
            onChange={(e) => upd(l.id, { unit: e.target.value })}
            placeholder="SQ/EA/LF"
          />
          <Input
            className="col-span-2"
            type="number"
            value={l.unitPrice}
            onChange={(e) => upd(l.id, { unitPrice: Number(e.target.value) })}
          />
          <input
            className="col-span-1"
            type="checkbox"
            checked={!l.taxExempt}
            onChange={(e) => upd(l.id, { taxExempt: !e.target.checked })}
          />
          <Button size="sm" variant="ghost" className="col-span-1" onClick={() => del(l.id)}>
            ✕
          </Button>
          {l.note && (
            <div className="col-span-12 -mt-1">
              <Textarea value={l.note} onChange={(e) => upd(l.id, { note: e.target.value })} />
            </div>
          )}
        </div>
      ))}

      <div className="grid gap-3 rounded-xl border bg-muted/50 p-3 md:grid-cols-4">
        <div>
          <div className="mb-1 text-xs opacity-60">Tax Rate %</div>
          <Input
            type="number"
            value={value.taxRatePct}
            onChange={(e) => onChange({ ...value, taxRatePct: Number(e.target.value) })}
          />
        </div>
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

      <div className="flex flex-col items-end gap-1 text-sm" data-key="retail-totals">
        <div>
          Subtotal: <b>{dollars(totals.sub)}</b>
        </div>
        <div>
          Tax: <b>{dollars(totals.tax)}</b>
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

function mergeLines(existing: RetailLine[], incoming: RetailLine[]) {
  const seen = new Set(existing.map((l) => l.label.toLowerCase()));
  const add = incoming.filter((l) => !seen.has(l.label.toLowerCase()));
  return [...existing, ...add];
}
