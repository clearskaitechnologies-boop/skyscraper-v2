import { useEffect, useRef, useState } from "react";

export default function InitialsPad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 160 * dpr;
    canvas.height = 80 * dpr;
    canvas.style.width = "160px";
    canvas.style.height = "80px";

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 160, 80);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = ref.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    setDirty(true);
    const ctx = ref.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = ref.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handleUp = () => {
    setDrawing(false);
    if (ref.current) {
      onChange(ref.current.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 160, 80);
    setDirty(false);
    onChange(null);
  };

  return (
    <div className="space-y-1">
      <div className="inline-block touch-none select-none overflow-hidden rounded-md border">
        <canvas
          ref={ref}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
          className="cursor-crosshair bg-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
          onClick={clear}
        >
          Clear
        </button>
        {dirty && <span className="text-xs text-green-700">✓ Captured</span>}
      </div>
    </div>
  );
}
