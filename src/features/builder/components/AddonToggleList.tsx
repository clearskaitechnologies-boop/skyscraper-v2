"use client";
import { useAtom } from "jotai";
import { usePathname } from "next/navigation";

import { AddonKey,AddonRegistry } from "@/lib/registry/AddonRegistry";

import { selectedAddonsAtom } from "../state/builderState";

export default function AddonToggleList() {
  const [selected, setSelected] = useAtom(selectedAddonsAtom);
  const pathname = usePathname() || "/";
  const toggle = (k: AddonKey) => {
    setSelected((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  };

  // Minimal route-based scoping: hide vendor add-on in AI Claims builder context
  const filtered = Object.values(AddonRegistry).filter((a) => {
    if (pathname.startsWith("/reports/ai-claims-builder")) {
      return a.key !== "vendor"; // vendor reserved for retail proposal flows
    }
    return true;
  });

  return (
    <div className="space-y-2">
      {filtered.map((a) => {
        const active = selected.includes(a.key);
        return (
          <button
            key={a.key}
            onClick={() => toggle(a.key)}
            className={`w-full rounded-xl border px-3 py-2 text-left ${active ? "border-blue-500" : "border-zinc-300"} hover:bg-zinc-50`}
          >
            <div className="text-sm font-medium">{a.title}</div>
            <div className="text-[11px] text-zinc-500">{a.key}</div>
          </button>
        );
      })}
    </div>
  );
}
