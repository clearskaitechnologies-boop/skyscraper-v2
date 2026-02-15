// src/features/claims/steps/Step9_Settlement.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface Step9Data {
  rcvTotal?: string;
  acvTotal?: string;
  depreciation?: string;
  deductible?: string;
  netClaim?: string;
  settlementNotes?: string;
}

interface Step9Props {
  data: Partial<Step9Data>;
  onChange: (data: Partial<Step9Data>) => void;
}

export function Step9_Settlement({ data, onChange }: Step9Props) {
  const updateField = (field: keyof Step9Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settlement Estimate</h2>
        <p className="mt-2 text-sm text-slate-600">
          Document the claim settlement details and calculations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rcvTotal">RCV Total</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <Input
              id="rcvTotal"
              type="number"
              value={data.rcvTotal || ""}
              onChange={(e) => updateField("rcvTotal", e.target.value)}
              placeholder="0.00"
              className="pl-7"
              step="0.01"
            />
          </div>
          <p className="text-xs text-slate-500">Replacement Cost Value</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="depreciation">Depreciation</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <Input
              id="depreciation"
              type="number"
              value={data.depreciation || ""}
              onChange={(e) => updateField("depreciation", e.target.value)}
              placeholder="0.00"
              className="pl-7"
              step="0.01"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="acvTotal">ACV Total</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <Input
              id="acvTotal"
              type="number"
              value={data.acvTotal || ""}
              onChange={(e) => updateField("acvTotal", e.target.value)}
              placeholder="0.00"
              className="pl-7"
              step="0.01"
            />
          </div>
          <p className="text-xs text-slate-500">Actual Cash Value</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deductible">Deductible</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <Input
              id="deductible"
              type="number"
              value={data.deductible || ""}
              onChange={(e) => updateField("deductible", e.target.value)}
              placeholder="0.00"
              className="pl-7"
              step="0.01"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="netClaim">Net Claim Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <Input
              id="netClaim"
              type="number"
              value={data.netClaim || ""}
              onChange={(e) => updateField("netClaim", e.target.value)}
              placeholder="0.00"
              className="pl-7 text-lg font-semibold"
              step="0.01"
            />
          </div>
          <p className="text-xs text-slate-500">ACV Total - Deductible = Net Claim</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="settlementNotes">Settlement Notes</Label>
        <Textarea
          id="settlementNotes"
          value={data.settlementNotes || ""}
          onChange={(e) => updateField("settlementNotes", e.target.value)}
          placeholder="Additional notes about the settlement calculation..."
          rows={4}
        />
      </div>
    </div>
  );
}
