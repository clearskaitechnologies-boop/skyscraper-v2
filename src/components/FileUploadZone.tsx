"use client";
import { useState } from "react";

export function FileUploadZone({ claim_id: claimId }: { claim_id: string }) {
  const [files, setFiles] = useState<File[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setFiles(Array.from(e.target.files));
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-[color:var(--border)] p-6 text-center">
      <input type="file" multiple onChange={handleChange} className="hidden" id="upload" />
      <label htmlFor="upload" className="cursor-pointer text-[color:var(--primary)]">
        Click to upload files or photos
      </label>
      <ul className="mt-4 space-y-1 text-sm text-[color:var(--muted)]">
        {files.map((f) => (
          <li key={f.name}>{f.name}</li>
        ))}
      </ul>
    </div>
  );
}
