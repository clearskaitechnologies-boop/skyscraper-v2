"use client";

import { MessageSquare, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Messages] Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-6 p-8">
      <div className="rounded-full bg-blue-50 p-4">
        <MessageSquare className="h-10 w-10 text-blue-400" />
      </div>
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold">Messages couldn&apos;t load</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          There was a problem loading your messages. This is usually temporary.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
