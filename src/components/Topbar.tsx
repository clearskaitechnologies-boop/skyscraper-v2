"use client";
import { Menu, Sparkles } from "lucide-react";
import Link from "next/link";

import TokenBadge from "./TokenBadge";

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button onClick={onToggleSidebar} className="rounded-lg p-2 hover:bg-neutral-100">
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="font-semibold tracking-tight">
          SkaiScraper<span className="text-neutral-400">.io</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <TokenBadge />
          <Link
            href="/billing"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade / Buy Tokens
          </Link>
        </div>
      </div>
    </header>
  );
}
