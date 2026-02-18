"use client";

import { Copy } from "lucide-react";
import { useCallback } from "react";

export function CopyIdButton({ id }: { id: string }) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(id).catch(() => {
      /* noop — clipboard blocked in iframe */
    });
  }, [id]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded-md border border-[color:var(--border)] px-2 py-1 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:text-slate-300"
      title="Copy ID"
    >
      <Copy className="h-3 w-3" />
    </button>
  );
}
