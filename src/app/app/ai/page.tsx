import Link from "next/link";

import AICardsGrid from "@/components/dashboard/AICardsGrid";
import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";

export const dynamic = "force-dynamic";

export default async function AIHubPage() {
  const ctx = await getActiveOrgContext({ optional: true });
  return (
    <div className="min-h-screen p-6">
      <h1 className="mb-6 text-3xl font-bold">AI Hub</h1>
      {!ctx.ok && (
        <div className="mb-4 rounded-lg border bg-[var(--surface-1)] p-4 text-sm">
          <p className="mb-2">You’re viewing the AI Hub without a signed-in session.</p>
          <Link
            href="/sign-in"
            className="rounded bg-[var(--primary)] px-3 py-1.5 font-medium text-white"
          >
            🔐 Sign In
          </Link>
        </div>
      )}
      <AICardsGrid />
    </div>
  );
}
