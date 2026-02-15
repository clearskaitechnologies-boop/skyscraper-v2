import React from "react";

import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useToast } from "@/hooks/useToast";
import { aiCaption,aiSummarize } from "@/lib/aiClient";
import { exportPdfFromHtml } from "@/lib/pdfExportClient";
import { useOffscreen } from "@/lib/pdfExportClient";
import { inlineImage } from "@/lib/pdfExportClient";
import { renderPdfHtml } from "@/lib/pdfTemplates";

export default function FirstReportWizard() {
  const t = useToast();
  const query = useQueryParams();
  const [step, setStep] = React.useState(1);
  const [busy, setBusy] = React.useState(false);
  const [reportId] = React.useState(() => Math.random().toString(36).slice(2));

  // Read mode from query params
  const modeParam = (query.get("mode") || "inspection").toLowerCase();
  const allowedModes = ["inspection", "insurance", "retail"] as const;
  type Mode = (typeof allowedModes)[number];
  const mode: Mode = allowedModes.includes(modeParam as Mode) ? (modeParam as Mode) : "inspection";

  // State
  const [address, setAddress] = React.useState("");
  const [lat, setLat] = React.useState("");
  const [lon, setLon] = React.useState("");

  const [files, setFiles] = React.useState<File[]>([]);
  const [photos, setPhotos] = React.useState<{ url: string; caption?: string }[]>([]);

  const [notes, setNotes] = React.useState("");
  const [summary, setSummary] = React.useState("");

  const mountRef = useOffscreen();

  const heading =
    mode === "retail"
      ? "Retail Proposal"
      : mode === "insurance"
        ? "Insurance Report"
        : "Inspection Report";

  async function onSelectFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list);
    setFiles(arr);
    const results: { url: string; caption?: string }[] = [];
    for (const f of arr) {
      const url = URL.createObjectURL(f);
      let caption = "";
      try {
        caption = await aiCaption({ fileName: f.name, context: "roof inspection" });
      } catch (e: unknown) {
        console.error("Caption generation failed:", e);
      }
      results.push({ url, caption });
    }
    setPhotos(results);
    t.success("Photos added with auto captions");
  }

  async function runSummary() {
    setBusy(true);
    try {
      const s = await aiSummarize({ notes, jeSnapshot: undefined, mode });
      setSummary(s);
      t.success("AI summary ready");
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      t.error("AI summarize failed");
      console.error("AI summarize error:", err);
    } finally {
      setBusy(false);
    }
  }

  async function previewAndPdf() {
    setBusy(true);
    try {
      // Inline images for speed/reliability
      const inlined = await Promise.all(
        photos.map(async (p) => ({ url: await inlineImage(p.url), caption: p.caption }))
      );
      const html = renderPdfHtml(mode, {
        brand: { logoUrl: (window as unknown as { __BRAND_LOGO__?: string }).__BRAND_LOGO__ || "" },
        heading,
        property: { address },
        photos: inlined,
        ai_summary: summary || notes,
      });
      if (mountRef.current) mountRef.current.innerHTML = html;
      await exportPdfFromHtml(mountRef.current!, `report-${reportId}.pdf`);
      t.success("PDF generated");
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      t.error("PDF generation failed");
      console.error("PDF error:", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-24">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">First Report Wizard</h1>
          <p className="text-muted-foreground">
            Create a demo {heading.toLowerCase()} in four quick steps.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex flex-wrap gap-2">
          {["Property", "Photos", "Findings", "Preview"].map((label, i) => (
            <div
              key={label}
              className={`rounded-full border px-4 py-2 ${
                i + 1 === step ? "bg-primary text-primary-foreground" : "bg-background"
              }`}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        {/* Step content */}
        {step === 1 && (
          <section className="rounded-xl border p-8">
            <h3 className="mb-6 text-2xl font-semibold">Property</h3>
            <div className="space-y-4">
              <input
                className="w-full rounded-xl border p-3"
                placeholder="123 Main St, City, ST"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="rounded-xl border p-3"
                  placeholder="Latitude (optional)"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
                <input
                  className="rounded-xl border p-3"
                  placeholder="Longitude (optional)"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setStep(2)}>Next: Photos</Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-xl border p-8">
            <h3 className="mb-6 text-2xl font-semibold">Photos</h3>
            <input
              type="file"
              multiple
              onChange={(e) => onSelectFiles(e.target.files)}
              className="mb-6"
            />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {photos.map((p, i) => (
                <div key={i} className="rounded-xl border p-2">
                  <img
                    src={p.url}
                    className="h-40 w-full rounded-lg object-cover"
                    alt={`Photo ${i + 1}`}
                  />
                  <div className="mt-2 text-xs text-muted-foreground">{p.caption || "—"}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Next: Findings</Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="rounded-xl border p-8">
            <h3 className="mb-6 text-2xl font-semibold">Findings</h3>
            <textarea
              className="min-h-32 w-full rounded-xl border p-3"
              placeholder="Inspector notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-4 flex gap-3">
              <Button disabled={busy} onClick={runSummary}>
                {busy ? "Working…" : "AI Summarize"}
              </Button>
            </div>
            <div className="mt-4 whitespace-pre-wrap rounded-xl border bg-muted/50 p-4">
              {summary || "AI summary will appear here."}
            </div>
            <div className="mt-6 flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)}>Next: Preview</Button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="rounded-xl border p-8">
            <h3 className="mb-6 text-2xl font-semibold">Preview & Export</h3>
            <p className="mb-6 text-muted-foreground">
              We'll pre-render off-screen for speed, then export as PDF.
            </p>
            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button disabled={busy} onClick={previewAndPdf}>
                {busy ? "Rendering…" : "Generate PDF"}
              </Button>
            </div>
            {/* off-screen mount */}
            <div ref={mountRef} />
          </section>
        )}
      </div>
    </div>
  );
}
