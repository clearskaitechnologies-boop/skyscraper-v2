"use client";

/**
 * TRUTH PANEL - Admin Debug Component
 *
 * Floating panel showing org context, claim count, DB info
 * Only visible to admin/pro users
 */

import { useEffect, useState } from "react";

interface TruthPanelProps {
  orgId?: string;
  orgName?: string;
  claimCount?: number;
  dbHost?: string;
  isDev?: boolean;
}

interface DiagnosticData {
  org?: { id: string; name: string };
  claims?: { count: number };
  database?: { host: string };
  auth?: { userId: string; clerkOrgId: string | null };
}

export function TruthPanel({ orgId, orgName, claimCount, dbHost, isDev = false }: TruthPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDiagnostic = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/_debug/session");
      const data = await res.json();
      setDiagnostic(data);
    } catch (e) {
      console.error("Diagnostic fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded && !diagnostic) {
      fetchDiagnostic();
    }
  }, [expanded]);

  return (
    <div className="fixed bottom-4 right-4 z-50 overflow-hidden rounded-lg bg-black text-white shadow-lg">
      {/* Collapsed View */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="px-3 py-2 font-mono text-xs transition-colors hover:bg-gray-800"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span>TRUTH</span>
          </div>
        </button>
      )}

      {/* Expanded View */}
      {expanded && (
        <div className="max-w-md p-3 font-mono text-xs">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold text-green-400">🔥 TRUTH PANEL</span>
            <button onClick={() => setExpanded(false)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>

          <div className="space-y-1 text-gray-300">
            {/* Prop-based data */}
            {orgId && (
              <>
                <div>
                  <span className="text-gray-500">ORG:</span>{" "}
                  <span className="text-white">{orgId.slice(0, 8)}...</span>
                </div>
                {orgName && (
                  <div>
                    <span className="text-gray-500">NAME:</span>{" "}
                    <span className="text-white">{orgName}</span>
                  </div>
                )}
              </>
            )}

            {claimCount !== undefined && (
              <div>
                <span className="text-gray-500">CLAIMS:</span>{" "}
                <span className="font-bold text-white">{claimCount}</span>
              </div>
            )}

            {dbHost && (
              <div>
                <span className="text-gray-500">DB:</span>{" "}
                <span className="text-white">{dbHost}</span>
              </div>
            )}

            {/* Diagnostic data */}
            {diagnostic && (
              <>
                <hr className="my-2 border-gray-700" />
                {diagnostic.auth && (
                  <div>
                    <span className="text-gray-500">USER:</span>{" "}
                    <span className="text-white">{diagnostic.auth.userId.slice(0, 8)}...</span>
                  </div>
                )}
                {diagnostic.org && (
                  <div>
                    <span className="text-gray-500">ORG DB ID:</span>{" "}
                    <span className="text-white">{diagnostic.org.id.slice(0, 8)}...</span>
                  </div>
                )}
              </>
            )}

            {/* Actions */}
            <div className="mt-3 flex gap-2 border-t border-gray-700 pt-2">
              <a
                href="/api/_debug/session"
                target="_blank"
                className="text-[10px] text-blue-400 underline hover:text-blue-300"
              >
                Full Diagnostic →
              </a>
              {loading && <span className="text-gray-500">Loading...</span>}
              {!loading && (
                <button
                  onClick={fetchDiagnostic}
                  className="text-[10px] text-gray-400 hover:text-white"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
