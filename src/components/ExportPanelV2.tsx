import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { EXPORT_THEMES } from "@/lib/exportThemes";

type SectionKey =
  | "cover"
  | "summary"
  | "photos"
  | "materials"
  | "warranties"
  | "timeline"
  | "prices"
  | "code"
  | "signatures";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "cover", label: "Cover Page" },
  { key: "summary", label: "Overview & Summary" },
  { key: "photos", label: "Inspection Photos" },
  { key: "materials", label: "Materials & Colors" },
  { key: "warranties", label: "Warranties" },
  { key: "timeline", label: "Project Timeline" },
  { key: "prices", label: "Price Breakdown" },
  { key: "code", label: "Code & Compliance" },
  { key: "signatures", label: "Signatures & Next Steps" },
];

interface ExportPanelV2Props {
  reportId: string;
}

export default function ExportPanelV2({ reportId }: ExportPanelV2Props) {
  const [theme, setTheme] = useState("clearskai");
  const [watermark, setWatermark] = useState<"none" | "draft" | "confidential" | "client-review">(
    "none"
  );
  const [sections, setSections] = useState<SectionKey[]>([
    "cover",
    "summary",
    "photos",
    "materials",
    "signatures",
  ]);
  const [photoLayout, setPhotoLayout] = useState<"grid2" | "grid3" | "grid4">("grid3");
  const [addToc, setAddToc] = useState(true);
  const [pageNumbers, setPageNumbers] = useState(true);
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>();

  const toggleSection = (key: SectionKey) => {
    setSections((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  };

  async function handleExport() {
    setBusy(true);
    setDownloadUrl(undefined);

    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf-v2", {
        body: {
          reportId,
          themeId: theme,
          watermark: watermark === "none" ? null : watermark,
          sections,
          photoLayout,
          addToc,
          pageNumbers,
        },
      });

      if (error) throw error;

      if (data?.url) {
        setDownloadUrl(data.url);
        toast.success("PDF exported successfully!");
      } else {
        throw new Error("No download URL returned");
      }
    } catch (e: any) {
      console.error("Export error:", e);
      toast.error(e.message || "Export failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 rounded-xl border bg-card p-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Export Settings</h3>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="theme">Brand Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_THEMES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="watermark">Watermark</Label>
            <Select value={watermark} onValueChange={(v: any) => setWatermark(v)}>
              <SelectTrigger id="watermark">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="confidential">Confidential</SelectItem>
                <SelectItem value="client-review">For Client Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="photo-layout">Photo Layout</Label>
            <Select value={photoLayout} onValueChange={(v: any) => setPhotoLayout(v)}>
              <SelectTrigger id="photo-layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid2">2 per page</SelectItem>
                <SelectItem value="grid3">3 per page</SelectItem>
                <SelectItem value="grid4">4 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <Label>Include Sections</Label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {SECTIONS.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`section-${key}`}
                  checked={sections.includes(key)}
                  onCheckedChange={() => toggleSection(key)}
                />
                <Label htmlFor={`section-${key}`} className="cursor-pointer text-sm font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="add-toc"
              checked={addToc}
              onCheckedChange={(checked) => setAddToc(checked as boolean)}
            />
            <Label htmlFor="add-toc" className="cursor-pointer">
              Table of Contents
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="page-numbers"
              checked={pageNumbers}
              onCheckedChange={(checked) => setPageNumbers(checked as boolean)}
            />
            <Label htmlFor="page-numbers" className="cursor-pointer">
              Page Numbers
            </Label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleExport} disabled={busy || sections.length === 0} className="gap-2">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export PDF
            </>
          )}
        </Button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Download PDF
          </a>
        )}
      </div>
    </div>
  );
}
