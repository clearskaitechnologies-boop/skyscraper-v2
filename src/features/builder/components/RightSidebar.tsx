"use client";
import AddonToggleList from "./AddonToggleList";
import ExportButtons from "./ExportButtons";

export default function RightSidebar() {
  return (
    <aside className="w-80 shrink-0 space-y-6 rounded-xl border-l border-slate-200 bg-white p-4 shadow-sm transition-all focus-within:border-blue-400">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-500">
          Add-ons
        </div>
        <AddonToggleList />
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-500">
          Export
        </div>
        <ExportButtons />
      </div>
    </aside>
  );
}
