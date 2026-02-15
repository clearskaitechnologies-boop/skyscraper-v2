"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";

export default function CoLogoUploader({ orgId }: { orgId: string }) {
  const [busy, setBusy] = useState(false);
  const t = useToast();

  async function onFile(f?: File | null) {
    if (!f) return;
    setBusy(true);
    try {
      // Upload via server-side API for reliable storage with service role key
      const formData = new FormData();
      formData.append("file", f);
      formData.append("type", "logo");
      formData.append("orgId", orgId);

      const res = await fetch("/api/upload/branding", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await res.json();
      t.success("Logo uploaded");
    } catch (err: any) {
      t.error((err && err.message) || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        id="co-logo-file"
        type="file"
        accept="image/*"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      <label htmlFor="co-logo-file">
        <Button size="sm" disabled={busy}>
          Upload Co-Logo
        </Button>
      </label>
    </div>
  );
}
