/**
 * Photo overlay component for damage detection boxes
 * Shows detected damage with labels and allows manual adjustment
 */
import { X } from "lucide-react";
import { useState } from "react";

export type DamageBox = {
  x: number; // 0-1 relative
  y: number;
  w: number;
  h: number;
  label: string;
  score?: number;
};

type PhotoOverlayProps = {
  url: string;
  boxes: DamageBox[];
  onBoxesChange?: (boxes: DamageBox[]) => void;
  showControls?: boolean;
};

export default function PhotoOverlay({
  url,
  boxes,
  onBoxesChange,
  showControls = true,
}: PhotoOverlayProps) {
  const [localBoxes, setLocalBoxes] = useState(boxes);

  const removeBox = (index: number) => {
    const updated = localBoxes.filter((_, i) => i !== index);
    setLocalBoxes(updated);
    onBoxesChange?.(updated);
  };

  return (
    <div className="relative inline-block">
      <img
        src={url}
        alt="Inspection photo with damage overlay"
        className="h-auto w-full rounded-lg"
        crossOrigin="anonymous"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/img/image-fallback.png";
        }}
      />

      {/* Damage boxes */}
      {localBoxes.map((box, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-lg border-2 border-red-500"
          // eslint-disable-next-line react/forbid-dom-props
          style={{
            left: `${box.x * 100}%`,
            top: `${box.y * 100}%`,
            width: `${box.w * 100}%`,
            height: `${box.h * 100}%`,
          }}
        >
          <div className="pointer-events-auto absolute -top-6 left-0 flex items-center gap-1 rounded bg-red-500 px-2 py-0.5 text-xs text-white">
            {box.label.replace(/_/g, " ")}
            {box.score && <span className="opacity-75">({Math.round(box.score * 100)}%)</span>}
            {showControls && onBoxesChange && (
              <button
                onClick={() => removeBox(i)}
                className="ml-1 rounded p-0.5 hover:bg-red-600"
                title="Remove damage box"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
