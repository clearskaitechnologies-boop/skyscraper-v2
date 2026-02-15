import React from "react";

import MockupImage from "./MockupImage";

/**
 * MockupPreview
 * Accepts a `mockup` object (as returned by mockup generators) and renders
 * a friendly preview grid. If no images are present, shows a helpful placeholder.
 */

type Img = { url: string; colorway?: string; angle?: string };

export default function MockupPreview({ mockup }: { mockup: any }) {
  if (!mockup) return <div className="text-muted-foreground">No mockup generated yet.</div>;

  // new-style result: { images: [{url,...}], mapPinUrl }
  const images: Img[] = mockup.images && Array.isArray(mockup.images) ? mockup.images : [];
  if (images.length === 0 && mockup.url) images.push({ url: mockup.url });

  if (images.length === 0) {
    // If mockup is a raw object with properties, try to find image-like keys
    const possible = Object.values(mockup).filter(
      (v: any) => typeof v === "string" && v.startsWith("http")
    ) as string[];
    possible.slice(0, 4).forEach((u) => images.push({ url: u }));
  }

  if (images.length === 0)
    return <div className="text-muted-foreground">Mockup returned no images.</div>;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {images.map((img, i) => (
        <figure key={i} className="overflow-hidden rounded-lg border bg-muted">
          {/* Use native img to preserve external URLs */}
          <img
            src={img.url}
            alt={img.colorway ? `${img.colorway} ${img.angle ?? ""}` : `mockup-${i}`}
            className="h-auto w-full object-cover"
          />
          <figcaption className="p-2 text-xs text-muted-foreground">
            {img.colorway || img.angle || `Mockup ${i + 1}`}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
