import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal - SkaiScraper",
  description: "Client portal for insurance claim management",
};

/**
 * Client Portal Route Group Layout
 *
 * NOTE: This layout does NOT include <html> or <body> tags because those
 * are already provided by the root layout.tsx. Route group layouts only
 * wrap the content within the existing document structure.
 */
export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-gray-50">{children}</main>;
}
