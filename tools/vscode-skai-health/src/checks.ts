import spawn from "cross-spawn";
import * as dns from "dns/promises";
import * as fs from "fs";
import fetch from "node-fetch";
import * as path from "path";

let logProc: any = null;

export async function runAllChecks() {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://skaiscrape.com";
  const endpoints = [
    "/api/health/live",
    "/api/health/ready",
    "/",
    "/dashboard",
    "/ai",
    "/report-workbench",
    "/crm",
    "/governance",
    "/billing",
    "/map",
  ];

  const epResults = await Promise.all(
    endpoints.map(async (p) => {
      const url = base.replace(/\/$/, "") + p;
      try {
        const r = await fetch(url, { method: "GET" });
        return { url, ok: r.ok, status: r.status };
      } catch (e: any) {
        return { url, ok: false, status: e.message || "ERR" };
      }
    })
  );

  // DNS
  let dnsResult: any = { ok: false };
  try {
    const { address } = await dns.lookup("skaiscrape.com");
    dnsResult = { ok: !!address, address };
  } catch (e: any) {
    dnsResult = { ok: false, error: e?.message };
  }

  // Env sanity (local files)
  const mustHave = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "SENTRY_DSN",
    "NEXT_PUBLIC_POSTHOG_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
  ];
  const envPaths = [
    path.resolve(process.cwd(), ".env.production.local"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
  ];
  const present = new Map<string, boolean>();
  for (const name of mustHave) present.set(name, false);
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const txt = fs.readFileSync(envPath, "utf8");
      for (const name of mustHave) {
        if (!present.get(name) && new RegExp(`^${name}=`, "m").test(txt)) {
          present.set(name, true);
        }
      }
    }
  }
  const envKeys = mustHave.map((name) => ({
    name,
    present: !!present.get(name),
  }));

  // Stripe webhook probe (lightweight – just hits your route without real signature)
  let stripeProbe: any = { ok: false };
  try {
    const r = await fetch(base.replace(/\/$/, "") + "/api/stripe/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": "skai-health-probe",
      },
      body: JSON.stringify({ type: "skai.health.probe" }),
    });
    stripeProbe = { ok: r.ok, status: r.status };
  } catch (e: any) {
    stripeProbe = { ok: false, status: e?.message || "ERR" };
  }

  return {
    endpoints: epResults,
    dns: dnsResult,
    env: { keys: envKeys },
    stripe: stripeProbe,
  };
}

export function toggleVercelLogs(onLine: (s: string) => void) {
  if (logProc) {
    logProc.kill();
    logProc = null;
    return false;
  }
  // Requires vercel CLI installed and logged in
  const domain = "skaiscrape.com";
  logProc = spawn("vercel", ["logs", domain, "-f"]);
  logProc.stdout.on("data", (d) => onLine(d.toString().trim()));
  logProc.stderr.on("data", (d) => onLine(d.toString().trim()));
  logProc.on("close", () => (logProc = null));
  return true;
}
