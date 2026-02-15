import React from "react";

export function DocumentTile({ title, type, url }: { title: string; type?: string | null; url: string }) {
  return (
    <a href={url} target="_blank" className="flex flex-col gap-1 rounded border p-3 transition hover:bg-muted/40">
      <div className="truncate text-sm font-medium" title={title}>{title}</div>
      {type && <div className="text-[11px] text-muted-foreground">{type}</div>}
    </a>
  );
}
