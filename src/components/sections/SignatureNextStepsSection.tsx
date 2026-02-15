import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export type NextStep = { id: string; label: string; checked?: boolean };

export type SignatureBlock = {
  signerName: string;
  signerEmail?: string;
  signedAt?: string;
  drawnSigUrl?: string;
  typedSig?: string;
  acceptanceText: string;
  accepted?: boolean;
};

export type SignatureState = {
  signature: SignatureBlock;
  nextSteps: NextStep[];
};

export type SignatureNextStepsProps = {
  owner?: string | null;
  title?: string;
  value: SignatureState;
  onChange: (v: SignatureState) => void;
};

export default function SignatureNextStepsSection({
  owner,
  title,
  value,
  onChange,
}: SignatureNextStepsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [busy, setBusy] = useState(false);

  const v = value || {
    signature: {
      signerName: "",
      signerEmail: "",
      acceptanceText:
        "I hereby authorize the contractor to perform the scope outlined in this proposal and acknowledge receipt of warranties and disclosures.",
      accepted: false,
    },
    nextSteps: defaultNextSteps(),
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.floor(rect.width * dpr);
    c.height = Math.floor(160 * dpr);
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#111";
      ctx.beginPath();
      ctx.moveTo(0, 140);
      ctx.lineTo(rect.width, 140);
      ctx.strokeStyle = "#e5e7eb";
      ctx.stroke();
      ctx.strokeStyle = "#111";
    }
  }, []);

  function startDraw(e: React.PointerEvent) {
    const c = canvasRef.current;
    if (!c) return;
    setDrawing(true);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const pt = pointFromEvent(c, e);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function moveDraw(e: React.PointerEvent) {
    if (!drawing) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const pt = pointFromEvent(c, e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  }

  function endDraw(e: React.PointerEvent) {
    if (!drawing) return;
    setDrawing(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  }

  function clearSig() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(0, 140);
    ctx.lineTo(rect.width, 140);
    ctx.strokeStyle = "#e5e7eb";
    ctx.stroke();
    ctx.strokeStyle = "#111";
  }

  function updateSig(patch: Partial<SignatureBlock>) {
    onChange({ ...v, signature: { ...v.signature, ...patch } });
  }

  function toggleStep(id: string) {
    onChange({
      ...v,
      nextSteps: v.nextSteps.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s)),
    });
  }

  async function saveSignature() {
    const c = canvasRef.current;
    if (!c) {
      toast.error("No signature canvas");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = c.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const safeTitle = (title || "signature").replace(/[^a-z0-9\-_. ]/gi, "_");
      const path = `${owner || "public"}/signatures/${Date.now()}-${safeTitle}.png`;

      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(path, blob, { upsert: false, contentType: "image/png" });

      let url = dataUrl;
      if (!uploadError) {
        const { data } = supabase.storage.from("reports").getPublicUrl(path);
        url = data.publicUrl;
      }

      updateSig({ drawnSigUrl: url, signedAt: new Date().toISOString() });
      toast.success("Signature saved");
    } catch (e: any) {
      const dataUrl = canvasRef.current?.toDataURL("image/png") || "";
      updateSig({ drawnSigUrl: dataUrl, signedAt: new Date().toISOString() });
      toast.error("Signature saved locally (upload failed)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 space-y-4">
      <h2 className="text-xl font-semibold">Client Signature & Next Steps</h2>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex items-center gap-2 rounded border px-3 py-2">
          <input
            type="checkbox"
            checked={!!v.signature.accepted}
            onChange={(e) => updateSig({ accepted: e.target.checked })}
          />
          <span className="text-sm">I agree to the terms below</span>
        </div>
        <Input
          placeholder="Signer full name"
          value={v.signature.signerName}
          onChange={(e) => updateSig({ signerName: e.target.value })}
        />
        <Input
          placeholder="Signer email (optional)"
          value={v.signature.signerEmail || ""}
          onChange={(e) => updateSig({ signerEmail: e.target.value })}
        />
      </div>

      <div className="grid items-start gap-3 md:grid-cols-3">
        <div className="rounded-xl border p-3 md:col-span-2">
          <div className="mb-1 text-xs opacity-60">Draw signature</div>
          <div className="rounded-lg border bg-background">
            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: 160, touchAction: "none" }}
              onPointerDown={startDraw}
              onPointerMove={moveDraw}
              onPointerUp={endDraw}
              onPointerCancel={endDraw}
            />
          </div>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" onClick={clearSig}>
              Clear
            </Button>
            <Button
              size="sm"
              onClick={saveSignature}
              disabled={busy || !v.signature.accepted || !v.signature.signerName}
            >
              Save Signature
            </Button>
          </div>
          {v.signature.drawnSigUrl && (
            <div className="mt-2 text-xs opacity-70">
              Saved {new Date(v.signature.signedAt || Date.now()).toLocaleString()}
            </div>
          )}
        </div>
        <div className="rounded-xl border p-3">
          <div className="mb-1 text-xs opacity-60">Typed signature (fallback)</div>
          <Input
            placeholder="Type your name as signature"
            value={v.signature.typedSig || ""}
            onChange={(e) => updateSig({ typedSig: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[13px] uppercase tracking-wide opacity-60">Terms / Acceptance</div>
        <Textarea
          value={v.signature.acceptanceText}
          onChange={(e) => updateSig({ acceptanceText: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <div className="text-[13px] uppercase tracking-wide opacity-60">Next Steps</div>
        <div className="grid gap-2 md:grid-cols-2">
          {v.nextSteps.map((s) => (
            <label key={s.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <input type="checkbox" checked={!!s.checked} onChange={() => toggleStep(s.id)} />
              <span className="text-sm">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {v.signature.drawnSigUrl && (
        <div className="rounded-xl border bg-muted/50 p-3">
          <div className="mb-1 text-xs opacity-60">Signature Preview</div>
          <img src={v.signature.drawnSigUrl} alt="Signature" className="h-16 object-contain" />
          <div className="mt-1 text-xs">
            By: <b>{v.signature.signerName}</b>{" "}
            {v.signature.signerEmail ? `· ${v.signature.signerEmail}` : ""} on{" "}
            {new Date(v.signature.signedAt || Date.now()).toLocaleString()}
          </div>
        </div>
      )}
    </section>
  );
}

function pointFromEvent(canvas: HTMLCanvasElement, e: React.PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return { x, y };
}

function defaultNextSteps(): NextStep[] {
  return [
    { id: crypto.randomUUID(), label: "Schedule pre-construction walkthrough", checked: true },
    { id: crypto.randomUUID(), label: "Confirm materials & colors", checked: true },
    { id: crypto.randomUUID(), label: "Submit permit / HOA approval" },
    { id: crypto.randomUUID(), label: "Coordinate start date and site access" },
  ];
}
