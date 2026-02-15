"use client";
import { useState } from "react";

export default function ClientUploadPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("token", token);
    form.append("file", file);
    form.append("title", title);
    const res = await fetch("/api/portal/client/upload", { method: "POST", body: form });
    setLoading(false);
    if (!res.ok) alert("Upload failed"); else alert("Uploaded!");
    setFile(null);
    setTitle("");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Upload Documents / Photos</h1>
      <input
        type="text"
        placeholder="Title (optional)"
        className="w-full rounded border px-2 py-1 text-sm"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label className="block text-xs font-medium text-gray-600">File
        <input title="Upload file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1" />
      </label>
      <button
        onClick={upload}
        disabled={!file || loading}
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      <p className="text-xs text-gray-500">Files stored with placeholder path until storage integration.</p>
    </div>
  );
}