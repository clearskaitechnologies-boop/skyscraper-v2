import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export default function BrandingUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setPreview(String(reader.result));
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const upload = async () => {
    if (!file) return toast.error("Select a file first");
    setUploading(true);
    try {
      const key = `branding/${Date.now()}_${file.name}`;
      const { data, error: uploadErr } = await supabase.storage
        .from("branding")
        .upload(key, file, { cacheControl: "public, max-age=31536000" });

      if (uploadErr) {
        // If bucket missing, fallback to storing data URL in org_branding.logo_url
        const msg = getMessage(uploadErr);
        if (msg.toLowerCase().includes("bucket") || msg.toLowerCase().includes("not found")) {
          // Create data URL fallback and persist directly to org_branding
          const dataUrl = await fileToDataUrl(file);
          const branding = {
            org_slug: "default",
            logo_url: dataUrl,
            updated_at: new Date().toISOString(),
          };
          // Types for the `org_branding` table vary between environments; keep behavior stable
          // using a narrow cast.
          const { error: dbErr } = await supabase
            .from("org_branding")
            .upsert(branding as any, { onConflict: "org_slug" });

          if (dbErr) throw dbErr;
          toast.success("Branding stored (fallback)");
          setFile(null);
          setPreview(null);
          return;
        }
        throw uploadErr;
      }

      const { data: urlData } = supabase.storage.from("branding").getPublicUrl(key);
      const publicUrl = urlData.publicUrl;

      // Save to org_branding for default org (adjust as needed)
      const branding = {
        org_slug: "default",
        logo_url: publicUrl,
        updated_at: new Date().toISOString(),
      };
      // Keep behavior stable across schema differences; use a narrow cast here
      const { error: dbErr } = await supabase
        .from("org_branding")
        .upsert(branding as any, { onConflict: "org_slug" });

      if (dbErr) throw dbErr;

      toast.success("Branding uploaded");
      setFile(null);
      setPreview(null);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error("Upload failed: " + (err.message || String(err)));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Upload Logo</label>
      <div className="flex items-center gap-3">
        <Input type="file" accept="image/*" onChange={handleFile} />
        <Button onClick={upload} disabled={!file || uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>

      {preview && (
        <div className="mt-2 flex items-center gap-3">
          <div className="h-20 w-20 overflow-hidden rounded border bg-white/5">
            <img
              src={preview}
              alt="preview"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="text-sm">Preview: {file?.name}</div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Files are stored in Supabase storage (branding bucket). If the storage bucket is not
        available, the app will save a fallback data-URL for immediate theming.
      </p>
    </div>
  );
}

async function fileToDataUrl(f: File): Promise<string> {
  return await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

function getMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
