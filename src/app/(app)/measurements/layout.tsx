import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Measurements – SkaiScraper",
  description:
    "Order roof and property measurements from GAF QuickMeasure or EagleView directly from your dashboard.",
};

export default function MeasurementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
