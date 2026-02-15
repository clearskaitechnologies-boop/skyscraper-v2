import fs from "node:fs";
import path from "node:path";

import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { LEGAL_DOCUMENTS } from "@/lib/legal/config";

interface PageProps {
  params: { doc: string; version: string };
  searchParams: { view?: string };
}

export default async function LegalDocPage({ params, searchParams }: PageProps) {
  const { doc, version } = params;
  const view = searchParams.view === "legal" ? "legal" : "friendly";

  const docConfig = LEGAL_DOCUMENTS.find((d) => d.id === doc);
  if (!docConfig) return notFound();

  const baseDir = path.join(process.cwd(), "legal", doc, version);
  const filePath = path.join(baseDir, view === "legal" ? "legal.md" : "friendly.md");

  if (!fs.existsSync(filePath)) return notFound();

  const content = fs.readFileSync(filePath, "utf8");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-white">{docConfig.title}</h1>
          <p className="text-sm text-slate-400">
            Version {version} • {view === "legal" ? "Legal text" : "Plain-English version"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/legal/${doc}/${version}?view=friendly`}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              view === "friendly"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Simple
          </Link>
          <Link
            href={`/legal/${doc}/${version}?view=legal`}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              view === "legal"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Legal
          </Link>
        </div>
      </div>

      <article className="prose prose-invert prose-slate max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>

      <div className="mt-8 border-t border-slate-700 pt-6">
        <Link href="/legal" className="text-sm text-blue-400 hover:text-blue-300">
          ← Back to all legal documents
        </Link>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const docs = LEGAL_DOCUMENTS.map((doc) => ({
    doc: doc.id,
    version: doc.latestVersion,
  }));

  return docs;
}
