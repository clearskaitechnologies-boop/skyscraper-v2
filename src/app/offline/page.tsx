import type { Metadata } from "next";

import { RetryButton } from "./_components/RetryButton";

export const metadata: Metadata = {
  title: "Offline | SkaiScraper",
  description: "You appear to be offline. Please check your connection and try again.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 text-center text-white">
      <div className="mx-auto max-w-md space-y-8">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#117CFF]/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#117CFF]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#117CFF] to-[#FFC838] bg-clip-text text-transparent">
              SkaiScraper
            </span>
          </h1>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-200">You&apos;re Offline</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            It looks like you&apos;ve lost your internet connection. Check your Wi-Fi or cellular
            data and try again.
          </p>
        </div>

        {/* Retry */}
        <RetryButton />

        <p className="text-xs text-slate-600">
          Your data is safe — everything syncs when you reconnect.
        </p>
      </div>
    </main>
  );
}
