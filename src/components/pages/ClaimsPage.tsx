import { Link } from "react-router-dom";

export default function ClaimsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-5">
        <div className="mb-1 text-lg font-semibold">Insurance Claims Folder</div>
        <div className="text-gray-600">Claims-ready documentation that adjusters approve.</div>
        <Link
          to="/claims/new"
          className="mt-4 inline-block rounded-lg bg-[var(--cs-primary)] px-4 py-2 text-white"
        >
          Build in 60 Seconds →
        </Link>
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <div className="mb-3 text-sm font-semibold">Active Claims</div>
        <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-sm text-gray-500">
          No claims yet.
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 opacity-60">
          <div className="text-sm font-semibold">Weather Context</div>
          <div className="text-xs text-gray-500">/weather/context</div>
        </div>
        <div className="rounded-xl border bg-white p-4 opacity-60">
          <div className="text-sm font-semibold">Map Enrichment</div>
          <div className="text-xs text-gray-500">/maps/enrich</div>
        </div>
        <div className="rounded-xl border bg-white p-4 opacity-60">
          <div className="text-sm font-semibold">Client Folder</div>
          <div className="text-xs text-gray-500">/folders/client</div>
        </div>
      </div>
    </div>
  );
}
