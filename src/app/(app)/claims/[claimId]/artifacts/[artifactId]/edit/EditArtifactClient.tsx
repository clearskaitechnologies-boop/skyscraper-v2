"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface EditArtifactClientProps {
  claimId: string;
  artifactId: string;
  initialData: {
    title: string;
    content: string;
    type: string;
    status: string;
    claimNumber: string;
  };
}

export default function EditArtifactClient({
  claimId,
  artifactId,
  initialData,
}: EditArtifactClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [status, setStatus] = useState(initialData.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/claims/${claimId}/artifacts/${artifactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, contentText: content, status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save");
      }

      router.push(`/claims/${claimId}/artifacts/${artifactId}/view`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/claims/${claimId}/artifacts/${artifactId}/view`}
                className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-700"
              >
                ← Cancel & Return
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit Artifact</h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span>Claim: {initialData.claimNumber}</span>
                <span>•</span>
                <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  {initialData.type.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/claims/${claimId}/artifacts/${artifactId}/view`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="space-y-6 p-6">
            {/* Title Editor */}
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                Document Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Selector */}
            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="FINAL">Final</option>
              </select>
            </div>

            {/* Content Editor */}
            <div>
              <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-700">
                Document Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter document content..."
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-between">
          <Link href={`/claims/${claimId}/artifacts/${artifactId}/view`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
