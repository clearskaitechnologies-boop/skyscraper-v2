/**
 * Report Workbench - AI-powered report builder with citations
 */
import { Copy, FileCheck, FileDown, Plus,Target } from "lucide-react";
import React, { useRef, useState } from "react";

// ChatPanel stub (legacy assistant retired; retained for layout compatibility).
import ChatPanel from "@/components/assistant/ChatPanel";
import MockupCard from "@/components/mockups/MockupCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EmailButtons from "@/components/workbench/EmailButtons";
import { PhotoGrid } from "@/components/workbench/PhotoGrid";
import PhotoUploader from "@/components/workbench/PhotoUploader";
import { useReportDraft } from "@/hooks/useReportDraft";
import { useWorkbenchBootstrap } from "@/hooks/useWorkbenchBootstrap";
import { supabase } from "@/integrations/supabase/client";
import { htmlSuperscriptsToMarkdown } from "@/lib/citations/markdown";
import { copyToClipboard } from "@/lib/clipboard";
import { BUILTIN_LAYOUTS, LayoutPreset } from "@/lib/layouts";

// Types exported for compatibility with other components
export type ProposalType = "retail" | "insurance" | "comprehensive";
export type SectionKey =
  | "cover"
  | "overview"
  | "code"
  | "mockup"
  | "timeline"
  | "pricing"
  | "materials"
  | "warranty"
  | "photos"
  | "weather"
  | "supplements"
  | "signature";

export default function ReportWorkbench() {
  const {
    address,
    setAddress,
    notes,
    setNotes,
    summary,
    summaryHtml,
    setFindings,
    setFindingsHtml,
    photos,
    setPhotos,
    citations,
    addCitation,
    exportPdf,
    busy,
  } = useReportDraft();

  const uploaderRef = useRef<HTMLDivElement | null>(null);
  const [seedPrompt, setSeedPrompt] = useState("");
  const [lastPdfUrl, setLastPdfUrl] = useState<string | undefined>();
  const [detectingDamage, setDetectingDamage] = useState(false);
  const [checkingCodes, setCheckingCodes] = useState(false);
  const [generatingSupplements, setGeneratingSupplements] = useState(false);

  // Auto-toggles and layout preset - load from org_defaults
  const [autoDetect, setAutoDetect] = useState(false);
  const [autoPipeline, setAutoPipeline] = useState(false);
  const [layoutPreset, setLayoutPreset] = useState<LayoutPreset>(BUILTIN_LAYOUTS[0]);

  // Load org defaults and layout preset on mount
  React.useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: prof } = await supabase
          .from("user_profiles")
          .select("org_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!prof?.org_id) return;

        // Load org defaults
        const { data: defaults } = await supabase
          .from("org_defaults")
          .select("*")
          .eq("org_id", prof.org_id)
          .maybeSingle();

        if (defaults) {
          setAutoDetect(defaults.auto_detect ?? true);
          setAutoPipeline(defaults.auto_pipeline_on_export ?? true);
        }

        // Load org layout preset
        const { data: layout } = await supabase
          .from("org_layouts")
          .select("*")
          .eq("org_id", prof.org_id)
          .maybeSingle();

        if (
          layout?.preset_json &&
          typeof layout.preset_json === "object" &&
          "sections" in layout.preset_json
        ) {
          setLayoutPreset(layout.preset_json as unknown as LayoutPreset);
        }
      } catch (error: unknown) {
        try {
          const e = error instanceof Error ? error : new Error(String(error));
          (await import("sonner")).toast.error(
            "Failed to load org settings: " + (e.message || String(e))
          );
        } catch (_e) {
          /* ignore toast load failures */
        }
      }
    })();
  }, []);

  const ensureUploadVisible = () => {
    uploaderRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const autoCircle = async (photoIndex: number) => {
    const photo = photos[photoIndex];
    if (!photo) return;

    setDetectingDamage(true);
    try {
      const { data, error } = await supabase.functions.invoke("detect-damage", {
        body: { imageUrl: photo.url },
      });

      if (error) throw error;

      // Update photo with detected boxes
      setPhotos((prev) => prev.map((p, i) => (i === photoIndex ? { ...p, boxes: data.boxes } : p)));

      alert(`Found ${data.boxes.length} damage areas`);
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      alert(e.message || "Detection failed");
    } finally {
      setDetectingDamage(false);
    }
  };

  const checkCodes = async () => {
    setCheckingCodes(true);
    try {
      const { data, error } = await supabase.functions.invoke("code-check", {
        body: {
          jurisdiction: address.split(",").pop()?.trim(),
          roofType: "asphalt",
          notes,
        },
      });

      if (error) throw error;

      // Add findings as citations
      type Finding = {
        title?: string;
        summary?: string;
        clause?: string;
        source?: string;
      };
      (data.findings || []).forEach((f: Finding) => {
        addCitation({
          id: crypto.randomUUID(),
          label: f.title || "",
          text: f.summary || "",
          source: f.clause || "",
          url: f.source || "",
          retrievedAt: new Date().toISOString(),
        });
      });

      alert(`Added ${data.findings.length} code findings`);
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      alert(e.message || "Code check failed");
    } finally {
      setCheckingCodes(false);
    }
  };

  const generateSupplements = async () => {
    setGeneratingSupplements(true);
    try {
      const { data, error } = await supabase.functions.invoke("supplement-generate", {
        body: { notes, defects: photos.length },
      });

      if (error) throw error;

      // Format supplements as text
      type SupplementItem = {
        code?: string;
        desc?: string;
        qty?: number | string;
        unit?: string;
      };
      const supplementsText = (data.items || [])
        .map((item: SupplementItem) => `${item.code}: ${item.desc} (${item.qty} ${item.unit})`)
        .join("\n");

      setNotes((prev) => prev + "\n\n## Supplements\n" + supplementsText);
      alert(`Generated ${data.items.length} supplement items`);
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      alert(e.message || "Supplement generation failed");
    } finally {
      setGeneratingSupplements(false);
    }
  };

  const { mode } = useWorkbenchBootstrap({
    onSeedPrompt: setSeedPrompt,
    ensureUploadVisible,
  });

  const handleExport = async () => {
    // Run auto-pipeline if enabled
    if (autoPipeline) {
      try {
        await checkCodes();
        await generateSupplements();
      } catch (err: unknown) {
        try {
          const e = err instanceof Error ? err : new Error(String(err));
          (await import("sonner")).toast.error("Auto-pipeline error: " + (e.message || String(e)));
        } catch (_e) {
          /* ignore toast load failures */
        }
      }
    }

    const success = await exportPdf(mode);
    if (success) {
      // In real implementation, this would come from the export function
      setLastPdfUrl("https://example.com/report.pdf");
    }
  };

  const copySummaryMd = async () => {
    const md = summaryHtml
      ? htmlSuperscriptsToMarkdown(summaryHtml, citations, "Summary")
      : `## Summary\n\n${summary || notes || ""}`;
    const ok = await copyToClipboard(md);
    alert(ok ? "Summary copied as Markdown" : "Copy failed");
  };

  const copyFullMd = async () => {
    const head = `# Insurance Report\n\n**Address:** ${address || "N/A"}\n`;
    const body = summaryHtml
      ? htmlSuperscriptsToMarkdown(summaryHtml, citations, "Findings")
      : `## Findings\n\n${summary || notes || ""}`;
    const md = `${head}\n${body}`;
    const ok = await copyToClipboard(md);
    alert(ok ? "Full report copied as Markdown" : "Copy failed");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Report Workbench</h1>

            {/* Auto-toggles */}
            <div className="flex gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoDetect}
                  onChange={(e) => setAutoDetect(e.target.checked)}
                  className="rounded"
                />
                <span>Auto-detect damage</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoPipeline}
                  onChange={(e) => setAutoPipeline(e.target.checked)}
                  className="rounded"
                />
                <span>Auto-pipeline on export</span>
              </label>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-medium">Property Address</label>
              <Input
                placeholder="123 Main St, Phoenix, AZ 85001"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium">Inspector Notes</label>
              <Textarea
                placeholder="Enter inspection notes, observations, or damage details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Photo Uploader */}
            <div ref={uploaderRef}>
              <label className="mb-2 block text-sm font-medium">Photos</label>
              <PhotoUploader
                onAdd={async (p) => {
                  const newIndex = photos.length;
                  setPhotos((prev) => [...prev, p]);

                  // Auto-detect if enabled
                  if (autoDetect) {
                    setTimeout(() => autoCircle(newIndex), 500);
                  }
                }}
              />
            </div>

            {/* Photo Grid */}
            {photos.length > 0 && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => photos.forEach((_, i) => autoCircle(i))}
                    disabled={detectingDamage}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    {detectingDamage ? "Detecting..." : "Auto-Circle All"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={checkCodes} disabled={checkingCodes}>
                    <FileCheck className="mr-2 h-4 w-4" />
                    {checkingCodes ? "Checking..." : "Check Codes"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateSupplements}
                    disabled={generatingSupplements}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {generatingSupplements ? "Generating..." : "Generate Supplements"}
                  </Button>
                </div>
                <PhotoGrid
                  photos={photos}
                  onCaption={(i, text) =>
                    setPhotos((prev) =>
                      prev.map((p, idx) => (idx === i ? { ...p, caption: text } : p))
                    )
                  }
                />
              </div>
            )}

            {/* AI Mockup Generator */}
            <MockupCard onAddPhoto={(p) => setPhotos((prev) => [...prev, p])} address={address} />

            {/* Findings Display */}
            <div>
              <label className="mb-2 block text-sm font-medium">AI Findings</label>
              {summaryHtml ? (
                <div
                  className="prose prose-sm max-w-none rounded-xl border border-border bg-muted/50 p-4"
                  dangerouslySetInnerHTML={{ __html: summaryHtml }}
                />
              ) : (
                <div className="whitespace-pre-wrap rounded-xl border border-border bg-muted/50 p-4 text-sm">
                  {summary || "Findings will appear here after AI analysis."}
                </div>
              )}
            </div>

            {/* Copy Buttons */}
            {(summary || summaryHtml) && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={copySummaryMd}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Summary (MD)
                </Button>
                <Button variant="outline" size="sm" onClick={copyFullMd}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Full Report (MD)
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* AI Assistant Panel */}
        <ChatPanel
          mode={mode}
          citations={citations}
          onSendToReport={(text) => {
            setFindings(text);
            alert("Added to Findings");
          }}
          onSendToReportHtml={(html) => {
            setFindingsHtml(html);
            alert("Added to Findings with footnotes");
          }}
          onAddCitation={(c) => {
            addCitation(c);
            alert("Citation added");
          }}
          onExport={handleExport}
        />

        {/* Seed Prompt Hint */}
        {seedPrompt && (
          <Card className="border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Suggested prompt:</strong> {seedPrompt}
            </p>
          </Card>
        )}

        {/* Export & Email */}
        {(summary || summaryHtml) && (
          <Card className="p-6">
            <div className="space-y-4">
              <Button onClick={handleExport} disabled={busy} size="lg">
                <FileDown className="mr-2 h-4 w-4" />
                {busy ? "Generating PDF..." : "Export PDF"}
              </Button>

              {lastPdfUrl && (
                <EmailButtons
                  attachmentUrl={lastPdfUrl}
                  defaultSubject={`Report for ${address || "Property"}`}
                  defaultBodyMd={`Hi,\n\nPlease find your ${mode} report attached.\n\nBest regards,\nClearSKai Team`}
                />
              )}
            </div>
          </Card>
        )}

        {busy && <div className="text-center text-sm text-muted-foreground">Rendering PDF...</div>}
      </div>
    </div>
  );
}
