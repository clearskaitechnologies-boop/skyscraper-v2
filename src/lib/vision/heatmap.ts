/**
 * Vision Heatmap Generator
 * Generates visual heatmaps from damage analysis results
 */

export interface HeatmapOptions {
  width?: number;
  height?: number;
  colorScale?: string[];
}

export interface DamageRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  severity: number;
  label?: string;
}

/**
 * Generate a heatmap overlay from damage regions
 */
export function generateHeatmap(
  imageUrl: string,
  regions: DamageRegion[],
  options?: HeatmapOptions
): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = options?.width || 800;
  canvas.height = options?.height || 600;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Draw heatmap regions
  regions.forEach((region) => {
    const alpha = Math.min(region.severity / 10, 1);
    ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
    ctx.fillRect(region.x, region.y, region.width, region.height);
  });

  return canvas;
}

/**
 * Create a legend for the heatmap
 */
export function createLegend(): HTMLDivElement | null {
  if (typeof document === "undefined") return null;

  const div = document.createElement("div");
  div.innerHTML = `
    <div style="display:flex;gap:8px;align-items:center">
      <span style="background:rgba(255,0,0,0.2);padding:2px 8px">Low</span>
      <span style="background:rgba(255,0,0,0.5);padding:2px 8px">Medium</span>
      <span style="background:rgba(255,0,0,0.8);padding:2px 8px">High</span>
    </div>
  `;
  return div;
}

/**
 * Download heatmap as PNG
 */
export function downloadHeatmap(canvas: HTMLCanvasElement | null, filename = "heatmap.png") {
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
