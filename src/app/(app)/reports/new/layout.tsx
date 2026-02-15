import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Report | SkaiScraper",
  description: "Create a new property inspection or damage assessment report.",
};

export default function NewReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
