"use client";
import useSWR from "swr";

import { KpiCards } from "@/components/dashboard/KpiCards";
import type { DashboardKpis } from "@/lib/dashboard/kpis";

type Props = { initial: DashboardKpis };

const fetcher = async (url: string): Promise<{ kpis: DashboardKpis }> => {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Failed to fetch KPIs");
  return res.json();
};

export function KpiCardsClient({ initial }: Props) {
  const { data } = useSWR<{ kpis: DashboardKpis }>(
    "/api/dashboard/kpis",
    fetcher,
    {
      // Faster refresh for near-real-time dashboard feel
      refreshInterval: 15_000,
      fallbackData: { kpis: initial },
    }
  );

  return <KpiCards {...data!.kpis} />;
}
