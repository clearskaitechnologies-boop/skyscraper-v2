"use client";
import { money } from "@/lib/money";

type Side = "ai" | "adj";
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

export default function SupplementTable({
  title,
  rows,
  side,
  highlight,
  onToggleAction,
}: {
  title: string;
  rows: Row[];
  side: Side;
  highlight: "added" | "missing";
  onToggleAction: (id: string) => void;
}) {
  return (
    <div className="overflow-auto rounded-2xl border border-[color:var(--border)] bg-[var(--surface-1)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold text-[color:var(--text)]">{title}</h4>
        <div className="text-xs text-[color:var(--muted)]">{rows.length} items</div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[color:var(--border)] text-[color:var(--muted)]">
            <th className="py-2 text-left">Trade</th>
            <th className="py-2 text-left">Code</th>
            <th className="py-2 text-left">Description</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Unit $</th>
            <th className="py-2 text-right">Line $</th>
            {side === "ai" && <th className="py-2 text-right">Ask</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const src = side === "ai" ? r.ai : r.adj;
            if (!src)
              return (
                <tr key={r.id} className="border-b border-[color:var(--border)]">
                  <td
                    colSpan={7}
                    className={`py-2 ${
                      highlight === "added" ? "bg-[var(--primary-weak)]" : "bg-[var(--surface-2)]"
                    } text-[color:var(--muted)]`}
                  >
                    {side === "ai" ? "— Missing in AI —" : "— Missing in Adjuster —"}
                  </td>
                </tr>
              );

            const lineCents = src.qty * src.unitPriceCents;
            const isDelta =
              r.ai &&
              r.adj &&
              (r.ai.unitPriceCents !== r.adj.unitPriceCents || r.ai.qty !== r.adj.qty);
            return (
              <tr
                key={r.id}
                className={`border-b border-[color:var(--border)] hover:bg-[var(--surface-2)] ${
                  isDelta ? "outline outline-1 outline-[var(--border)]" : ""
                }`}
              >
                <td className="py-2">{src.trade}</td>
                <td className="py-2">{src.code}</td>
                <td className="py-2">{src.desc}</td>
                <td className="py-2 text-right">
                  {src.qty} {src.unit}
                </td>
                <td className="py-2 text-right">{money(src.unitPriceCents)}</td>
                <td className="py-2 text-right">{money(lineCents)}</td>
                {side === "ai" && (
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onToggleAction(r.id)}
                      className={`rounded-lg border px-2 py-1 text-xs transition ${
                        r.accepted
                          ? "border-transparent bg-[var(--primary)] text-white"
                          : "border-[color:var(--border)] bg-[var(--surface-2)] text-[color:var(--muted)]"
                      }`}
                      aria-pressed={r.accepted ? "true" : "false"}
                    >
                      {r.accepted ? "Included" : "Include"}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
