import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { loadBranding } from "@/lib/branding";

export default function StatusCheck() {
  const location = useLocation();
  const [env, setEnv] = useState<Record<string, boolean>>({});
  const [auth, setAuth] = useState<{
    state: "loading" | "in" | "out";
    email?: string;
  }>({
    state: "loading",
  });
  const [jeCounts, setJeCounts] = useState<Record<string, number>>({});
  const [jeLast, setJeLast] = useState<Record<string, unknown> | null>(null);
  const [leadId, setLeadId] = useState<string>("");
  const [aiHealth, setAiHealth] = useState<Record<string, unknown> | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const jeMock = useMemo(
    () => ((process.env.NEXT_PUBLIC_JE_MOCK as string | undefined) || process.env.JE_MOCK) === "1",
    []
  );
  const [systemHealth, setSystemHealth] = useState({
    buckets: false,
    org: false,
    branding: false,
    resend: false,
    jeShaw: false,
    googleOneTap: false,
    mockup: false,
  });
  const [mockupTesting, setMockupTesting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const deep = params.get("aiDeep") === "1";

    supabase.functions
      .invoke("ai-health", { body: { deep } })
      .then((res) => {
        if (res.data && typeof res.data === "object")
          setAiHealth(res.data as Record<string, unknown>);
      })
      .finally(() => setAiLoading(false));

    // Check system health
    (async () => {
      const checks = await Promise.all([
        supabase.storage
          .listBuckets()
          .then(({ data }) => {
            const ids = (data || []).map((b: unknown) => (b as Record<string, unknown>)["id"]);
            return ids.includes("photos") && ids.includes("reports");
          })
          .catch(() => false),

        supabase.auth
          .getUser()
          .then(async ({ data: { user } }) => {
            if (!user) return false;
            const { data } = await supabase
              .from("user_profiles")
              .select("org_id")
              .eq("user_id", user.id)
              .single();
            return !!(data && (data as Record<string, unknown>)["org_id"]);
          })
          .catch(() => false),

        loadBranding()
          .then((b) => !!b)
          .catch(() => false),

        Promise.resolve(
          !!(
            (process.env.NEXT_PUBLIC_RESEND_API_KEY as string | undefined) ||
            process.env.RESEND_API_KEY
          )
        ),

        Promise.resolve(
          !!(
            ((process.env.NEXT_PUBLIC_JE_SHAW_API_URL as string | undefined) ||
              process.env.JE_SHAW_API_URL) &&
            ((process.env.NEXT_PUBLIC_JE_SHAW_API_TOKEN as string | undefined) ||
              process.env.JE_SHAW_API_TOKEN)
          )
        ),

        Promise.resolve(
          !!(
            (process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID as string | undefined) ||
            process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID
          )
        ),
      ]);

      setSystemHealth({
        buckets: checks[0],
        org: checks[1],
        branding: checks[2],
        resend: checks[3],
        jeShaw: checks[4],
        googleOneTap: checks[5],
        mockup: false, // Will be tested via button
      });
    })();
  }, [location.search]);

  useEffect(() => {
    setEnv({
      VITE_SUPABASE_URL: !!(
        (process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
        process.env.NEXT_PUBLIC_SUPABASE_URL
      ),
      VITE_SUPABASE_ANON_KEY:
        (
          (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          ""
        ).length > 20,
      VITE_STATUS_ENABLED:
        String(
          (process.env.NEXT_PUBLIC_STATUS_ENABLED as string | undefined) ||
            process.env.NEXT_PUBLIC_STATUS_ENABLED
        ) === "true",
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAuth({ state: "in", email: data.session.user.email || undefined });
      } else {
        setAuth({ state: "out" });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setAuth({
        state: sess ? "in" : "out",
        email: sess?.user?.email || undefined,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchJe() {
    if (!leadId) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const [layersRes, lastRes] = await Promise.all([
        supabase.functions.invoke("je-layers", {
          body: { leadId },
        }),
        supabase.functions.invoke("je-last-sync", {
          body: { leadId },
        }),
      ]);

      if (layersRes.data && typeof layersRes.data === "object") {
        const ld = layersRes.data as Record<string, unknown>;
        if (ld["ok"]) setJeCounts((ld["counts"] as Record<string, number>) || {});
      }
      if (lastRes.data && typeof lastRes.data === "object") {
        const lr = lastRes.data as Record<string, unknown>;
        setJeLast((lr["last"] as Record<string, unknown>) || null);
      }
    } catch (error: any) {
      // Use unified toast for errors
      try {
        const e = error instanceof Error ? error : new Error(String(error));
        (await import("sonner")).toast.error(
          "Failed to fetch aerial data: " + (e.message || String(e))
        );
      } catch (_e) {
        /* ignore toast load failures */
      }
    }
  }

  // Safe displays for unknown-shaped data
  const jeLastDisplay = jeLast
    ? `${new Date(
        String(jeLast["updated_at"] ?? "")
      ).toLocaleString()} • ${String(jeLast["layer"] ?? "")} (${String(
        jeLast["source_version"] ?? "unknown"
      )})`
    : "—";

  const aiOk = Boolean(aiHealth && aiHealth["ok"]);
  const aiDeep = Boolean(aiHealth && aiHealth["deep"]);
  const aiReason =
    aiHealth && typeof aiHealth["reason"] === "string" ? String(aiHealth["reason"]) : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold">ClearSKai — Status Check</h1>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Environment</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>SUPABASE_URL:</span>
                <Badge variant={env.VITE_SUPABASE_URL ? "default" : "destructive"}>
                  {env.VITE_SUPABASE_URL ? "Present" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>SUPABASE_ANON_KEY:</span>
                <Badge variant={env.VITE_SUPABASE_ANON_KEY ? "default" : "destructive"}>
                  {env.VITE_SUPABASE_ANON_KEY ? "Present" : "Missing/Short"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>STATUS PAGE:</span>
                <Badge variant={env.VITE_STATUS_ENABLED ? "default" : "secondary"}>
                  {env.VITE_STATUS_ENABLED ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Auth</h2>
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge variant={auth.state === "in" ? "default" : "secondary"}>
                  {auth.state === "loading"
                    ? "Loading…"
                    : auth.state === "in"
                      ? `SIGNED IN (${auth.email || "—"})`
                      : "SIGNED OUT"}
                </Badge>
              </div>
              <div className="flex gap-3">
                <Link to="/signin">
                  <Button variant="outline" size="sm">
                    Go to Sign In
                  </Button>
                </Link>
                <Link to="/auth/reset">
                  <Button variant="outline" size="sm">
                    Password Reset
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Aerial Integration</h2>
            <div className="space-y-4">
              <div>
                <span className="text-muted-foreground">Mode: </span>
                <Badge variant={jeMock ? "secondary" : "default"}>{jeMock ? "MOCK" : "LIVE"}</Badge>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="leadId">Lead ID</Label>
                  <Input
                    id="leadId"
                    placeholder="Enter lead UUID"
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                  />
                </div>
                <Button onClick={fetchJe}>Check</Button>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <strong>Layer counts:</strong>{" "}
                  {Object.keys(jeCounts).length ? JSON.stringify(jeCounts) : "—"}
                </div>
                <div>
                  <strong>Last sync:</strong> {jeLastDisplay}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">AI Status</h2>
            {aiLoading ? (
              <div className="text-sm text-muted-foreground">Checking…</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground">Core: </span>
                  <Badge
                    variant={
                      aiOk
                        ? "default"
                        : aiHealth && aiHealth["hasApiKey"]
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {aiOk
                      ? aiDeep
                        ? "OpenAI reachable"
                        : "API key present"
                      : aiReason || "AI not ready"}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">Endpoints:</div>
                  <ul className="list-disc pl-6 text-muted-foreground">
                    <li>
                      <code className="text-xs">/functions/v1/ai-summarize</code>
                    </li>
                    <li>
                      <code className="text-xs">/functions/v1/ai-codes</code>
                    </li>
                    <li>
                      <code className="text-xs">/functions/v1/ai-caption</code>
                    </li>
                  </ul>
                </div>
                <div className="text-xs text-muted-foreground">
                  Deep check: append <code>?aiDeep=1</code> to this page URL to run a live 1‑token
                  ping.
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">System Health</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Storage Buckets:</span>
                <Badge variant={systemHealth.buckets ? "default" : "destructive"}>
                  {systemHealth.buckets ? "Ready" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Organization:</span>
                <Badge variant={systemHealth.org ? "default" : "secondary"}>
                  {systemHealth.org ? "Configured" : "Not Set"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Branding:</span>
                <Badge variant={systemHealth.branding ? "default" : "secondary"}>
                  {systemHealth.branding ? "Loaded" : "Not Set"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Email (Resend):</span>
                <Badge variant={systemHealth.resend ? "default" : "secondary"}>
                  {systemHealth.resend ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>JE Shaw:</span>
                <Badge variant={systemHealth.jeShaw ? "default" : "secondary"}>
                  {systemHealth.jeShaw ? "Configured" : "Not Set"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Google One Tap:</span>
                <Badge variant={systemHealth.googleOneTap ? "default" : "secondary"}>
                  {systemHealth.googleOneTap ? "Enabled" : "Not Configured"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Mockup Generator:</span>
                <Badge variant={systemHealth.mockup ? "default" : "destructive"}>
                  {systemHealth.mockup ? "Working" : "Not Tested"}
                </Badge>
              </div>
            </div>

            {/* Test mockup function */}
            <div className="mt-4 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={mockupTesting}
                onClick={async () => {
                  setMockupTesting(true);
                  try {
                    const { data, error } = await supabase.functions.invoke("generate-mockup", {
                      body: {
                        prompt: "A clean modern roof with gray shingles",
                      },
                    });

                    if (error) throw error;

                    setSystemHealth((prev) => ({
                      ...prev,
                      mockup: !!data?.url,
                    }));
                    alert(data?.url ? "Mockup generation works!" : "No URL returned");
                  } catch (err: any) {
                    setSystemHealth((prev) => ({ ...prev, mockup: false }));
                    alert(`Mockup test failed: ${err.message || String(err)}`);
                  } finally {
                    setMockupTesting(false);
                  }
                }}
              >
                {mockupTesting ? "Testing..." : "Test Mockup Generation"}
              </Button>
            </div>
          </Card>

          {/* Security Tile - Import from separate component */}
          <div className="mt-6 rounded-lg border bg-amber-50 p-4 text-xs text-muted-foreground">
            <div className="mb-1 font-semibold">⚠️ Password Leak Protection</div>
            <p className="mb-2">
              Enable "Password strength and leaked password protection" in Supabase → Authentication
              → Providers → Email.
            </p>
            <p className="text-muted-foreground">
              This checks passwords against leaked databases during signup and password changes.
            </p>
          </div>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Quick Links</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/features">
                <Button variant="outline" className="w-full">
                  Features
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="w-full">
                  Pricing
                </Button>
              </Link>
              <Link to="/report-workbench">
                <Button variant="outline" className="w-full">
                  Report Workbench
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">
                  Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
