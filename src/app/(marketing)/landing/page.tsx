import type { Metadata } from "next";

import { MarketingLanding } from "@/components/marketing/MarketingLanding";

export const metadata: Metadata = {
  title: "SkaiScraper – AI Claims & Storm Intelligence Platform",
  description:
    "AI-powered operations hub for trades professionals. Manage claims, retail jobs, financing, and repairs — all in one platform. Built for roofing, HVAC, solar, general contracting, and more.",
  openGraph: {
    title: "SkaiScraper – AI Claims & Storm Intelligence Platform",
    description:
      "AI-powered operations hub for trades professionals. Manage claims, retail jobs, financing, and repairs — all in one platform.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SkaiScraper",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI-powered operations hub for trades professionals. Manage claims, retail jobs, financing, and repairs — all in one platform.",
  url: "https://skaiscrape.com",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function MarketingHome() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingLanding />
    </>
  );
}
