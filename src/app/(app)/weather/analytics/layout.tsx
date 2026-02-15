import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weather Analytics | SkaiScraper",
  description: "Storm tracking, weather intelligence, and claim opportunity analysis.",
};

export default function WeatherAnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
