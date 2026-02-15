/**
 * Photo review component with detection overlay circles
 */
import { bboxToEllipse } from "@/lib/ellipse";

interface Detection {
  id: string;
  label: string;
  confidence: number;
  bbox: { x: number; y: number; w: number; h: number };
  approved: boolean | null;
}

interface PhotoReviewProps {
  photoUrl: string;
  detections?: Detection[];
  onApprove?: (detectionId: string, approved: boolean) => void;
}

export function PhotoReview({ photoUrl, detections = [], onApprove }: PhotoReviewProps) {
  return (
    <div className="relative w-full">
      <img
        src={photoUrl}
        alt="Inspection photo"
        className="h-auto w-full rounded-xl"
        crossOrigin="anonymous"
      />

      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        {detections
          .filter((d) => d.approved !== false) // Show approved & pending, hide denied
          .map((detection, i) => {
            const e = bboxToEllipse(detection.bbox);
            const strokeColor =
              detection.approved === true ? "stroke-emerald-500" : "stroke-yellow-500";

            return (
              <g key={detection.id || i}>
                <ellipse
                  cx={e.cx}
                  cy={e.cy}
                  rx={e.rx}
                  ry={e.ry}
                  className={`fill-transparent stroke-2 ${strokeColor}`}
                />
              </g>
            );
          })}
      </svg>

      {detections.length > 0 && onApprove && (
        <div className="absolute right-2 top-2 space-y-1">
          {detections
            .filter((d) => d.approved === null)
            .map((detection) => (
              <div
                key={detection.id}
                className="space-x-1 rounded-lg bg-background/90 p-2 text-xs backdrop-blur"
              >
                <span className="font-medium">{detection.label}</span>
                <span className="text-muted-foreground">
                  ({Math.round(detection.confidence * 100)}%)
                </span>
                <button
                  onClick={() => onApprove(detection.id, true)}
                  className="ml-2 rounded bg-emerald-500 px-2 py-1 text-white hover:bg-emerald-600"
                >
                  ✓
                </button>
                <button
                  onClick={() => onApprove(detection.id, false)}
                  className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                >
                  ✗
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
