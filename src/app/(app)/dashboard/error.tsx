"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Home } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("🔥 DASHBOARD ERROR:", error);
    console.error("Stack:", error.stack);
    console.error("Digest:", error.digest);
    console.error(
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );
  }, [error]);

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Dashboard Error - DEBUG MODE</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-800">
            We couldn't load your dashboard. This might be a temporary issue.
          </p>

          {/* SHOW DIGEST - Next.js Error ID */}
          {error.digest && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 font-mono text-sm">
              <strong className="text-orange-900">Error Digest:</strong>{" "}
              <span className="text-orange-700">{error.digest}</span>
            </div>
          )}

          {/* SHOW ERROR IN PRODUCTION TOO - TEMPORARY DEBUG */}
          {error.message && (
            <div className="max-h-64 overflow-auto rounded-lg border border-red-200 bg-white p-3 font-mono text-sm text-gray-700">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          {/* FULL ERROR OBJECT */}
          <details className="rounded-lg border border-gray-200 bg-white p-3">
            <summary className="cursor-pointer font-bold text-gray-700">
              Full Error Object (click to expand)
            </summary>
            <pre className="mt-2 max-h-96 overflow-auto text-xs text-gray-600">
              {JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}
            </pre>
          </details>

          {error.stack && (
            <div className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-red-200 bg-white p-3 font-mono text-xs text-gray-600">
              {error.stack}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => reset()} variant="default" size="sm">
              Retry
            </Button>
            <Button
              onClick={() => {
                router.refresh();
              }}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/claims">Go to Claims</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
