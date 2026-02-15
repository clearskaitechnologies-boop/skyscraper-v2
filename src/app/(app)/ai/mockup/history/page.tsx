import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft, CheckCircle, XCircle, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getToolHistory } from "@/lib/activity";

export default async function MockupHistoryPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const history = await getToolHistory(user.id, "mockup", 50);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/ai/mockup"
          className="flex items-center gap-2 text-sm text-slate-700 hover:text-[color:var(--text)] dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to AI Mockup
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[color:var(--text)]">AI Mockup History</h1>
        <p className="mt-2 text-slate-700 dark:text-slate-300">
          View all your AI Mockup generations and token usage
        </p>
      </div>

      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] p-12 text-center">
            <div className="mb-4 text-4xl">📸</div>
            <h3 className="text-lg font-semibold text-[color:var(--text)]">No mockups yet</h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              Generate your first AI mockup to see it here
            </p>
            <Button asChild className="mt-4 inline-flex items-center bg-sky-600 hover:bg-sky-700">
              <Link href="/ai/mockup">Create Mockup</Link>
            </Button>
          </div>
        ) : (
          history.map((run: any) => (
            <div
              key={run.id}
              className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] p-4 shadow-sm transition-shadow hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {run.status === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm font-medium text-[color:var(--text)]">
                      Run {run.id.slice(0, 8)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        run.status === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {run.tokens_used || 0} tokens
                    </span>
                    <span>{new Date(run.created_at).toLocaleString()}</span>
                  </div>

                  {run.input && Object.keys(run.input).length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs text-slate-700 hover:text-[color:var(--text)] dark:text-slate-300">
                        View input data
                      </summary>
                      <pre className="mt-2 overflow-auto rounded bg-[var(--surface-2)] p-2 text-xs">
                        {JSON.stringify(run.input, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {history.length > 0 && (
        <div className="mt-6 text-center text-sm text-slate-700 dark:text-slate-300">
          Showing {history.length} most recent runs
        </div>
      )}
    </main>
  );
}
