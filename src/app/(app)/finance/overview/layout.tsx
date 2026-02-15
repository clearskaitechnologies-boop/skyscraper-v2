import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finance Overview | SkaiScraper",
  description: "Revenue analytics, invoicing, and financial performance dashboard.",
};

export default function FinanceOverviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
