import { FileText, Scale,Shield } from "lucide-react";
import Link from "next/link";

import { LEGAL_DOCUMENTS } from "@/lib/legal/config";

export default function LegalIndexPage() {
  const requiredDocs = LEGAL_DOCUMENTS.filter((d) => d.required);
  const optionalDocs = LEGAL_DOCUMENTS.filter((d) => !d.required);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold text-white">Legal Documents</h1>
        <p className="text-slate-300">
          ClearSkai Technologies, LLC (DBA SkaiScraper) • Prescott, Arizona
        </p>
      </div>

      <div className="mb-12 rounded-xl border border-blue-500/20 bg-blue-500/10 p-6">
        <div className="flex items-start gap-3">
          <Shield className="mt-1 h-6 w-6 text-blue-400" />
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">Legal Protection & Compliance</h2>
            <p className="text-sm text-slate-300">
              All users must accept the required legal documents before accessing the platform.
              These documents protect both you and SkaiScraper, ensuring compliance with AI safety
              laws, CCPA, GDPR, and industry regulations.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-white">
          <Scale className="h-6 w-6 text-amber-400" />
          Required Documents
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {requiredDocs.map((doc) => (
            <Link
              key={doc.id}
              href={`/legal/${doc.id}/${doc.latestVersion}`}
              className="block rounded-lg border border-slate-700 bg-slate-800/50 p-5 transition-colors hover:border-slate-600 hover:bg-slate-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">{doc.title}</h3>
                <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
                  Required
                </span>
              </div>
              <p className="text-sm text-slate-400">Version {doc.latestVersion}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-white">
          <FileText className="h-6 w-6 text-slate-400" />
          Optional Documents
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {optionalDocs.map((doc) => (
            <Link
              key={doc.id}
              href={`/legal/${doc.id}/${doc.latestVersion}`}
              className="block rounded-lg border border-slate-700 bg-slate-800/50 p-5 transition-colors hover:border-slate-600 hover:bg-slate-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">{doc.title}</h3>
                <span className="rounded-full bg-slate-600/50 px-2 py-1 text-xs font-medium text-slate-300">
                  Optional
                </span>
              </div>
              <p className="text-sm text-slate-400">Version {doc.latestVersion}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12 rounded-lg border border-slate-700 bg-slate-800/30 p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">Contact</h3>
        <p className="text-sm text-slate-300">
          For legal inquiries, please contact:{" "}
          <a href="mailto:legal@skai.app" className="text-blue-400 hover:text-blue-300">
            legal@skai.app
          </a>
        </p>
        <p className="mt-2 text-sm text-slate-300">
          For privacy-related requests:{" "}
          <a href="mailto:privacy@skai.app" className="text-blue-400 hover:text-blue-300">
            privacy@skai.app
          </a>
        </p>
      </div>
    </div>
  );
}
