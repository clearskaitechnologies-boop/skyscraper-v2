import { AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageErrorProps {
  title?: string;
  description?: string;
  error?: Error;
  showBackHome?: boolean;
}

/**
 * Page Error Component
 * 
 * Displays a friendly error message when a page fails to load.
 * Used in try/catch blocks for server components.
 * 
 * Usage:
 * ```tsx
 * try {
 *   const data = await fetchData();
 *   return <YourPage data={data} />;
 * } catch (error) {
 *   return <PageError error={error} />;
 * }
 * ```
 */
export function PageError({
  title = "Page Error",
  description = "We encountered an error while loading this page",
  error,
  showBackHome = true,
}: PageErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-yellow-500/5 p-3">
              <p className="font-mono text-sm text-yellow-600 dark:text-yellow-400">
                {error.message}
              </p>
            </div>
          )}
          {showBackHome && (
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
