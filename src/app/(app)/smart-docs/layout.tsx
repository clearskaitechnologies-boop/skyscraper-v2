import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Documents – SkaiScraper",
  description:
    "Create, send, and track documents with built-in e-signatures. No third-party signing tools required.",
};

export default function SmartDocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
