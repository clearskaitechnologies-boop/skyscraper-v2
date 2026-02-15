import React, { useState } from "react";

type Props = { orgId?: string };

export default function BrandingUpload({ orgId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Select a file first");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/branding/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "upload failed");
      alert("Uploaded: " + json.key);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="rounded bg-white p-4 shadow">
      <label className="mb-2 block">Upload branding file (logo)</label>
      <input
        type="file"
        accept="image/*"
        aria-label="Upload branding file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <div className="mt-4">
        <button className="rounded bg-blue-600 px-4 py-2 text-white" disabled={uploading}>
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
    </form>
  );
}
