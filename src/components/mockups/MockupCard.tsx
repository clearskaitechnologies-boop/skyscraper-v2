/**
 * MockupCard - UI for generating AI roof mockups
 */
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMockup } from "@/hooks/useMockup";
import { useToast } from "@/hooks/useToast";

const COLORWAYS = [
  "Charcoal",
  "Weathered Wood",
  "Pewter",
  "Desert Sand",
  "Slate",
  "Forest",
  "Terracotta",
];

export default function MockupCard({
  onAddPhoto,
  address,
}: {
  onAddPhoto: (p: { url: string; caption?: string }) => void;
  address?: string;
}) {
  const { generate, busy } = useMockup();
  const toast = useToast();
  type SystemType = "Shingle" | "Tile" | "Metal";
  type Angle = "front" | "left" | "right" | "top";
  const [systemType, setSystemType] = useState<SystemType>("Shingle");
  const [colorway, setColorway] = useState("Charcoal");
  const [angle, setAngle] = useState<Angle>("front");

  async function handleGenerate() {
    try {
      const result = await generate({
        address,
        colorway,
        systemType,
        angles: [angle],
        pitchHint: "medium",
      });

      type ImageRow = { url?: string } & Record<string, unknown>;
      const images = (
        result && typeof result === "object"
          ? (result as Record<string, unknown>)["images"]
          : undefined
      ) as unknown;
      if (Array.isArray(images) && images.length > 0) {
        (images as unknown[]).forEach((item) => {
          const img = item as ImageRow;
          const url = typeof img.url === "string" ? img.url : undefined;
          if (url) {
            onAddPhoto({ url, caption: `${systemType} - ${colorway} - ${angle}` });
          }
        });
        toast.success("Mockup generated");
      }
    } catch (error: any) {
      const e = error instanceof Error ? error : new Error(String(error));
      toast.error(e.message || "Failed to generate mockup");
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-3 font-semibold">AI Roof Mockup</div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <Label>Material</Label>
            <select
              className="mt-1 w-full rounded-lg border p-2"
              value={systemType}
              onChange={(e) => setSystemType(e.target.value as SystemType)}
            >
              <option>Shingle</option>
              <option>Metal</option>
              <option>Tile</option>
            </select>
          </div>

          <div>
            <Label>Color</Label>
            <select
              className="mt-1 w-full rounded-lg border p-2"
              value={colorway}
              onChange={(e) => setColorway(e.target.value)}
            >
              {COLORWAYS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Angle</Label>
            <select
              className="mt-1 w-full rounded-lg border p-2"
              value={angle}
              onChange={(e) => setAngle(e.target.value as Angle)}
            >
              <option value="front">Front</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top">Aerial</option>
            </select>
          </div>

          <Button className="w-full" onClick={handleGenerate} disabled={busy}>
            {busy ? "Generating..." : "Generate Mockup"}
          </Button>
        </div>

        <div className="rounded-xl border bg-muted p-3 text-sm text-muted-foreground">
          AI-generated mockup images are added to your Photos and can be included in the PDF.
        </div>
      </div>
    </Card>
  );
}
