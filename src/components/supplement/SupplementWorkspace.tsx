"use client";
import { useMemo,useState } from "react";
import { logger } from "@/lib/logger";

import { money,sumCents } from "@/lib/money";

import SupplementTable from "./SupplementTable";
import SupplementToolbar from "./SupplementToolbar";

type Row = {
  id: string;
  ai?: {
    trade: string;
    code: string;
    desc: string;
    qty: number;
    unit: string;
    unitPriceCents: number;
  };
  adj?: {
    trade: string;
    code: string;
    desc: string;
    qty: number;
    unit: string;
    unitPriceCents: number;
  };
  accepted: boolean;
};

// Mock data
const MOCK_ROWS: Row[] = [
  {
    id: "1",
    ai: { trade: "Roofing", code: "R001", desc: "Asphalt shingles", qty: 35, unit: "SQ", unitPriceCents: 42500 },
    adj: { trade: "Roofing", code: "R001", desc: "Asphalt shingles", qty: 35, unit: "SQ", unitPriceCents: 42500 },
    accepted: true,
  },
  {
    id: "2",
    ai: { trade: "Roofing", code: "R002", desc: "Underlayment", qty: 40, unit: "SQ", unitPriceCents: 8500 },
    adj: { trade: "Roofing", code: "R002", desc: "Underlayment", qty: 30, unit: "SQ", unitPriceCents: 8500 },
    accepted: false,
  },
  {
    id: "3",
    ai: { trade: "Gutters", code: "G001", desc: "6\" K-Style gutter", qty: 120, unit: "LF", unitPriceCents: 1250 },
    adj: undefined,
    accepted: true,
  },
  {
    id: "4",
    ai: undefined,
    adj: { trade: "Interior", code: "I001", desc: "Drywall repair", qty: 8, unit: "SF", unitPriceCents: 450 },
    accepted: false,
  },
];

export default function SupplementWorkspace() {
  const [rows, setRows] = useState<Row[]>(MOCK_ROWS);
  const [filterTrade, setFilterTrade] = useState("All");

  const filtered = useMemo(
    () => (filterTrade === "All" ? rows : rows.filter((r) => r.ai?.trade === filterTrade || r.adj?.trade === filterTrade)),
    [rows, filterTrade]
  );

  const counts = useMemo(() => {
    const aiTotal = sumCents(filtered.map((r) => (r.ai ? r.ai.qty * r.ai.unitPriceCents : 0)));
    const adjTotal = sumCents(filtered.map((r) => (r.adj ? r.adj.qty * r.adj.unitPriceCents : 0)));
    const selectedTotal = sumCents(filtered.map((r) => (r.accepted && r.ai ? r.ai.qty * r.ai.unitPriceCents : 0)));
    const delta = aiTotal - adjTotal;
    return {
      rows: filtered.length,
      aiTotal: money(aiTotal),
      adjTotal: money(adjTotal),
      delta: money(delta),
      selectedTotal: money(selectedTotal),
    };
  }, [filtered]);

  function toggleRow(id: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, accepted: !r.accepted } : r)));
  }

  async function handleGenerate() {
    // Call PDF API
    const payload = rows.filter((r) => r.accepted && r.ai);
    logger.debug("Generate PDF with:", payload);
    // await fetch('/api/supplement/generate', { method: 'POST', body: JSON.stringify(payload) })
  }

  return (
    <div className="space-y-4">
      <SupplementToolbar
        filterTrade={filterTrade}
        setFilterTradeAction={setFilterTrade}
        counts={counts}
        onGenerateAction={handleGenerate}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SupplementTable
          title="AI Scope (Proposal)"
          rows={filtered}
          side="ai"
          highlight="added"
          onToggleAction={toggleRow}
        />
        <SupplementTable title="Adjuster Scope (Approved)" rows={filtered} side="adj" highlight="missing" onToggleAction={toggleRow} />
      </div>
    </div>
  );
}
