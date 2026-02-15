"use client";
import React from "react";
interface ChainEvent {
  ts: string;
  type: string;
  severity: string;
  summary: string;
}
const sample: ChainEvent[] = [
  {
    ts: "2025-05-14T18:05:00Z",
    type: "SUPERCELL",
    severity: "HIGH",
    summary: "Supercell formation SW of property",
  },
  {
    ts: "2025-05-14T18:22:00Z",
    type: "HAIL",
    severity: "MED",
    summary: 'Hail core passage (1.25" avg)',
  },
  { ts: "2025-05-14T18:31:00Z", type: "WIND", severity: "HIGH", summary: "Peak wind gust 72 mph" },
  {
    ts: "2025-05-14T18:40:00Z",
    type: "RAIN",
    severity: "LOW",
    summary: "Storm exits NE – residual light rain",
  },
];
export default function WeatherChainsWidget() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">Event Timeline</h2>
      <ul className="space-y-3 text-sm">
        {sample.map((e) => (
          <li
            key={e.ts}
            className="bg-surface flex items-start gap-3 rounded-xl border border-border p-3"
          >
            <span className="w-20 font-mono text-xs text-muted-foreground">
              {new Date(e.ts).toLocaleTimeString()}
            </span>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              {e.type}
            </span>
            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-500">
              {e.severity}
            </span>
            <span className="flex-1 text-foreground">{e.summary}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
