import { ArrowUpRight, Circle, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type Point = { x: number; y: number };

type Shape = {
  type: "arrow" | "rect" | "circle";
  from?: Point;
  to?: Point;
  rect?: { x: number; y: number; w: number; h: number };
  color?: string;
};

interface PhotoAnnotatorProps {
  src: string;
  value?: Shape[];
  onChange?: (shapes: Shape[]) => void;
}

export function PhotoAnnotator({ src, value, onChange }: PhotoAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [tool, setTool] = useState<"arrow" | "rect" | "circle">("arrow");
  const [shapes, setShapes] = useState<Shape[]>(value || []);
  const [start, setStart] = useState<Point | null>(null);

  useEffect(() => {
    setShapes(value || []);
  }, [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;

    if (!canvas || !ctx || !img || !img.complete) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ff3b30";

    for (const s of shapes) {
      ctx.strokeStyle = s.color || "#ff3b30";

      if (s.type === "rect" && s.rect) {
        ctx.strokeRect(s.rect.x, s.rect.y, s.rect.w, s.rect.h);
      }

      if (s.type === "circle" && s.rect) {
        ctx.beginPath();
        ctx.arc(s.rect.x, s.rect.y, s.rect.w, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (s.type === "arrow" && s.from && s.to) {
        ctx.beginPath();
        ctx.moveTo(s.from.x, s.from.y);
        ctx.lineTo(s.to.x, s.to.y);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(s.to.y - s.from.y, s.to.x - s.from.x);
        const head = 10;
        ctx.beginPath();
        ctx.moveTo(s.to.x, s.to.y);
        ctx.lineTo(
          s.to.x - head * Math.cos(angle - Math.PI / 6),
          s.to.y - head * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          s.to.x - head * Math.cos(angle + Math.PI / 6),
          s.to.y - head * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.stroke();
      }
    }
  }, [shapes, src]);

  const handleDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    setStart({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
  };

  const handleUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!start) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    const end = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };

    const next = [...shapes];

    if (tool === "arrow") {
      next.push({ type: "arrow", from: start, to: end });
    }

    if (tool === "rect") {
      next.push({
        type: "rect",
        rect: {
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          w: Math.abs(end.x - start.x),
          h: Math.abs(end.y - start.y),
        },
      });
    }

    if (tool === "circle") {
      next.push({
        type: "circle",
        rect: {
          x: start.x,
          y: start.y,
          w: Math.hypot(end.x - start.x, end.y - start.y),
          h: 0,
        },
      });
    }

    setShapes(next);
    setStart(null);
    onChange?.(next);
  };

  const clearAnnotations = () => {
    setShapes([]);
    onChange?.([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm opacity-70">Annotate:</span>
        <Button
          type="button"
          variant={tool === "arrow" ? "default" : "outline"}
          size="sm"
          onClick={() => setTool("arrow")}
          aria-label="Arrow tool"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={tool === "rect" ? "default" : "outline"}
          size="sm"
          onClick={() => setTool("rect")}
          aria-label="Rectangle tool"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={tool === "circle" ? "default" : "outline"}
          size="sm"
          onClick={() => setTool("circle")}
          aria-label="Circle tool"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearAnnotations}
          aria-label="Clear annotations"
          className="ml-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
      <div className="relative w-full overflow-auto rounded-xl border">
        <img
          ref={imgRef}
          src={src}
          alt="Inspection photo"
          className="block h-auto max-w-full"
          onLoad={() => {
            // Trigger canvas redraw
            setShapes([...shapes]);
          }}
        />
        <canvas
          ref={canvasRef}
          onMouseDown={handleDown}
          onMouseUp={handleUp}
          className="absolute inset-0 h-full w-full cursor-crosshair"
          style={{ pointerEvents: "auto" }}
        />
      </div>
    </div>
  );
}
