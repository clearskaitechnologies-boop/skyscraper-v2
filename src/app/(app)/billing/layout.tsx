import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing & Subscription | SkaiScraper",
  description: "Manage your plan, subscription, and payment methods.",
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
