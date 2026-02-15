"use client";

import { Download, Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PhotoCardProps {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: Date;
  uploadedBy?: string;
  onDelete?: (id: string) => void;
}

export default function PhotoCard({
  id,
  url,
  caption,
  uploadedAt,
  uploadedBy,
  onDelete,
}: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl dark:hover:border-white/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-black/20">
        <Image src={url} alt={caption || "Claim photo"} fill className="object-cover" />

        {/* Hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all">
            <div className="flex h-full items-center justify-center gap-2">
              <button
                className="rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
                aria-label="View photo"
                title="View photo"
              >
                <Eye className="h-5 w-5 text-white" />
              </button>
              <button
                className="rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
                aria-label="Download photo"
                title="Download photo"
              >
                <Download className="h-5 w-5 text-white" />
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(id)}
                  className="rounded-lg bg-red-500/20 p-2 transition-colors hover:bg-red-500/30"
                  aria-label="Delete photo"
                  title="Delete photo"
                >
                  <Trash2 className="h-5 w-5 text-red-400" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <div className="p-3">
          <p className="line-clamp-2 text-sm text-slate-900 dark:text-white/90">{caption}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-white/50">
            <span>{uploadedBy || "Unknown"}</span>
            <span>{uploadedAt.toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
