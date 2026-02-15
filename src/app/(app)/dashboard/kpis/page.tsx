import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import KPIDashboardClient from "@/components/kpi-dashboard/KPIDashboardClient";

export const metadata: Metadata = {
  title: "KPI Dashboard | SkaiScraper",
  description: "Executive intelligence dashboard with comprehensive performance analytics",
};

export default async function KPIsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return <KPIDashboardClient />;
}
