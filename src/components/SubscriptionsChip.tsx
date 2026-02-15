"use client";
import { useEffect, useState } from "react";

export function SubscriptionsChip() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    const v = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_OPEN_AT;
    if (!v) return;
    const t = Date.parse(v);
    const format = (ms: number) => {
      if (ms <= 0) return "Now Open";
      const s = Math.floor(ms / 1000),
        d = Math.floor(s / 86400),
        h = Math.floor((s % 86400) / 3600),
        m = Math.floor((s % 3600) / 60);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${pad(d)}d ${pad(h)}h ${pad(m)}m`;
    };
    const tick = () => setLabel(format(t - Date.now()));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  if (!label) return null;
  const isOpen = label === "Now Open";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isOpen ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {isOpen ? "Subscriptions: Now Open" : `Subscriptions open in ${label}`}
    </span>
  );
}
