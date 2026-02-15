"use client";

import { useEffect,useState } from "react";

import EmergencyToggle from "./EmergencyToggle";
import RadiusSelect from "./RadiusSelect";
import SortDropdown from "./SortDropdown";
import TradeChips from "./TradeChips";
import VerifiedToggle from "./VerifiedToggle";

interface Filters {
  trade: string;
  zip: string;
  radius: string;
  verified: boolean;
  emergency: boolean;
  sort: string;
}

interface FilterBarProps {
  onChange: (filters: Filters) => void;
}

export default function FilterBar({ onChange }: FilterBarProps) {
  const [filters, setFilters] = useState<Filters>({
    trade: "",
    zip: "",
    radius: "",
    verified: false,
    emergency: false,
    sort: "best",
  });

  useEffect(() => {
    const debounce = setTimeout(() => onChange(filters), 300);
    return () => clearTimeout(debounce);
  }, [filters, onChange]);

  return (
    <div className="w-full space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      {/* ZIP + Radius + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Enter ZIP Code"
          value={filters.zip}
          maxLength={5}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setFilters({ ...filters, zip: value });
          }}
        />

        <RadiusSelect
          value={filters.radius}
          onChange={(v) => setFilters({ ...filters, radius: v })}
        />

        <SortDropdown
          value={filters.sort}
          onChange={(v) => setFilters({ ...filters, sort: v })}
        />
      </div>

      {/* Trade Chips */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Filter by Trade
        </label>
        <TradeChips
          value={filters.trade}
          onChange={(v) => setFilters({ ...filters, trade: v })}
        />
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        <VerifiedToggle
          value={filters.verified}
          onChange={(v) => setFilters({ ...filters, verified: v })}
        />
        <EmergencyToggle
          value={filters.emergency}
          onChange={(v) => setFilters({ ...filters, emergency: v })}
        />
      </div>
    </div>
  );
}
