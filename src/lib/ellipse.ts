/**
 * Convert bounding box to ellipse coordinates for circular annotations
 */
export function bboxToEllipse(b: { x: number; y: number; w: number; h: number }) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  // radius ~ 0.6 of box to look natural
  const rx = (b.w / 2) * 0.6;
  const ry = (b.h / 2) * 0.6;
  return { cx, cy, rx, ry };
}
