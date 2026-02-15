import Link from "next/link";
import React from "react";

import { StandardButton } from "@/components/ui/StandardButton";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  ctaOnClick,
  icon,
}: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      {icon && <div className="mb-3 flex justify-center">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mb-4 max-w-md text-muted-foreground">{description}</p>
      {ctaLabel && (ctaHref || ctaOnClick) && (
        <div>
          {ctaHref ? (
            <Link href={ctaHref}>
              <StandardButton variant="indigo" gradient>
                {ctaLabel}
              </StandardButton>
            </Link>
          ) : (
            <StandardButton onClick={ctaOnClick} variant="indigo" gradient>
              {ctaLabel}
            </StandardButton>
          )}
        </div>
      )}
    </div>
  );
}
