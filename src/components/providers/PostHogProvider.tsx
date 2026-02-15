"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { initPostHog } from "@/lib/analytics/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize PostHog on mount
    initPostHog();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      // PostHog auto-captures pageviews, but we can also track manually
      // posthog.capture('$pageview', { url });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
