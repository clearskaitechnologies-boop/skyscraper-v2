import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations – SkaiScraper",
  description:
    "Connect QuickBooks, measurement providers, and other services to your SkaiScraper account.",
};

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
