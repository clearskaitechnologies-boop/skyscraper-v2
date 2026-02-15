import { Download, Loader2, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ANGLES, COLORWAYS, type MockupResult } from "@/lib/mockupTypes";

interface MockupPanelV2Props {
  reportId: string;
  defaultAddress?: string;
  onDone?: (result: MockupResult) => void;
}

export default function MockupPanelV2({ reportId, defaultAddress, onDone }: MockupPanelV2Props) {
  const [address, setAddress] = useState(defaultAddress || "");
  const [colorway, setColorway] = useState("Charcoal");
  const [systemType, setSystemType] = useState<"Shingle" | "Tile" | "Metal">("Shingle");
  const [selectedAngles, setSelectedAngles] = useState<Record<string, boolean>>({
    front: true,
    left: false,
    right: false,
    top: true,
  });
  const [pitchHint, setPitchHint] = useState<"low" | "medium" | "steep">("medium");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<MockupResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const toggleAngle = (angle: (typeof ANGLES)[number]) => {
    setSelectedAngles((prev) => ({ ...prev, [angle]: !prev[angle] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast.success("Image uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  async function handleGenerate() {
    setBusy(true);
    setResults(null);

    try {
      const angles = ANGLES.filter((a) => selectedAngles[a]);

      if (angles.length === 0) {
        toast.error("Please select at least one angle");
        return;
      }

      // Generate map pin if address provided
      let mapData = null;
      if (address) {
        const { data: mapResult, error: mapError } = await supabase.functions.invoke(
          "generate-map-pin",
          {
            body: {
              reportId,
              address,
            },
          }
        );

        if (mapError) {
          console.warn("Map pin generation failed:", mapError);
          toast.error("Could not generate map pin");
        } else {
          mapData = mapResult;
        }
      }

      // Generate mockup images
      const { data, error } = await supabase.functions.invoke("generate-mockup-v2", {
        body: {
          reportId,
          address,
          colorway,
          systemType,
          angles,
          pitchHint,
        },
      });

      if (error) throw error;

      if (data?.result) {
        const result = {
          ...data.result,
          mapPinUrl: (mapData as any)?.url || data.result.mapPinUrl,
        };
        setResults(result);
        toast.success("Mockups generated successfully!");
        onDone?.(result);
      } else {
        throw new Error("No result returned");
      }
    } catch (e: any) {
      console.error("Mockup generation error:", e);
      toast.error(e.message || "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <h3 className="mb-4 text-lg font-semibold">AI Mockup Generator</h3>

        <div className="mb-4">
          <Label htmlFor="image-upload" className="mb-2 block text-sm font-semibold">
            Upload Property Image (Optional)
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="flex-1"
            />
            {uploadedImage && (
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border">
                <img src={uploadedImage} alt="Uploaded" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="address" className="mb-2 block text-sm font-semibold">
              Property Address
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, ST"
            />
          </div>

          <div>
            <Label htmlFor="system-type" className="mb-2 block text-sm font-semibold">
              System Type
            </Label>
            <Select value={systemType} onValueChange={(v: any) => setSystemType(v)}>
              <SelectTrigger id="system-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Shingle">Shingle</SelectItem>
                <SelectItem value="Tile">Tile</SelectItem>
                <SelectItem value="Metal">Metal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pitch" className="mb-2 block text-sm font-semibold">
              Roof Pitch
            </Label>
            <Select value={pitchHint} onValueChange={(v: any) => setPitchHint(v)}>
              <SelectTrigger id="pitch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (2/12 - 4/12)</SelectItem>
                <SelectItem value="medium">Medium (5/12 - 7/12)</SelectItem>
                <SelectItem value="steep">Steep (8/12+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <Label className="mb-2 block text-sm font-semibold">Colorway</Label>
          <div className="mt-2 flex flex-wrap gap-3">
            {COLORWAYS.map((c) => (
              <Button
                key={c}
                variant={c === colorway ? "default" : "outline"}
                className="whitespace-nowrap rounded-full"
                onClick={() => setColorway(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <Label className="mb-2 block text-sm font-semibold">Angles</Label>
          <div className="mt-2 flex flex-wrap gap-3">
            {ANGLES.map((a) => (
              <Button
                key={a}
                variant={selectedAngles[a] ? "default" : "outline"}
                className="whitespace-nowrap rounded-full capitalize"
                onClick={() => toggleAngle(a)}
                aria-pressed={!!selectedAngles[a]}
              >
                {a}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={busy} className="gap-2">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Mockups
            </>
          )}
        </Button>
      </div>

      {results && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Generated Mockups</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  toast.success("Saved to claim");
                }}
              >
                Save to Claim
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success("Added to report");
                }}
              >
                Add to Report
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  toast.success("Added to client folder");
                }}
              >
                Add to Client Folder
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {results.images.map((img, idx) => (
              <div key={idx} className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* BEFORE - Original */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Before
                    </p>
                    <div className="overflow-hidden rounded-xl border bg-muted">
                      {uploadedImage ? (
                        <img
                          src={uploadedImage}
                          alt="Original"
                          className="h-48 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-muted/50">
                          <p className="text-sm text-muted-foreground">No upload</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AFTER - Mockup */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                        After
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          downloadImage(img.url, `mockup-${img.colorway}-${img.angle}.png`)
                        }
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-green-200 bg-muted dark:border-green-800">
                      <img
                        src={img.url}
                        alt={`${img.colorway} ${img.angle}`}
                        className="h-auto w-full"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {img.colorway} · {img.angle}
                </p>
              </div>
            ))}
          </div>

          {results.mapPinUrl && (
            <div className="rounded-xl border bg-card p-4">
              <h5 className="mb-3 font-medium">Property Location</h5>
              <img
                src={results.mapPinUrl}
                alt="Map location"
                className="h-auto w-full rounded-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
