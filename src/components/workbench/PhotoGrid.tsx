/**
 * Photo grid with captions for workbench
 */
import React from "react";

import { Input } from "@/components/ui/input";

interface Photo {
  url: string;
  caption?: string;
}

interface PhotoGridProps {
  photos: Photo[];
  onCaption: (idx: number, text: string) => void;
}

export function PhotoGrid({ photos, onCaption }: PhotoGridProps) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {photos.map((p, i) => (
        <figure key={i} className="rounded-xl border border-border bg-card p-3">
          <img
            src={p.url}
            alt={p.caption || `Photo ${i + 1}`}
            className="h-36 w-full rounded-lg object-cover"
          />
          <Input
            className="mt-2"
            placeholder="Add caption..."
            value={p.caption || ""}
            onChange={(e) => onCaption(i, e.target.value)}
          />
        </figure>
      ))}
    </div>
  );
}
