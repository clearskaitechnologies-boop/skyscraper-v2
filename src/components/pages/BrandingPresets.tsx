import { useEffect, useState } from "react";
import { toast } from "sonner";

import BrandingUploader from "@/components/BrandingUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const TYPES = ["retail", "insurance", "comprehensive"] as const;

type Presets = Record<string, any>;

function Chips({
  all,
  value,
  onChange,
}: {
  all: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {all.map((s) => {
        const active = value.includes(s);
        return (
          <button
            key={s}
            onClick={() => onChange(active ? value.filter((x) => x !== s) : [...value, s])}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/50"
            }`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

export default function BrandingPresets() {
  const [row, setRow] = useState<any>(null);
  const [presets, setPresets] = useState<Presets>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const ALL_SECTIONS = [
    "cover",
    "overview",
    "code",
    "mockup",
    "timeline",
    "pricing",
    "materials",
    "warranties",
    "photos",
    "weather",
    "supplements",
    "signature",
  ];

  useEffect(() => {
    loadPresets();
  }, []);

  async function loadPresets() {
    setLoading(true);
    const { data, error } = await supabase
      .from("org_settings")
      .select("*")
      .eq("org_slug", "default")
      .maybeSingle();

    if (error) {
      toast.error("Failed to load presets: " + error.message);
    } else {
      setRow(data);
      const presetsData = (data?.presets as Presets) || {};
      setPresets(presetsData);
    }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("org_settings")
      .update({ presets, updated_at: new Date().toISOString() })
      .eq("org_slug", "default");

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Presets saved successfully");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading presets...</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposal Type Presets</h1>
          <p className="mt-1 text-muted-foreground">
            Configure default settings for each proposal type
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Presets"}
        </Button>
      </div>

      <Card className="p-4">
        <h2 className="mb-2 text-lg font-semibold">Branding</h2>
        <BrandingUploader />
      </Card>

      <div className="space-y-6">
        {TYPES.map((t) => {
          const p = presets[t] || {
            sections: [],
            cover: { template: "minimal", subtitle: "" },
            images: { quality: "medium" },
            watermark: null,
          };

          return (
            <Card key={t} className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold capitalize">{t}</h2>
              </div>

              <div className="space-y-2">
                <Label>Sections</Label>
                <Chips
                  all={ALL_SECTIONS}
                  value={p.sections || []}
                  onChange={(v) => setPresets((old) => ({ ...old, [t]: { ...p, sections: v } }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cover Template</Label>
                  <Select
                    value={p.cover?.template || "minimal"}
                    onValueChange={(val) =>
                      setPresets((old) => ({
                        ...old,
                        [t]: { ...p, cover: { ...p.cover, template: val } },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="split">Split</SelectItem>
                      <SelectItem value="photo">Photo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cover Subtitle</Label>
                  <Input
                    value={p.cover?.subtitle || ""}
                    onChange={(e) =>
                      setPresets((old) => ({
                        ...old,
                        [t]: { ...p, cover: { ...p.cover, subtitle: e.target.value } },
                      }))
                    }
                    placeholder="e.g., Retail Proposal"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hero Photo URL</Label>
                  <Input
                    value={p.cover?.photoUrl || ""}
                    onChange={(e) =>
                      setPresets((old) => ({
                        ...old,
                        [t]: { ...p, cover: { ...p.cover, photoUrl: e.target.value } },
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Gradient From</Label>
                  <Input
                    value={p.cover?.gradient?.from || ""}
                    onChange={(e) =>
                      setPresets((old) => ({
                        ...old,
                        [t]: {
                          ...p,
                          cover: {
                            ...p.cover,
                            gradient: { ...(p.cover?.gradient || {}), from: e.target.value },
                          },
                        },
                      }))
                    }
                    placeholder="#0ea5e9"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gradient To</Label>
                  <Input
                    value={p.cover?.gradient?.to || ""}
                    onChange={(e) =>
                      setPresets((old) => ({
                        ...old,
                        [t]: {
                          ...p,
                          cover: {
                            ...p.cover,
                            gradient: { ...(p.cover?.gradient || {}), to: e.target.value },
                          },
                        },
                      }))
                    }
                    placeholder="#2563eb"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image Quality</Label>
                  <Select
                    value={p.images?.quality || "medium"}
                    onValueChange={(val) =>
                      setPresets((old) => ({
                        ...old,
                        [t]: { ...p, images: { ...p.images, quality: val } },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Watermark Text</Label>
                  <Input
                    value={p.watermark?.text || ""}
                    onChange={(e) =>
                      setPresets((old) => ({
                        ...old,
                        [t]: { ...p, watermark: { ...(p.watermark || {}), text: e.target.value } },
                      }))
                    }
                    placeholder="CONFIDENTIAL"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Watermark Opacity</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={p.watermark?.opacity ?? 0.06}
                    onChange={(e) =>
                      setPresets((old) => ({
                        ...old,
                        [t]: {
                          ...p,
                          watermark: { ...(p.watermark || {}), opacity: Number(e.target.value) },
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`diagonal-${t}`}
                      checked={p.watermark?.diagonal ?? true}
                      onCheckedChange={(checked) =>
                        setPresets((old) => ({
                          ...old,
                          [t]: {
                            ...p,
                            watermark: { ...(p.watermark || {}), diagonal: checked },
                          },
                        }))
                      }
                    />
                    <Label htmlFor={`diagonal-${t}`} className="text-sm font-normal">
                      Diagonal
                    </Label>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
