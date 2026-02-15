"use client";
import { useEffect, useState } from "react";

export default function VersionBadge() {
  const [version, setVersion] = useState<{
    commit?: string;
    git?: string;
    buildTime?: string;
    branch?: string;
  } | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/diag/version", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setVersion(data))
      .catch(() => {});
  }, []);

  const commitHash = version?.git || version?.commit;
  if (!commitHash) return null;

  const shortCommit = commitHash.slice(0, 7);
  const buildDate = version.buildTime ? new Date(version.buildTime).toLocaleString() : "";

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="rounded px-2 py-1 font-mono text-xs text-[color:var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[color:var(--text)]"
        title="Build info"
      >
        {shortCommit}
      </button>
      {show && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] p-3 shadow-xl">
          <div className="space-y-1 text-xs">
            <div className="mb-2 font-semibold text-[color:var(--text)]">Build Info</div>
            <div>
              <span className="text-[color:var(--muted)]">Branch:</span>{" "}
              <span className="font-mono text-[color:var(--text)]">
                {version.branch || "unknown"}
              </span>
            </div>
            <div>
              <span className="text-[color:var(--muted)]">Commit:</span>{" "}
              <span className="font-mono text-[color:var(--text)]">{commitHash}</span>
            </div>
            <div>
              <span className="text-[color:var(--muted)]">Built:</span>{" "}
              <span className="text-[color:var(--text)]">{buildDate}</span>
            </div>
            <div className="mt-2 border-t border-[color:var(--border)] pt-2">
              <a
                href="/api/diag/version"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--primary)] hover:underline"
              >
                View full diagnostics →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
