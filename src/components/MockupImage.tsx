import React from "react";

import { getAssetVersion } from "@/utils/assetVersion";

type Props = {
  baseName: string;
  alt: string;
  className?: string;
};

export default function MockupImage({ baseName, alt, className }: Props) {
  const v = getAssetVersion();
  const webp = `/src/assets/mockups/${baseName}.webp?v=${v}`;
  const png = `/src/assets/mockups/${baseName}.png?v=${v}`;

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={png}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className ?? "h-48 w-full object-cover"}
        style={{ display: "block" }}
      />
    </picture>
  );
}
