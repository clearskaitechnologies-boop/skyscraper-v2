import Link from 'next/link';

export function OnboardingOrgFallback({ title = 'Initialize Your Workspace', reason }: { title?: string; reason?: string }) {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] p-8 shadow-lg">
        <h1 className="mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-3xl font-bold text-transparent">{title}</h1>
        <p className="mb-6 text-[color:var(--muted)]">{reason || 'No organization record is linked to this account yet. Complete onboarding to auto-create your starter organization.'}</p>
        <div className="space-y-4">
          <Link href="/onboarding/start" className="rounded-lg bg-[var(--primary)] px-5 py-3 font-medium text-white shadow">🚀 Start Onboarding</Link>
          <Link href="/dashboard" className="rounded-lg border border-[color:var(--border)] px-5 py-3 font-medium">← Back to Dashboard</Link>
        </div>
        <div className="mt-8 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <strong>Troubleshooting:</strong> If onboarding loops or fails, provide your Clerk user ID and timestamp to support.
        </div>
      </div>
    </div>
  );
}
