"use client";

import { useAuth } from "@clerk/nextjs";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect,useState } from "react";

const BANNER_DISMISS_KEY = "skaiscraper_banner_dismissed";
const DISMISS_DURATION_DAYS = 30;

interface LaunchBannerProps {
  forceShow?: boolean;
}

export default function LaunchBanner({ forceShow = false }: LaunchBannerProps) {
  const { isSignedIn } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check if banner was dismissed
    const dismissed = localStorage.getItem(BANNER_DISMISS_KEY);
    if (dismissed && !forceShow) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceDismissed < DISMISS_DURATION_DAYS) {
        setIsVisible(false);
        return;
      }
    }

    // Don't show if signed in (unless forced)
    if (isSignedIn && !forceShow) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
  }, [isSignedIn, forceShow]);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISS_KEY, new Date().toISOString());
    setIsVisible(false);

    // Track dismissal
    if (typeof window !== "undefined" && (window as any).analytics?.track) {
      (window as any).analytics.track("banner_dismissed", {
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleCTAClick = (cta: "trial" | "demo") => {
    // Track click
    if (typeof window !== "undefined" && (window as any).analytics?.track) {
      (window as any).analytics.track("banner_clicked", {
        cta,
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (!isClient || !isVisible) {
    return null;
  }

  const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL || "/contact";

  return (
    <>
      {/* Desktop: Slim bar at top */}
      <div
        role="region"
        aria-label="Promotion"
        className="hidden w-full bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white duration-500 animate-in slide-in-from-top md:block"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">
                SkaiScraper
              </span>
              <p className="text-sm font-medium">
                SkaiScraper is live — Start your free trial today.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/sign-up"
                onClick={() => handleCTAClick("trial")}
                className="rounded-md bg-white px-4 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
              >
                Start Free Trial
              </Link>

              <Link
                href={demoUrl}
                onClick={() => handleCTAClick("demo")}
                className="rounded-md border border-white bg-transparent px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
              >
                Book Demo
              </Link>

              <button
                onClick={handleDismiss}
                aria-label="Dismiss banner"
                className="rounded p-1 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Floating pill at bottom */}
      <div
        role="region"
        aria-label="Promotion"
        className="pb-safe fixed bottom-0 left-0 right-0 z-50 p-4 duration-500 animate-in fade-in slide-in-from-bottom md:hidden"
      >
        <div className="mx-auto max-w-md rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 p-3 text-white shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="flex-shrink-0 text-lg" aria-hidden="true">
                SkaiScraper
              </span>
              <p className="truncate text-xs font-medium">SkaiScraper is live!</p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              <Link
                href="/sign-up"
                onClick={() => handleCTAClick("trial")}
                className="whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Start Trial
              </Link>

              <button
                onClick={handleDismiss}
                aria-label="Dismiss banner"
                className="rounded-full p-1 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
