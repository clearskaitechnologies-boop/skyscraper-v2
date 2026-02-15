/**
 * Photo uploader for workbench - uploads via server-side API
 */
import { Upload } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";

interface PhotoUploaderProps {
  onAdd: (photo: { url: string; caption?: string }) => void;
}

export default function PhotoUploader({ onAdd }: PhotoUploaderProps) {
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      alert("Please upload JPG/PNG/WebP");
      return;
    }

    setBusy(true);
    try {
      // Upload via server-side API for reliable storage with service role key
      const formData = new FormData();
      formData.append("file", f);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await res.json();
      onAdd({ url });
    } catch (err: any) {
      alert(err.message || String(err));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          onChange={onFile}
          disabled={busy}
          id="photo-upload"
          className="hidden"
        />
        <label htmlFor="photo-upload">
          <Button variant="outline" disabled={busy} asChild>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              {busy ? "Uploading..." : "Upload Photo"}
            </span>
          </Button>
        </label>
        {busy && <span className="text-sm text-muted-foreground">Uploading...</span>}
      </div>
    </div>
  );
}
