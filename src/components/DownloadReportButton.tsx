import React from "react";

import { Button } from "@/components/ui/button";

type Props = {
  payload?: any; // data to send to report generator
  url?: string; // api endpoint
  filename?: string;
  children?: React.ReactNode;
};

export default function DownloadReportButton({
  payload = {},
  url = "/api/generate-pdf",
  filename = "report.pdf",
  children = "Download Report",
}: Props) {
  const [busy, setBusy] = React.useState(false);

  async function onClick() {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        // try to parse error
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          alert(json.error || JSON.stringify(json));
        } catch {
          alert(text);
        }
        return;
      }

      if (
        contentType.includes("application/pdf") ||
        contentType.includes("application/octet-stream")
      ) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }

      // fallback: try to download text/json as file
      const text = await res.text();
      const blob = new Blob([text], { type: contentType || "text/plain" });
      const u = window.URL.createObjectURL(blob);
      const a2 = document.createElement("a");
      a2.href = u;
      a2.download = filename.replace(".pdf", ".txt");
      document.body.appendChild(a2);
      a2.click();
      a2.remove();
      window.URL.revokeObjectURL(u);
    } catch (err: any) {
      alert(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={onClick} disabled={busy} variant="default" size="sm">
      {busy ? "Preparing…" : children}
    </Button>
  );
}
