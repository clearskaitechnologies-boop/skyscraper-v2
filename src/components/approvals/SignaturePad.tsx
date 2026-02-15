"use client";

import { X } from "lucide-react";
import { useRef } from "react";

// import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const sigCanvas = useRef<any>(null);

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  const handleSave = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("Please provide a signature");
      return;
    }
    const dataUrl = sigCanvas.current?.toDataURL();
    if (dataUrl) {
      onSave(dataUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded border-2 border-dashed bg-white">
        {/* TODO: Install react-signature-canvas package */}
        <canvas ref={sigCanvas} className="h-48 w-full" />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleSave} className="flex-1">
          Save Signature
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Sign above using your mouse or touch screen</p>
    </div>
  );
}
