import { Link } from "react-router-dom";

export default function ProposalsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-5">
        <div className="mb-1 text-lg font-semibold">Retail Proposal</div>
        <div className="text-gray-600">Branded proposals with mockups & options.</div>
        <Link
          to="/proposals/new"
          className="mt-4 inline-block rounded-lg bg-[var(--cs-primary)] px-4 py-2 text-white"
        >
          Build in 60 Seconds →
        </Link>
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <div className="mb-2 text-sm font-semibold">Proposals</div>
        <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-sm text-gray-500">
          No proposals yet.
        </div>
      </div>
    </div>
  );
}
