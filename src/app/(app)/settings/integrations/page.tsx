"use client";

/**
 * Integrations Settings Page
 *
 * Manage QuickBooks Online, GAF QuickMeasure, and other third-party
 * integrations. Handles OAuth connection, status display, and sync.
 */

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Link2,
  Loader2,
  RefreshCw,
  Ruler,
  Unlink,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface QBConnection {
  id: string;
  companyName: string | null;
  isActive: boolean;
  lastSyncAt: string | null;
  syncErrors: unknown[] | null;
  tokenExpires: string;
  connectedAt: string;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function IntegrationsPage() {
  const [qbConnection, setQBConnection] = useState<QBConnection | null>(null);
  const [qbConnected, setQBConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  /* ── Fetch QB status ──────────────────────────────────────────── */

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/quickbooks/status");
      const data = await res.json();
      if (data.ok) {
        setQBConnected(data.connected ?? false);
        setQBConnection(data.connection ?? null);
      }
    } catch (err) {
      console.error("[INTEGRATIONS] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  /* ── Connect ──────────────────────────────────────────────────── */

  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await fetch("/api/integrations/quickbooks/callback", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("[INTEGRATIONS] connect error:", err);
    } finally {
      setConnecting(false);
    }
  }

  /* ── Disconnect ───────────────────────────────────────────────── */

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/integrations/quickbooks/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      setDisconnectOpen(false);
      await fetchStatus();
    } catch (err) {
      console.error("[INTEGRATIONS] disconnect error:", err);
    } finally {
      setDisconnecting(false);
    }
  }

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <PageContainer>
      <PageHero
        section="settings"
        title="Integrations"
        subtitle="Connect your accounting, measurement, and business tools"
        icon={<Link2 className="h-6 w-6" />}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* ── QuickBooks ──────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#2CA01C" />
                    <path
                      d="M8.5 7C7.12 7 6 8.12 6 9.5v5C6 15.88 7.12 17 8.5 17H10v-1.5H8.5a1 1 0 01-1-1v-5a1 1 0 011-1H10V7H8.5z"
                      fill="white"
                    />
                    <path
                      d="M15.5 17c1.38 0 2.5-1.12 2.5-2.5v-5C18 8.12 16.88 7 15.5 7H14v1.5h1.5a1 1 0 011 1v5a1 1 0 01-1 1H14V17h1.5z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-sm">QuickBooks Online</CardTitle>
                  <CardDescription className="text-xs">
                    Sync invoices, payments, and customers
                  </CardDescription>
                </div>
              </div>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : qbConnected ? (
                <Badge className="bg-green-100 text-green-700">Connected</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-600">Not Connected</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {qbConnected && qbConnection ? (
              <>
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-slate-500">Company</p>
                      <p className="font-medium">
                        {qbConnection.companyName || "QuickBooks Company"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Connected Since</p>
                      <p className="font-medium">
                        {new Date(qbConnection.connectedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Last Sync</p>
                      <p className="font-medium">
                        {qbConnection.lastSyncAt
                          ? new Date(qbConnection.lastSyncAt).toLocaleString()
                          : "Never"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Token Expires</p>
                      <p className="font-medium">
                        {new Date(qbConnection.tokenExpires).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Sync errors */}
                  {Array.isArray(qbConnection.syncErrors) && qbConnection.syncErrors.length > 0 && (
                    <div className="mt-3 rounded-md bg-red-50 p-2">
                      <div className="flex items-center gap-1.5 text-xs text-red-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>
                          {qbConnection.syncErrors.length} sync error(s) — check connection
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={handleConnect}
                    disabled={connecting}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reconnect
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDisconnectOpen(true)}
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Disconnect
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500">
                  Connect your QuickBooks Online account to automatically sync invoices, customer
                  records, and payments between SkaiScraper and QuickBooks.
                </p>
                <ul className="space-y-1 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Auto-create QB invoices from jobs
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Sync customer records
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Record payments automatically
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Job-to-invoice pipeline
                  </li>
                </ul>
                <Button
                  className="w-full gap-1.5"
                  onClick={handleConnect}
                  disabled={connecting || loading}
                >
                  {connecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  Connect QuickBooks
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── GAF QuickMeasure ────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Ruler className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-sm">GAF QuickMeasure</CardTitle>
                  <CardDescription className="text-xs">
                    Aerial roof & property measurements
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">
              Direct API integration with GAF QuickMeasure for automated aerial measurement
              ordering. Currently use the manual order flow from the Measurements page.
            </p>
            <ul className="space-y-1 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                Order measurements in one click
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                Auto-import measurement data into claims
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                Webhook-driven status updates
              </li>
            </ul>
            <Button variant="outline" size="sm" className="w-full gap-1" asChild>
              <a
                href="https://www.gaf.com/en-us/for-professionals/tools/quickmeasure"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* ── EagleView ───────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <Ruler className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-sm">EagleView</CardTitle>
                  <CardDescription className="text-xs">
                    Premium property measurement reports
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">
              Connect to EagleView for premium aerial measurement reports including 3D models,
              siding, gutters, and full-property measurement packages.
            </p>
            <Button variant="outline" size="sm" className="w-full gap-1" asChild>
              <a href="https://www.eagleview.com" target="_blank" rel="noopener noreferrer">
                Learn More <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* ── Xactimate ───────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-purple-600" fill="currentColor">
                    <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-sm">Xactimate / Verisk</CardTitle>
                  <CardDescription className="text-xs">
                    ESX file import & estimate sync
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700">Planned</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">
              Import Xactimate ESX files, parse line items, and auto-populate claim estimates
              directly in SkaiScraper.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full gap-1">
              <ArrowRight className="h-3.5 w-3.5" />
              Coming in Phase 3
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Disconnect dialog ─────────────────────────────────────── */}
      <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Disconnect QuickBooks?</DialogTitle>
            <DialogDescription>
              This will stop syncing invoices and payments. You can reconnect at any time — your
              existing data in QuickBooks will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDisconnectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnect} disabled={disconnecting}>
              {disconnecting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Unlink className="mr-1.5 h-4 w-4" />
              )}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
