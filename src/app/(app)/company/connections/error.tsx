"use client";

import { useEffect } from "react";

export default function CompanyConnectionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CompanyConnections] Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold text-red-600">Connections Error</h2>
        <p className="mb-4 text-muted-foreground">
          {error.message || "Something went wrong loading your connections."}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
