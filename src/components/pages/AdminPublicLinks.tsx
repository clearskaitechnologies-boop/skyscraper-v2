import React, { useEffect,useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface PublicToken {
  id: string;
  token: string;
  report_id: string;
  scope: string;
  expires_at: string | null;
  revoked: boolean;
  view_count: number | null;
  max_views: number | null;
  created_at: string;
}

function StatusBadge({ row }: { row: PublicToken }) {
  const now = Date.now();
  const expired = row.expires_at && new Date(row.expires_at).getTime() < now;
  const revoked = row.revoked;

  if (revoked) {
    return (
      <span className="rounded-xl bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
        Revoked
      </span>
    );
  }
  if (expired) {
    return (
      <span className="rounded-xl bg-muted px-2 py-0.5 text-xs text-muted-foreground">Expired</span>
    );
  }
  return (
    <span className="rounded-xl bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Active</span>
  );
}

function buildPublicUrl(token: string) {
  return `${window.location.origin}/public-view?token=${token}`;
}

export default function AdminPublicLinks() {
  const [items, setItems] = useState<PublicToken[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ report_id: "", scope: "view", days: 7, max_views: "" });
  const [filter, setFilter] = useState<"all" | "active" | "revoked" | "expired">("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Record<string, boolean>>({});

  async function load() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/.netlify/functions/admin-public-links-list", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    setItems(json.items || []);
    setSel({});
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setCreating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const expires_at = new Date(Date.now() + Number(form.days || 7) * 86400 * 1000).toISOString();
      const body = {
        report_id: form.report_id,
        scope: form.scope,
        expires_at,
        max_views: form.max_views ? Number(form.max_views) : null,
      };

      const res = await fetch("/.netlify/functions/admin-public-link-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "create failed");

      await load();
      const url = buildPublicUrl(json.token);
      await navigator.clipboard.writeText(url);
      alert(`Created & copied link to clipboard:\n${url}`);
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setCreating(false);
    }
  }

  async function updateRow(id: string, patch: any) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/.netlify/functions/admin-public-link-update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id, ...patch }),
    });

    const json = await res.json();
    if (!res.ok) return alert(json.error || "update failed");
    await load();
  }

  async function bulk(revoked: boolean) {
    const ids = Object.entries(sel)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (ids.length === 0) return alert("Select at least one row.");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/.netlify/functions/admin-public-link-bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ ids, revoked }),
    });

    const json = await res.json();
    if (!res.ok) return alert(json.error || "bulk failed");
    await load();
  }

  function toggleAll(v: boolean) {
    const page = filtered.map((r) => r.id);
    setSel(Object.fromEntries(page.map((id) => [id, v])));
  }

  const now = Date.now();
  const filtered = items.filter((row) => {
    const expired = row.expires_at && new Date(row.expires_at).getTime() < now;
    if (filter === "active" && (row.revoked || expired)) return false;
    if (filter === "revoked" && !row.revoked) return false;
    if (filter === "expired" && !expired) return false;
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return (
      String(row.token).toLowerCase().includes(needle) ||
      String(row.report_id).toLowerCase().includes(needle)
    );
  });

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Public Links</h1>

      {/* Create form */}
      <Card className="mb-6 p-4">
        <div className="grid gap-2 md:grid-cols-6">
          <Input
            className="md:col-span-2"
            placeholder="Report ID"
            value={form.report_id}
            onChange={(e) => setForm({ ...form, report_id: e.target.value })}
          />
          <select
            className="rounded-lg border p-2"
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
          >
            <option value="view">view</option>
            <option value="download">download</option>
          </select>
          <Input
            type="number"
            min={1}
            placeholder="Days"
            value={form.days}
            onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
          />
          <Input
            type="number"
            min={1}
            placeholder="Max views (optional)"
            value={form.max_views}
            onChange={(e) => setForm({ ...form, max_views: e.target.value })}
          />
          <Button className="md:col-span-6" disabled={creating} onClick={create}>
            {creating ? "Creating…" : "Create Link"}
          </Button>
        </div>
      </Card>

      {/* Filters + bulk */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder="Search token or report id"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded-lg border p-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
          <option value="expired">Expired</option>
        </select>
        <Button variant="outline" size="sm" onClick={() => bulk(true)}>
          Bulk Revoke
        </Button>
        <Button variant="outline" size="sm" onClick={() => bulk(false)}>
          Bulk Unrevoke
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>
          Select Page
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>
          Clear
        </Button>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-2">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    onChange={(e) => toggleAll(e.currentTarget.checked)}
                  />
                </th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Token</th>
                <th className="p-2 text-left">Report</th>
                <th className="p-2 text-left">Scope</th>
                <th className="p-2 text-left">Views</th>
                <th className="p-2 text-left">Max</th>
                <th className="p-2 text-left">Expires</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={!!sel[row.id]}
                      onChange={(e) => setSel((s) => ({ ...s, [row.id]: e.currentTarget.checked }))}
                    />
                  </td>
                  <td className="p-2">
                    <StatusBadge row={row} />
                  </td>
                  <td className="break-all p-2 font-mono text-xs">{row.token}</td>
                  <td className="p-2">{row.report_id}</td>
                  <td className="p-2">{row.scope}</td>
                  <td className="p-2">{row.view_count ?? 0}</td>
                  <td className="p-2">
                    <Input
                      className="w-20"
                      type="number"
                      min={1}
                      value={row.max_views ?? ""}
                      onChange={(e) =>
                        updateRow(row.id, {
                          max_views: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </td>
                  <td className="p-2">
                    {row.expires_at ? new Date(row.expires_at).toLocaleString() : "-"}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const url = buildPublicUrl(row.token);
                          await navigator.clipboard.writeText(url);
                          alert("Copied link to clipboard");
                        }}
                      >
                        Copy Link
                      </Button>
                      {row.revoked ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateRow(row.id, { revoked: false })}
                        >
                          Unrevoke
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateRow(row.id, { revoked: true })}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
