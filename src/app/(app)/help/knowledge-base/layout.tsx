import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base | SkaiScraper",
  description: "Help articles, guides, and documentation for SkaiScraper.",
};

export default function KnowledgeBaseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
