"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TRADE_LABELS } from "@/lib/trades/trade-types";

type FilterDrawerProps = {
  onApplyFilters: (filters: {
    zip?: string;
    city?: string;
    state?: string;
    trade?: string;
    emergency?: boolean;
    verified?: boolean;
  }) => void;
  initialFilters?: {
    zip?: string;
    city?: string;
    state?: string;
    trade?: string;
    emergency?: boolean;
    verified?: boolean;
  };
};

export function FilterDrawer({ onApplyFilters, initialFilters = {} }: FilterDrawerProps) {
  const [zip, setZip] = useState(initialFilters.zip || "");
  const [city, setCity] = useState(initialFilters.city || "");
  const [state, setState] = useState(initialFilters.state || "");
  const [trade, setTrade] = useState(initialFilters.trade || "");
  const [emergency, setEmergency] = useState(initialFilters.emergency || false);
  const [verified, setVerified] = useState(initialFilters.verified || false);

  function handleApply() {
    onApplyFilters({
      zip: zip || undefined,
      city: city || undefined,
      state: state || undefined,
      trade: trade || undefined,
      emergency,
      verified,
    });
  }

  function handleClear() {
    setZip("");
    setCity("");
    setState("");
    setTrade("");
    setEmergency(false);
    setVerified(false);
    onApplyFilters({});
  }

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Filters</h3>
        <p className="text-sm text-slate-600">Refine your search</p>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Location</h4>
        <Input
          placeholder="ZIP Code"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
      </div>

      {/* Trade */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Trade</h4>
        <select
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
          value={trade}
          onChange={(e) => setTrade(e.target.value)}
        >
          <option value="">All Trades</option>
          {TRADE_LABELS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Special Filters */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Special</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emergency}
              onChange={(e) => setEmergency(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Emergency Services Available</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Verified Contractors Only</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleApply} className="flex-1">
          Apply Filters
        </Button>
        <Button onClick={handleClear} variant="outline">
          Clear
        </Button>
      </div>
    </div>
  );
}
