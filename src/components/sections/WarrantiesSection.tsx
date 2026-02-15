"use client";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export type WarrantyDoc = {
  id: string;
  label: string;
  type: "workmanship" | "manufacturer" | "other";
  termYears?: number;
  coverage?: string;
  url?: string;
};

export type WarrantiesState = {
  highlights: string;
  docs: WarrantyDoc[];
};

export default function WarrantiesSection({
  value,
  onChange,
  owner,
  title,
  systemType,
}: {
  value: WarrantiesState;
  onChange: (v: WarrantiesState) => void;
  owner?: string | null;
  title?: string;
  systemType?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const v: WarrantiesState = value || { highlights: defaultHighlights(systemType), docs: [] };

  function upd(patch: Partial<WarrantiesState>) {
    onChange({ ...v, ...patch });
  }

  function addDoc(doc: Partial<WarrantyDoc>) {
    const allowedTypes = new Set<WarrantyDoc["type"]>(["workmanship", "manufacturer", "other"]);
    const t =
      typeof doc.type === "string" && allowedTypes.has(doc.type as WarrantyDoc["type"])
        ? (doc.type as WarrantyDoc["type"])
        : "other";
    const w: WarrantyDoc = {
      id: crypto.randomUUID(),
      label: doc.label || "Warranty",
      type: t,
      termYears: doc.termYears,
      coverage: doc.coverage || "",
      url: doc.url,
    };
    upd({ docs: [...(v.docs || []), w] });
  }

  function rmDoc(id: string) {
    upd({ docs: (v.docs || []).filter((d) => d.id !== id) });
  }
  function setDoc(id: string, patch: Partial<WarrantyDoc>) {
    upd({ docs: (v.docs || []).map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  }

  async function uploadFile(file: File) {
    setBusy(true);
    try {
      const safeTitle = (title || "warranty").replace(/[^a-z0-9\-_. ]/gi, "_");
      const path = `${owner || "public"}/warranties/${Date.now()}-${safeTitle}-${file.name}`;

      const arrayBuffer = await file.arrayBuffer();
      const { error } = await supabase.storage.from("reports").upload(path, arrayBuffer, {
        upsert: false,
        contentType: file.type || "application/pdf",
      });

      if (error) throw error;

      const { data } = supabase.storage.from("reports").getPublicUrl(path);
      addDoc({ label: file.name, type: "other", url: data.publicUrl });
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      alert(err.message || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function pickFile() {
    inputRef.current?.click();
  }

  return (
    <section className="mb-6" id="sec-warranty">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Warranties & Guarantees</h2>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
          />
          <Button size="sm" variant="outline" onClick={pickFile} disabled={busy}>
            + Add PDF/Image
          </Button>
          <Button size="sm" onClick={() => upd({ highlights: defaultHighlights(systemType) })}>
            ↻ Preset
          </Button>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        <div className="text-[13px] uppercase tracking-wide opacity-60">Highlights</div>
        <Textarea
          className="min-h-[100px]"
          value={v.highlights}
          onChange={(e) => upd({ highlights: e.target.value })}
          placeholder="Summarize workmanship and manufacturer coverage, transferability, exclusions, and registration requirements."
        />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {(v.docs || []).map((d) => (
          <div key={d.id} className="rounded-xl border p-3">
            <div className="grid grid-cols-12 items-center gap-2">
              <Input
                className="col-span-6"
                value={d.label}
                onChange={(e) => setDoc(d.id, { label: e.target.value })}
              />
              <select
                className="col-span-3 rounded border px-3 py-2"
                value={d.type}
                onChange={(e) => setDoc(d.id, { type: e.target.value as WarrantyDoc["type"] })}
              >
                <option value="workmanship">Workmanship</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="other">Other</option>
              </select>
              <Input
                className="col-span-2"
                type="number"
                placeholder="Years"
                value={d.termYears ?? ""}
                onChange={(e) => setDoc(d.id, { termYears: Number(e.target.value) })}
              />
              <Button className="col-span-1" size="sm" variant="ghost" onClick={() => rmDoc(d.id)}>
                ✕
              </Button>
              <Input
                className="col-span-12"
                placeholder="Coverage summary"
                value={d.coverage || ""}
                onChange={(e) => setDoc(d.id, { coverage: e.target.value })}
              />
              {d.url && (
                <a
                  className="col-span-12 text-xs text-blue-600 underline"
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View file
                </a>
              )}
            </div>
          </div>
        ))}
        {(!v.docs || v.docs.length === 0) && (
          <div className="text-sm opacity-70">
            Attach manufacturer PDFs (system warranty, shingle limited warranty, membrane specs) and
            your workmanship terms.
          </div>
        )}
      </div>
    </section>
  );
}

function defaultHighlights(systemType?: string) {
  const base =
    "Workmanship warranty covers installation defects for the term below. Manufacturer warranty applies per product class when installed to published specifications.";
  switch ((systemType || "").toLowerCase()) {
    case "shingle":
      return (
        base +
        " Architectural shingles typically include limited lifetime material coverage with non-prorated period; wind rating per manufacturer when installed with matching components."
      );
    case "tpo":
      return (
        base +
        " TPO membranes may carry 20–30 year material warranties with manufacturer inspection and registered details for flashings and terminations."
      );
    case "tile":
      return (
        base +
        " Concrete/clay tile systems include material coverage on tiles; underlayment and fastening must match code and manufacturer specs."
      );
    case "metal":
      return (
        base +
        " Painted metal panels typically include finish warranties (e.g., 20–40 years) with specific maintenance requirements."
      );
    default:
      return base;
  }
}
