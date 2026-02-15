"use client";

import { useEffect, useState } from "react";

/**
 * Build Fingerprint Component
 * Displays deployment info in footer to verify production updates
 * Shows: commit hash, build time, environment
 */
export function BuildFingerprint() {
  const [fingerprint, setFingerprint] = useState<{
    git: string;
    buildTime: string;
    env: string;
  } | null>(null);

  useEffect(() => {
    // Also check NEXT_PUBLIC_COMMIT_SHA for client-side display
    const clientCommitSha = process.env.NEXT_PUBLIC_COMMIT_SHA;

    fetch("/api/build-info")
      .then((res) => res.json())
      .then((data) =>
        setFingerprint({
          ...data,
          // Prefer NEXT_PUBLIC_COMMIT_SHA if available
          git: data.git === "local-dev" && clientCommitSha ? clientCommitSha : data.git,
        })
      )
      .catch(() => {
        // Fallback to env var if API fails
        if (clientCommitSha) {
          setFingerprint({
            git: clientCommitSha,
            buildTime: new Date().toISOString(),
            env: "unknown",
          });
        } else {
          setFingerprint(null);
        }
      });
  }, []);

  if (!fingerprint) return null;

  return (
    <div className="text-[9px] opacity-40 transition-opacity hover:opacity-100">
      <span
        title={`Commit SHA: ${fingerprint.git}\nClick to copy`}
        className="cursor-pointer"
        onClick={() => navigator.clipboard.writeText(fingerprint.git)}
      >
        build: {fingerprint.git.slice(0, 7)}
      </span>
      {fingerprint.buildTime && (
        <>
          {" · "}
          <span title={`Build Time: ${fingerprint.buildTime}`}>
            {new Date(fingerprint.buildTime).toLocaleDateString()}
          </span>
        </>
      )}
      {fingerprint.env && (
        <>
          {" · "}
          <span className="uppercase">{fingerprint.env}</span>
        </>
      )}
    </div>
  );
}
