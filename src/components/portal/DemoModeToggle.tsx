"use client";

import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "portalDemoMode";

export default function DemoModeToggle() {
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setEnabled(stored === "true");
    }
    setReady(true);
  }, []);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    window.localStorage.setItem(STORAGE_KEY, checked ? "true" : "false");
    window.dispatchEvent(new Event("portal-demo-mode-changed"));
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Demo Mode</p>
        <p className="text-xs text-slate-500">Show sample data when you have no projects yet.</p>
      </div>
      <Switch checked={ready ? enabled : true} onCheckedChange={handleToggle} />
    </div>
  );
}
