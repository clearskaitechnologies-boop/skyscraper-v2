"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MortgageCheckForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    claimId: "",
    lender: "",
    amount: "",
    checkNumber: "",
    expectedDate: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/mortgage-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: form.claimId,
          lender: form.lender,
          amount: Number(form.amount),
          checkNumber: form.checkNumber || undefined,
          expectedDate: form.expectedDate || undefined,
          notes: form.notes || undefined,
        }),
      });
      setOpen(false);
      setForm({
        claimId: "",
        lender: "",
        amount: "",
        checkNumber: "",
        expectedDate: "",
        notes: "",
      });
      router.refresh();
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-5 py-3 font-semibold text-white shadow-[var(--glow)] transition hover:scale-[1.02]"
      >
        <Plus className="h-4 w-4" /> Track Mortgage Check
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl"
    >
      <h2 className="mb-4 text-lg font-semibold text-[color:var(--text)]">New Mortgage Check</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          value={form.claimId}
          onChange={(e) => setForm({ ...form, claimId: e.target.value })}
          placeholder="Claim ID *"
          required
          className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder-slate-400"
        />
        <input
          value={form.lender}
          onChange={(e) => setForm({ ...form, lender: e.target.value })}
          placeholder="Mortgage Company *"
          required
          className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder-slate-400"
        />
        <input
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="Amount ($) *"
          required
          className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder-slate-400"
        />
        <input
          value={form.checkNumber}
          onChange={(e) => setForm({ ...form, checkNumber: e.target.value })}
          placeholder="Check Number"
          className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder-slate-400"
        />
        <input
          type="date"
          value={form.expectedDate}
          onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
          className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)]"
        />
        <input
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Notes"
          className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder-slate-400"
        />
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-6 py-3 font-semibold text-white shadow-[var(--glow)] disabled:opacity-50"
        >
          {loading ? "Saving..." : "Track Check"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-[color:var(--border)] px-6 py-3 text-[color:var(--text)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
