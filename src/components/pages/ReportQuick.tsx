import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { createReport, uploadReportPhotos } from "@/api/reports";
import { LayoutSelector } from "@/components/reports/LayoutSelector";
import { useToast } from "@/hooks/use-toast";
import { aiCaptionPhoto } from "@/hooks/useAiCaption";
import { supabase } from "@/integrations/supabase/client";
import { applyBrandTheme, Branding,loadBranding } from "@/lib/branding";

type Layout = "2up" | "3up" | "4up";

export default function ReportQuick() {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState<Record<number, boolean>>({});
  const [layout, setLayout] = useState<Layout>("2up");
  const [summary, setSummary] = useState<string>(
    "**Summary of Findings:**\n\n• Hail damage to shingles.\n• Shingles folded over, indicating high wind damage.\n\n**Recommended Next Actions:**\n\n• Perform a full roof inspection to assess the extent of hail and wind damage.\n• Document all damaged areas with photos and measurements."
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const b = await loadBranding();
      setBranding(b);
      applyBrandTheme(b);
    })();
  }, []);

  async function handleAiCaption(index: number) {
    if (!photoIds[index]) {
      toast({ title: "Please save report first to enable AI captions", variant: "destructive" });
      return;
    }

    try {
      setAiLoading((prev) => ({ ...prev, [index]: true }));
      await aiCaptionPhoto(photoIds[index]);

      // Fetch updated caption
      const { data } = await supabase
        .from("report_photos")
        .select("caption")
        .eq("id", photoIds[index])
        .single();

      if (data?.caption) {
        const newCaptions = [...captions];
        newCaptions[index] = data.caption;
        setCaptions(newCaptions);
        toast({ title: "AI caption generated!" });
      }
    } catch (error: any) {
      toast({ title: "AI caption failed", description: error.message, variant: "destructive" });
    } finally {
      setAiLoading((prev) => ({ ...prev, [index]: false }));
    }
  }

  async function onGenerate() {
    if (files.length === 0) {
      toast({ title: "Please upload at least one photo", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1) Save report with layout
      const reportId = await createReport({
        title: "Inspection Report",
        mode: "inspection",
        summary_md: summary,
        data: { layout },
      });

      // 2) Upload photos + captions
      const payload = files.map((f, i) => ({ file: f, caption: captions[i] ?? "", sort_order: i }));
      await uploadReportPhotos(reportId, payload);

      // 3) Fetch photo IDs for AI captions
      const { data: photos } = await supabase
        .from("report_photos")
        .select("id")
        .eq("report_id", reportId)
        .order("sort_order");

      if (photos) {
        setPhotoIds(photos.map((p) => p.id));
      }

      // 4) Render PDF from DOM
      await renderPdf(reportId);

      toast({ title: "Report created successfully! You can now use AI captions." });
    } catch (error: any) {
      toast({ title: "Error creating report", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function renderPdf(reportId: string) {
    const el = document.getElementById("pdf-root");
    if (!el) return;

    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "letter");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const aspect = canvas.width / canvas.height;
    const targetW = pageW - 144;
    const targetH = targetW / aspect;
    const x = 72;
    const y = 72;

    pdf.addImage(img, "PNG", x, y, targetW, Math.min(targetH, pageH - 144));
    pdf.save(`report-${reportId}.pdf`);
  }

  const gridClass =
    layout === "4up"
      ? "grid-cols-4 gap-3"
      : layout === "3up"
        ? "grid-cols-3 gap-4"
        : "grid-cols-2 gap-6";

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="brand-primary text-2xl font-semibold">Quick Inspection Report</h1>
        <p className="text-sm text-muted-foreground">
          Upload photos, add captions, select layout, and generate a branded PDF
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {/* Layout Selector */}
          <div className="rounded-lg border bg-card p-4">
            <LayoutSelector value={layout} onChange={setLayout} />
          </div>

          {/* File Upload */}
          <div className="rounded-lg border bg-card p-4">
            <label className="mb-2 block text-sm font-medium">Upload Photos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground"
              onChange={(e) => {
                const f = Array.from(e.target.files ?? []);
                setFiles(f);
                setCaptions(f.map(() => ""));
                setPhotoIds(f.map(() => ""));
              }}
            />
          </div>

          {/* Captions with AI Button */}
          {files.map((f, i) => (
            <div key={i} className="space-y-2 rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2">
                <img
                  src={URL.createObjectURL(f)}
                  alt=""
                  className="h-12 w-16 rounded object-cover"
                />
                <div className="flex-1 text-xs text-muted-foreground">{f.name}</div>
              </div>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Caption..."
                value={captions[i] ?? ""}
                onChange={(e) => {
                  const next = [...captions];
                  next[i] = e.target.value;
                  setCaptions(next);
                }}
              />
              <button
                onClick={() => handleAiCaption(i)}
                disabled={!photoIds[i] || aiLoading[i]}
                className="flex items-center gap-2 rounded bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
              >
                {aiLoading[i] ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    AI Caption
                  </>
                )}
              </button>
            </div>
          ))}

          {/* Summary */}
          <div className="rounded-lg border bg-card p-4">
            <label className="mb-2 block text-sm font-medium">Summary</label>
            <textarea
              className="min-h-[200px] w-full rounded border px-3 py-2 text-sm"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <button
            className="w-full rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            onClick={onGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Save & Download PDF"}
          </button>
        </div>

        {/* PDF Preview */}
        <div className="max-h-[800px] overflow-auto rounded-lg border bg-card p-4">
          <div id="pdf-root" className="bg-white p-8" style={{ width: 816, minHeight: 1056 }}>
            {/* Header */}
            <div className="mb-16 flex items-center gap-16">
              {branding?.logo_url && (
                <img src={branding.logo_url} alt="logo" style={{ height: 64 }} />
              )}
              <div style={{ color: "var(--brand-primary)" }}>
                <div className="text-xl font-semibold">{branding?.company_name ?? "Company"}</div>
                <div className="text-sm">
                  {branding?.phone ? `${branding.phone} • ` : ""}
                  {branding?.email ?? ""}
                </div>
                <div className="text-xs" style={{ color: "#64748b" }}>
                  {branding?.address1 ? `${branding.address1}, ` : ""}
                  {branding?.city ?? ""} {branding?.state ?? ""} {branding?.postal ?? ""}
                  {branding?.website ? ` • ${branding.website}` : ""}
                </div>
              </div>
            </div>

            <div className="mb-6 text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
              Inspection Report
            </div>

            <div className="mb-12">
              <div className="mb-2 text-lg font-semibold" style={{ color: "var(--brand-primary)" }}>
                Summary
              </div>
              <div className="text-sm" style={{ lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {summary}
              </div>
            </div>

            <div className="mb-4 text-lg font-semibold" style={{ color: "var(--brand-primary)" }}>
              Photos
            </div>
            <div className={`grid ${gridClass}`}>
              {files.map((f, i) => (
                <figure key={i}>
                  <img
                    src={URL.createObjectURL(f)}
                    alt={captions[i] || `Photo ${i + 1}`}
                    style={{ width: "100%", borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                  {captions[i] && (
                    <figcaption className="mt-2 text-xs" style={{ color: "#64748b" }}>
                      {captions[i]}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
