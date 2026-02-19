"use client";

import { FileText, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageHero } from "@/components/layout/PageHero";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobId, setJobId] = useState("");
  const [kind, setKind] = useState("standard");
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discount;

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jobId.trim()) {
      setError("Job ID is required");
      return;
    }
    if (items.some((i) => !i.description.trim())) {
      setError("All line items need a description");
      return;
    }
    if (items.some((i) => i.quantity <= 0)) {
      setError("All line items must have a quantity greater than 0");
      return;
    }
    if (items.some((i) => i.unitPrice <= 0)) {
      setError("All line items must have a unit price greater than 0");
      return;
    }
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    if (total <= 0) {
      setError("Invoice total must be greater than $0.00");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          kind,
          items,
          taxRate,
          discount,
          notes: notes || undefined,
          dueDate: dueDate || undefined,
          customerEmail: customerEmail || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create invoice");
      }
      router.push("/invoices");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero
        section="finance"
        title="Create Invoice"
        subtitle="Build an invoice with line items, tax, and discounts"
        icon={<FileText className="h-6 w-6" />}
      />

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold text-[color:var(--text)]">Invoice Details</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Job ID *
              </label>
              <input
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="Paste job ID from CRM"
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder-slate-400 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Invoice Type
              </label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="standard">Standard</option>
                <option value="progress">Progress Billing</option>
                <option value="final">Final Invoice</option>
                <option value="supplement">Supplement</option>
                <option value="change_order">Change Order</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Customer Email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder-slate-400 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold text-[color:var(--text)]">Line Items</h2>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-end gap-3">
                <div className="flex-1">
                  {i === 0 && (
                    <label className="mb-1 block text-xs text-slate-500">Description</label>
                  )}
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder="Roof replacement - labor"
                    className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[color:var(--text)] placeholder-slate-400"
                  />
                </div>
                <div className="w-20">
                  {i === 0 && <label className="mb-1 block text-xs text-slate-500">Qty</label>}
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                    min={0}
                    className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[color:var(--text)]"
                  />
                </div>
                <div className="w-32">
                  {i === 0 && (
                    <label className="mb-1 block text-xs text-slate-500">Unit Price</label>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
                    min={0}
                    className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[color:var(--text)]"
                  />
                </div>
                <div className="w-28 py-2 text-right font-mono text-sm text-[color:var(--text)]">
                  {fmt(item.quantity * item.unitPrice)}
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-[color:var(--border)] px-4 py-2 text-sm text-slate-500 transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <Plus className="h-4 w-4" /> Add Line Item
          </button>
        </div>

        {/* Totals */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Discount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Payment terms, additional notes..."
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder-slate-400 focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <div className="space-y-2 rounded-xl bg-[var(--surface-2)] p-4">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-mono">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Tax ({taxRate}%)</span>
                  <span className="font-mono">{fmt(taxAmount)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span className="font-mono">−{fmt(discount)}</span>
                  </div>
                )}
                <div className="border-t border-[color:var(--border)] pt-2">
                  <div className="flex justify-between text-lg font-bold text-[color:var(--text)]">
                    <span>Total</span>
                    <span className="font-mono">{fmt(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-[color:var(--border)] px-6 py-3 font-medium text-[color:var(--text)] transition-colors hover:bg-[var(--surface-1)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-8 py-3 font-semibold text-white shadow-[var(--glow)] transition hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
