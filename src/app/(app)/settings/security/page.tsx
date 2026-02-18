import { auth } from "@clerk/nextjs/server";
import { Clock, Globe, Laptop, Monitor, Shield, ShieldCheck, Smartphone } from "lucide-react";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { PageSectionCard } from "@/components/layout/PageSectionCard";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ── Mock data (wire to Clerk session API later) ── */

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
  icon: "desktop" | "mobile" | "laptop";
}

interface LoginEvent {
  id: string;
  action: string;
  ip: string;
  device: string;
  location: string;
  timestamp: string;
  status: "success" | "failed";
}

const MOCK_SESSIONS: ActiveSession[] = [
  {
    id: "s1",
    device: "macOS · Chrome 120",
    browser: "Chrome",
    ip: "192.168.1.100",
    location: "Phoenix, AZ",
    lastActive: "Just now",
    current: true,
    icon: "laptop",
  },
  {
    id: "s2",
    device: "iPhone 15 Pro · Safari",
    browser: "Safari",
    ip: "10.0.0.42",
    location: "Phoenix, AZ",
    lastActive: "2 hours ago",
    current: false,
    icon: "mobile",
  },
  {
    id: "s3",
    device: "Windows 11 · Edge 120",
    browser: "Edge",
    ip: "172.58.90.12",
    location: "Scottsdale, AZ",
    lastActive: "Yesterday at 4:32 PM",
    current: false,
    icon: "desktop",
  },
];

const MOCK_LOGIN_HISTORY: LoginEvent[] = [
  {
    id: "l1",
    action: "Sign in",
    ip: "192.168.1.100",
    device: "macOS · Chrome",
    location: "Phoenix, AZ",
    timestamp: "2026-02-11T09:15:00Z",
    status: "success",
  },
  {
    id: "l2",
    action: "Sign in",
    ip: "10.0.0.42",
    device: "iPhone · Safari",
    location: "Phoenix, AZ",
    timestamp: "2026-02-10T18:45:00Z",
    status: "success",
  },
  {
    id: "l3",
    action: "Failed sign-in attempt",
    ip: "203.45.67.89",
    device: "Unknown",
    location: "Unknown",
    timestamp: "2026-02-09T22:12:00Z",
    status: "failed",
  },
  {
    id: "l4",
    action: "Password changed",
    ip: "192.168.1.100",
    device: "macOS · Chrome",
    location: "Phoenix, AZ",
    timestamp: "2026-02-08T14:30:00Z",
    status: "success",
  },
  {
    id: "l5",
    action: "Sign in",
    ip: "172.58.90.12",
    device: "Windows · Edge",
    location: "Scottsdale, AZ",
    timestamp: "2026-02-07T08:00:00Z",
    status: "success",
  },
];

/* ── Helpers ── */

function DeviceIcon({ type }: { type: ActiveSession["icon"] }) {
  switch (type) {
    case "mobile":
      return <Smartphone className="h-5 w-5 text-blue-500" />;
    case "laptop":
      return <Laptop className="h-5 w-5 text-indigo-500" />;
    default:
      return <Monitor className="h-5 w-5 text-slate-500" />;
  }
}

function StatusBadge({ status }: { status: "success" | "failed" }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        <ShieldCheck className="h-3 w-3" />
        Success
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
      <Shield className="h-3 w-3" />
      Failed
    </span>
  );
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ── Page ── */

export default async function SecurityLogsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const ctx = await safeOrgContext();
  if (!ctx.orgId || ctx.status !== "ok") redirect("/settings");

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        section="settings"
        title="Security & Login Activity"
        subtitle="Review active sessions, login history, and security events"
        icon={<Shield className="h-5 w-5" />}
      />

      <div className="grid gap-6">
        {/* ─── Coming Soon Banner ─── */}
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center dark:border-amber-700 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            🚧 Preview Mode — This page shows sample data. Real session tracking via Clerk API
            coming soon.
          </p>
        </div>

        {/* ─── Active Sessions ─── */}
        <PageSectionCard
          title="Active Sessions"
          subtitle="Devices currently signed into your account"
        >
          <div className="divide-y divide-[color:var(--border)]">
            {MOCK_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <DeviceIcon type={session.icon} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[color:var(--text)]">{session.device}</span>
                      {session.current && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          This device
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {session.ip}
                      </span>
                      <span>{session.location}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <button className="self-start rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </PageSectionCard>

        {/* ─── Login History ─── */}
        <PageSectionCard
          title="Login History"
          subtitle="Recent authentication events for your account"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--border)] text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="pb-3 pr-4">Event</th>
                  <th className="pb-3 pr-4">Device</th>
                  <th className="pb-3 pr-4">IP Address</th>
                  <th className="pb-3 pr-4">Location</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {MOCK_LOGIN_HISTORY.map((event) => (
                  <tr key={event.id} className="text-[color:var(--text)]">
                    <td className="py-3 pr-4 font-medium">{event.action}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{event.device}</td>
                    <td className="py-3 pr-4">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
                        {event.ip}
                      </code>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                      {event.location}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-slate-600 dark:text-slate-300">
                      {formatTimestamp(event.timestamp)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={event.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageSectionCard>

        {/* ─── Security Recommendations ─── */}
        <PageSectionCard title="Security Recommendations">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-[color:var(--border)] bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-medium text-[color:var(--text)]">
                  Two-Factor Authentication
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Add an extra layer of security with 2FA via authenticator app or SMS.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-[color:var(--border)] bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="font-medium text-[color:var(--text)]">Session Timeout</div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Configure automatic session expiration for inactive accounts.
                </p>
              </div>
            </div>
          </div>
        </PageSectionCard>
      </div>
    </PageContainer>
  );
}
