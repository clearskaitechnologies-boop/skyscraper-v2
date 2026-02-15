/**
 * RatingStars Component
 * Displays contractor rating with visual stars
 */

"use client";

interface RatingStarsProps {
  rating?: number | null;
  totalReviews?: number | null;
  showCount?: boolean;
}

export function RatingStars({ rating, totalReviews, showCount = false }: RatingStarsProps) {
  const r = rating ?? 0;
  const full = Math.round(r);

  return (
    <div className="flex items-center gap-1 text-xs text-yellow-300">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-base">
          {i < full ? "★" : "☆"}
        </span>
      ))}
      <span className="ml-1 text-[11px] text-zinc-300/80">
        {r > 0 ? r.toFixed(1) : "No reviews yet"}
      </span>
      {showCount && totalReviews && totalReviews > 0 && (
        <span className="ml-1 text-[11px] text-zinc-400/70">({totalReviews})</span>
      )}
    </div>
  );
}
