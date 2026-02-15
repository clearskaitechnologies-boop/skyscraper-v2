"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function format(ms: number) {
  if (ms <= 0) return "00d 00h 00m 00s";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d)}d ${pad(h)}h ${pad(m)}m ${pad(sec)}s`;
}

export default function BetaCountdownBanner() {
  const launchAt = useMemo(() => {
    const v = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_OPEN_AT;
    const parsed = v ? Date.parse(v) : NaN;
    return isNaN(parsed) ? null : new Date(parsed);
  }, []);

  const [now, setNow] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag and initial date
    setIsClient(true);
    setNow(new Date());

    // Use a less aggressive interval to prevent performance issues
    const id = setInterval(() => {
      setNow(new Date());
    }, 5000); // Update every 5 seconds instead of every second

    return () => clearInterval(id);
  }, []);

  if (!launchAt || !isClient || !now) return null;
  const remaining = launchAt.getTime() - now.getTime();

  // If countdown passed, hide the banner entirely
  if (remaining <= 0) return null;

  return (
    <div className="w-full border-b border-yellow-200 bg-yellow-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="text-yellow-900">
          <span className="font-semibold">Soft Launch Live:</span> Nov 1-4 — Enjoy full access
          during our 3-day free trial event. No charges until November 4th!
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
          >
            Start Free Trial
          </Link>
          <Link
            href="/contact#feedback"
            className="inline-flex items-center rounded-lg border border-yellow-300 px-4 py-2 text-yellow-900 hover:bg-yellow-100"
          >
            Leave Feedback
          </Link>
        </div>
      </div>
    </div>
  );
}
