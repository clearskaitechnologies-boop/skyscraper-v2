import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SkaiScraper™ — AI for Roofing & Restoration",
  description:
    "AI inspections, damage detection, weather verification, and PDF packets for roofing professionals.",
  metadataBase: new URL("https://www.skaiscrape.com"),
  keywords:
    "roofing AI, damage detection, claims processing, PDF reports, restoration tools, construction AI",
  authors: [{ name: "SkaiScraper Team" }],
  openGraph: {
    title: "SkaiScraper™ — AI for Roofing & Restoration",
    description: "Complete AI-powered platform for roofing professionals",
    type: "website",
    url: "https://www.skaiscrape.com",
    siteName: "SkaiScraper",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkaiScraper™ — AI for Roofing & Restoration",
    description: "Complete AI-powered platform for roofing professionals",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};
