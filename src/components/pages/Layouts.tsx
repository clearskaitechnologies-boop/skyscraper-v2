/**
 * Layout Builder - Pick and customize report section order
 */
import { useEffect,useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { BUILTIN_LAYOUTS, LayoutPreset } from "@/lib/layouts";

export default function Layouts() {
  const [preset, setPreset] = useState<LayoutPreset>(BUILTIN_LAYOUTS[0]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadOrgLayout();
  }, []);

  async function loadOrgLayout() {
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
      setOrgId(prof.org_id);

      const { data: ol } = await supabase
        .from("org_layouts")
        .select("*")
        .eq("org_id", prof.org_id)
        .maybeSingle();

      if (ol?.preset_json && typeof ol.preset_json === "object" && "sections" in ol.preset_json) {
        setPreset(ol.preset_json as unknown as LayoutPreset);
      }
    } catch (error: any) {
      console.error("Failed to load org layout:", error);
    }
  }

  async function saveOrgLayout() {
    if (!orgId) {
      toast.error("No organization found");
      return;
    }

    try {
      await supabase.from("org_layouts").upsert({
        org_id: orgId,
        preset_id: preset.id,
        preset_json: preset,
        updated_at: new Date().toISOString(),
      });

      toast.success("Layout saved as org default");
    } catch (error: any) {
      console.error("Failed to save layout:", error);
      toast.error(error.message || "Failed to save layout");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Report Layout</h1>
        <p className="text-muted-foreground">
          Choose your default report structure and section order
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Preset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select
            value={preset.id}
            onValueChange={(id) => {
              const found = BUILTIN_LAYOUTS.find((p) => p.id === id);
              if (found) setPreset(found);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUILTIN_LAYOUTS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Sections</h3>
              <div className="flex flex-wrap gap-2">
                {preset.sections.map((sec) => (
                  <div
                    key={sec}
                    className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {sec}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Photo Layout</h3>
              <p className="text-sm text-muted-foreground">{preset.photoLayout} photos per page</p>
            </div>

            {preset.options && (
              <div>
                <h3 className="mb-2 font-semibold">Options</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {preset.options.showOverlays && <li>✓ Show damage overlays</li>}
                  {preset.options.citations && <li>✓ Include citations</li>}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={saveOrgLayout} className="flex-1">
              Save as Org Default
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preset Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold">Claims – Standard</h4>
            <p className="text-sm text-muted-foreground">
              Carrier-ready format with storm data, code compliance, damage photos with overlays,
              and supplement recommendations. Includes full citations.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Retail – Sales</h4>
            <p className="text-sm text-muted-foreground">
              Customer-facing proposal with before/after mockups, pricing options, and clean photo
              presentation. No overlays or technical citations.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Inspection – Lite</h4>
            <p className="text-sm text-muted-foreground">
              Quick inspection report with executive summary and annotated photos. Minimal technical
              detail.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
