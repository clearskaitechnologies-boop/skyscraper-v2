"use client";

const TRADES = [
  "ALL",
  "ROOFING",
  "PLUMBING",
  "HVAC",
  "ELECTRICAL",
  "RESTORATION",
  "PAINTING",
  "FLOORING",
  "LANDSCAPING",
  "CARPENTRY",
  "MASONRY",
];

interface TradeChipsProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TradeChips({ value, onChange }: TradeChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TRADES.map((trade) => (
        <button
          key={trade}
          onClick={() => onChange(trade === "ALL" ? "" : trade)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            (value === "" && trade === "ALL") || value === trade
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {trade.charAt(0) + trade.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );
}
