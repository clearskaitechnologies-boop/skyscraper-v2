"use client";
import { card, glow } from "@/lib/theme";

type Payment = {
  id: string;
  amountCents: number;
  type?: string;
  paidAt: Date | null;
};

type Supplement = {
  id: string;
  totalCents: number;
  status: string;
};

export default function ClaimFinancials({
  payments = [],
  supplements = [],
}: {
  payments: Payment[];
  supplements: Supplement[];
}) {
  const totalPaid = payments.reduce((sum, p) => sum + (p.amountCents || 0), 0);
  const approvedSupplements = supplements
    .filter((s) => s.status === "APPROVED")
    .reduce((sum, s) => sum + (s.totalCents || 0), 0);
  const pendingSupplements = supplements
    .filter((s) => s.status === "REQUESTED")
    .reduce((sum, s) => sum + (s.totalCents || 0), 0);

  const totalExposure = totalPaid + approvedSupplements + pendingSupplements;

  const paidPercent = totalExposure > 0 ? (totalPaid / totalExposure) * 100 : 0;
  const approvedPercent = totalExposure > 0 ? (approvedSupplements / totalExposure) * 100 : 0;
  const pendingPercent = totalExposure > 0 ? (pendingSupplements / totalExposure) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className={`${card} ${glow}`}>
          <div className="text-xs uppercase tracking-wide text-[color:var(--muted)]">
            Total Paid
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            ${(totalPaid / 100).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[color:var(--muted)]">
            {payments.length} payment{payments.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className={`${card} ${glow}`}>
          <div className="text-xs uppercase tracking-wide text-[color:var(--muted)]">
            Approved Supplements
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${(approvedSupplements / 100).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[color:var(--muted)]">
            {supplements.filter((s) => s.status === "APPROVED").length} approved
          </div>
        </div>

        <div className={`${card} ${glow}`}>
          <div className="text-xs uppercase tracking-wide text-[color:var(--muted)]">
            Pending Supplements
          </div>
          <div className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            ${(pendingSupplements / 100).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[color:var(--muted)]">
            {supplements.filter((s) => s.status === "REQUESTED").length} pending
          </div>
        </div>
      </div>

      {/* Exposure Breakdown */}
      <div className={`${card} ${glow}`}>
        <h3 className="mb-4 text-lg font-semibold text-[color:var(--text)]">
          Exposure Breakdown
        </h3>

        <div className="space-y-3">
          {/* Progress bars */}
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-[color:var(--text)]">Paid</span>
              <span className="text-[color:var(--muted)]">
                {paidPercent.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-[var(--surface-2)]">
              <div
                className="h-3 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${paidPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-[color:var(--text)]">Approved</span>
              <span className="text-[color:var(--muted)]">
                {approvedPercent.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-[var(--surface-2)]">
              <div
                className="h-3 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${approvedPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-[color:var(--text)]">Pending</span>
              <span className="text-[color:var(--muted)]">
                {pendingPercent.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-[var(--surface-2)]">
              <div
                className="h-3 rounded-full bg-yellow-500 transition-all duration-300"
                style={{ width: `${pendingPercent}%` }}
              />
            </div>
          </div>

          <div className="border-t border-[color:var(--border)] pt-3">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-[color:var(--text)]">Total Exposure</span>
              <span className="text-[color:var(--primary)]">
                ${(totalExposure / 100).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div className={`${card} ${glow}`}>
          <h3 className="mb-4 text-lg font-semibold text-[color:var(--text)]">
            Recent Payments
          </h3>
          <div className="space-y-2">
            {payments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between border-b border-[color:var(--border)] py-2 last:border-0"
              >
                <div>
                  <div className="text-sm font-medium text-[color:var(--text)]">
                    {payment.type || "Payment"}
                  </div>
                  <div className="text-xs text-[color:var(--muted)]">
                    {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "Pending"}
                  </div>
                </div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  ${(payment.amountCents / 100).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
