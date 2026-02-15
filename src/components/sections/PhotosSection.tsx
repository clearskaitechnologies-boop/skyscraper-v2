import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export type PhotoItem = {
  id: string;
  url: string;
  caption?: string;
  label?: string;
  pageBreakBefore?: boolean;
};

export type PhotosState = {
  items: PhotoItem[];
};

export type PhotosSectionProps = {
  owner?: string | null;
  title?: string;
  value: PhotosState;
  onChange: (v: PhotosState) => void;
};

export default function PhotosSection({ owner, title, value, onChange }: PhotosSectionProps) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function addLocalFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);

    for (const file of Array.from(files)) {
      try {
        const safeTitle = (title || "photo").replace(/[^a-z0-9\-_. ]/gi, "_");
        const path = `${owner || "public"}/photos/${Date.now()}-${safeTitle}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("reports")
          .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("reports").getPublicUrl(path);
        onChange({
          items: [
            ...value.items,
            {
              id: crypto.randomUUID(),
              url: data.publicUrl,
              caption: "",
              label: "",
            },
          ],
        });
      } catch (error) {
        const url = URL.createObjectURL(file);
        onChange({
          items: [...value.items, { id: crypto.randomUUID(), url, caption: "", label: "" }],
        });
        toast.error("Upload failed, using local preview");
      }
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function pasteFromClipboard(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type.startsWith("image/")) {
        const file = it.getAsFile();
        if (file) addLocalFiles({ 0: file, length: 1, item: () => file } as any);
      }
    }
  }

  function setField(id: string, patch: Partial<PhotoItem>) {
    onChange({
      items: value.items.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }

  function remove(id: string) {
    onChange({ items: value.items.filter((p) => p.id !== id) });
  }

  function move(id: string, dir: -1 | 1) {
    const idx = value.items.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const j = idx + dir;
    if (j < 0 || j >= value.items.length) return;
    const next = [...value.items];
    const [row] = next.splice(idx, 1);
    next.splice(j, 0, row);
    onChange({ items: next });
  }

  return (
    <section className="mb-6 space-y-3" onPaste={pasteFromClipboard}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Inspection Photos</h2>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => addLocalFiles(e.target.files)}
          />
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            ⬆ Upload
          </Button>
        </div>
      </div>
      <p className="text-xs opacity-60">Tip: you can also paste images from your clipboard here.</p>

      {value.items.length === 0 ? (
        <p className="text-sm opacity-70">Add photos to include annotated visuals in the PDF.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {value.items.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-3 ${p.pageBreakBefore ? "pdf-break-before" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => move(p.id, -1)}>
                    ↑
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => move(p.id, +1)}>
                    ↓
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={!!p.pageBreakBefore}
                    onChange={(e) => setField(p.id, { pageBreakBefore: e.target.checked })}
                  />
                  <span>Page break</span>
                </div>
              </div>
              <img
                src={p.url}
                alt={p.caption || p.label || "photo"}
                className="w-full rounded-lg border"
              />
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <Input
                  placeholder="Label"
                  value={p.label || ""}
                  onChange={(e) => setField(p.id, { label: e.target.value })}
                />
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                  Remove
                </Button>
              </div>
              <Textarea
                className="mt-2"
                placeholder="Caption"
                value={p.caption || ""}
                onChange={(e) => setField(p.id, { caption: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
