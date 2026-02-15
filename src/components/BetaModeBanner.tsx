"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface PlanStatus {
  planKey: string;
  planName: string;
  isActive: boolean;
  addonSeats: number;
  message: string;
  variant: "success" | "info" | "warning" | "error";
}

export function BetaModeBanner() {
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch("/api/trades/company/seats");
        if (!res.ok) return;
        const data = await res.json();

        const planKey = data?.plan?.key || data?.currentPlan || "";
        const planName = data?.plan?.name || planKey || "Free";
        const totalSeats = data?.seats?.total ?? data?.totalSeats ?? 1;
        const usedSeats = data?.seats?.used ?? data?.usedSeats ?? 1;
        const addonSeats = totalSeats > 1 ? totalSeats - 1 : 0;

        // Determine display
        if (planKey && planKey !== "free") {
          setPlanStatus({
            planKey,
            planName: planName.charAt(0).toUpperCase() + planName.slice(1),
            isActive: true,
            addonSeats,
            message: `${planName.charAt(0).toUpperCase() + planName.slice(1)} plan active — ${usedSeats}/${totalSeats} seats used`,
            variant: "success",
          });
        } else {
          setPlanStatus({
            planKey: "free",
            planName: "Free",
            isActive: false,
            addonSeats: 0,
            message: "Free plan — upgrade to unlock team seats and premium features",
            variant: "info",
          });
        }
      } catch {
        // Silent fail — don't show banner if we can't fetch
      }
    }
    fetchPlan();
  }, []);

  if (!planStatus) return null;

  const variantStyles = {
    success:
      "border-green-200 bg-green-50/80 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300",
    info: "border-blue-200 bg-blue-50/80 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    warning:
      "border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    error:
      "border-red-200 bg-red-50/80 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className={cn("border-b", variantStyles[planStatus.variant])}>
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">
          {planStatus.variant === "success" && "✅ "}
          {planStatus.message}
        </p>
        <Link
          href="/settings/billing"
          className="text-sm font-medium underline opacity-80 transition-opacity hover:opacity-100"
        >
          {planStatus.isActive ? "Manage plan" : "View pricing"}
        </Link>
      </div>
    </div>
  );
}
