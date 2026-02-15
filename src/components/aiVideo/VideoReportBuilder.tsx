"use client";

import { useState } from "react";

export function VideoReportBuilder() {
  const [claimId, setClaimId] = useState("");
  const [type, setType] = useState<"CLAIM_VIDEO" | "RETAIL_VIDEO">(
    "CLAIM_VIDEO"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function generateVideo() {
    try {
      setIsLoading(true);
      setError("");
      setVideoUrl(null);

      const res = await fetch("/api/video/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, type }),
      });

      if (!res.ok) throw new Error("Failed to create video");

      const json = await res.json();
      setVideoUrl(json.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4 rounded-lg border p-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Claim ID</label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Enter claim ID"
          value={claimId}
          onChange={(e) => setClaimId(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Video Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="CLAIM_VIDEO">Claim Video Report</option>
          <option value="RETAIL_VIDEO">Retail Proposal Video</option>
        </select>
      </div>

      <button
        onClick={generateVideo}
        disabled={isLoading || !claimId}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isLoading ? "Generating Video..." : "Generate Video Report"}
      </button>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {videoUrl && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Generated Video</label>
          <video controls className="w-full rounded-lg border">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <a
            href={videoUrl}
            download
            className="inline-block text-sm text-indigo-600 underline hover:text-indigo-700"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}
