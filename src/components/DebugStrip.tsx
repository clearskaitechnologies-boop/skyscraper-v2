"use client";
import { usePathname } from "next/navigation";

import { APP_VERSION,SHOW_DEBUG_STRIP } from "@/config/version";

export default function DebugStrip() {
  const pathname = usePathname();
  
  if (!SHOW_DEBUG_STRIP) return null;

  return (
    <div className="flex w-full items-center justify-between border-b border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-700 dark:text-yellow-300">
      <span className="font-medium">🔧 DEBUG STRIP • Build: {APP_VERSION}</span>
      <span className="font-mono">Route: {pathname}</span>
    </div>
  );
}
