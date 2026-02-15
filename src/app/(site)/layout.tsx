import React from "react";

import BrandingProvider from "@/components/BrandingProvider";
import DebugStrip from "@/components/DebugStrip";
import EmojiScrubber from "@/components/EmojiScrubber";
import { PHProvider, PostHogPageview } from "@/lib/analytics.tsx";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
        <PHProvider>
          <BrandingProvider>
            <PostHogPageview />
            <DebugStrip />
            <EmojiScrubber />
            <header className="bg-[var(--surface-1)]/80 supports-[backdrop-filter]:bg-[var(--surface-1)]/60 w-full border-b border-[color:var(--border)] backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <a href="/" className="text-lg font-bold">SkaiScraper</a>
                <nav className="flex gap-6 text-sm">
                  <a href="/features" className="transition hover:text-brand-accent">Features</a>
                  <a href="/pricing" className="transition hover:text-brand-accent">Pricing</a>
                  <a href="/contact" className="transition hover:text-brand-accent">Contact</a>
                  <a href="/sign-in" className="rounded bg-brand-accent px-3 py-1.5 font-medium text-white transition hover:bg-brand-primary">Sign In</a>
                </nav>
              </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
            <footer className="mt-12 border-t border-[color:var(--border)] py-10 text-center text-xs text-slate-700 dark:text-slate-300">
              <p>&copy; {new Date().getFullYear()} SkaiScraper. All rights reserved.</p>
            </footer>
          </BrandingProvider>
        </PHProvider>
      </body>
    </html>
  );
}