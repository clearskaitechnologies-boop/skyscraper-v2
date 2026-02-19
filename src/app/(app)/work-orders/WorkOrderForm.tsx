"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Claim {
  id: string;
  claimNumber: string | null;
  title: string | null;
}

export function WorkOrderForm({ claims }: { claims: Claim[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      claimId: (fd.get("claimId") as string) || undefined,
      priority: fd.get("priority") as string,
      assignedTo: (fd.get("assignedTo") as string) || undefined,
      dueDate: (fd.get("dueDate") as string) || undefined,
    };

    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create work order");
      }
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (error) {
      setErr(error.message);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        New Work Order
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
      <h2 className="mb-4 text-lg font-semibold text-[color:var(--text)]">Create Work Order</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Title *
          </label>
          <input
            name="title"
            required
            className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[color:var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="e.g. Replace damaged shingles — Lot 42"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[color:var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Detailed scope of work…"
          />
        </div>

        {/* Claim */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Linked Claim
          </label>
          <select
            name="claimId"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[color:var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">— None —</option>
            {claims.map((c) => (
              <option key={c.id} value={c.id}>
                {c.claimNumber ?? "—"} — {c.title ?? "Untitled"}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Priority
          </label>
          <select
            name="priority"
            defaultValue="medium"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[color:var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Assigned To */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Assigned To
          </label>
          <input
            name="assignedTo"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[color:var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Crew lead name"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Due Date
          </label>
          <input
            name="dueDate"
            type="date"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[color:var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        {err && (
          <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 md:col-span-2">
            {err}
          </div>
        )}

        <div className="flex gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Creating…" : "Create Work Order"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl border border-[color:var(--border)] px-5 py-2.5 text-sm font-medium text-[color:var(--text)] transition-all hover:bg-[var(--surface-1)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
