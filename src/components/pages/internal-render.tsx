import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { RenderContext } from "@/types/reportTypes";

// Minimal internal render page for Puppeteer parity renders.
// Usage: /internal-render?page=A&jobId=...&renderContext=<base64 JSON>

export default function InternalRender() {
  const router = useRouter();
  const { page, jobId, renderContext: rcB64 } = router.query as Record<string, string | undefined>;
  const [ctx, setCtx] = useState<RenderContext | null>(null);

  useEffect(() => {
    if (!rcB64) return;
    try {
      const b64 = String(rcB64);
      // decode base64 (browser)
      const json = atob(b64);
      const parsed = JSON.parse(json);
      setCtx(parsed as RenderContext);
      // expose to Puppeteer
      // @ts-ignore
      window.__SKAISCRAPER_RENDER_CONTEXT = parsed;
      // small timeout to let any client templates mount
      setTimeout(() => {
        // @ts-ignore
        window.__SKAISCRAPER_RENDER_READY = true;
      }, 50);
    } catch (err) {
      // make sure flag is still set so Puppeteer doesn't hang
      // @ts-ignore
      window.__SKAISCRAPER_RENDER_READY = true;
    }
  }, [rcB64]);

  // Simple renderer: try to render a JSON-backed preview or show a placeholder
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 24, background: "#fff" }}>
      <div style={{ marginBottom: 8, color: "#0A1A2F", fontWeight: 700 }}>
        SkaiScraper™ — Internal Render
      </div>
      <div style={{ fontSize: 13, marginBottom: 12, color: "#334155" }}>
        page: {String(page ?? "unknown")} jobId: {String(jobId ?? "")}
      </div>

      <div
        style={{ border: "1px solid #E6EEF8", padding: 18, borderRadius: 8, background: "#fff" }}
      >
        {ctx ? (
          <div>
            <h2 style={{ marginTop: 0 }}>{ctx.org?.name ?? "Organization"}</h2>
            <div style={{ marginBottom: 12 }}>{ctx.project?.address ?? "No project address"}</div>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 12,
                background: "#f8fafc",
                padding: 12,
                borderRadius: 6,
              }}
            >
              {JSON.stringify(ctx, null, 2)}
            </pre>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 8 }}>No renderContext provided.</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Provide a base64-encoded renderContext via ?renderContext=
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
