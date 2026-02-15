/**
 * Photo action buttons for Workbench
 * Auto-detect, Material Detection, Code Compliance, Storm Check
 */
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type PhotoRow = { id: string } & Record<string, unknown>;

interface PhotoActionsProps {
  photos: PhotoRow[];
  reportId?: string;
  orgId?: string;
  leadId?: string;
  address?: string;
  lat?: number | null;
  lon?: number | null;
  onRefresh?: () => void;
}

export function PhotoActions({
  photos,
  reportId,
  orgId,
  leadId,
  address,
  lat,
  lon,
  onRefresh,
}: PhotoActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function callFunction(fn: string, body: unknown): Promise<Record<string, unknown>> {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${fn}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      let msg = `${fn} failed`;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const d = data as Record<string, unknown>;
        if (typeof d.error === "string") msg = d.error;
        else if (typeof d.message === "string") msg = d.message;
        else msg = JSON.stringify(d);
      } else {
        msg = String(data);
      }
      throw new Error(msg);
    }

    if (data && typeof data === "object" && !Array.isArray(data))
      return data as Record<string, unknown>;
    return { result: data } as Record<string, unknown>;
  }

  const handleAutoDetect = async () => {
    if (!photos.length) {
      toast.error("No photos to analyze");
      return;
    }

    setLoading("detect");
    try {
      let count = 0;
      for (const photo of photos) {
        await callFunction("detect-damage", { photo_id: photo.id });
        count++;
      }
      toast.success(`Analyzed ${count} photos`);
      onRefresh?.();
    } catch (error: unknown) {
      console.error("Auto-detect error:", error);
      const e = error instanceof Error ? error : new Error(String(error));
      toast.error(e.message || "Auto-detect failed");
    } finally {
      setLoading(null);
    }
  };

  const handleDetectMaterials = async () => {
    if (!photos.length) {
      toast.error("No photos to analyze");
      return;
    }

    setLoading("materials");
    try {
      let count = 0;
      for (const photo of photos) {
        await callFunction("material-detect", { photo_id: photo.id });
        count++;
      }
      toast.success(`Material detection completed for ${count} photos`);
      onRefresh?.();
    } catch (error: unknown) {
      console.error("Material detection error:", error);
      const e = error instanceof Error ? error : new Error(String(error));
      toast.error(e.message || "Material detection failed");
    } finally {
      setLoading(null);
    }
  };

  const handleCodeCompliance = async () => {
    if (!reportId) {
      toast.error("No report selected");
      return;
    }

    setLoading("codes");
    try {
      const result = await callFunction("code-check", {
        report_id: reportId,
        jurisdiction: "*",
        material: "asphalt", // TODO: get from lead.roof_material
      });
      const rawCount = result["count"];
      const found = typeof rawCount === "number" ? rawCount : 0;
      toast.success(`Found ${found} code findings`);
      onRefresh?.();
    } catch (error: unknown) {
      console.error("Code compliance error:", error);
      const e = error instanceof Error ? error : new Error(String(error));
      toast.error(e.message || "Code compliance check failed");
    } finally {
      setLoading(null);
    }
  };

  const handleStormCheck = async () => {
    if (!orgId || lat == null || lon == null) {
      toast.error("Location data required for storm check");
      return;
    }

    setLoading("storm");
    try {
      const result = await callFunction("storm-fetch", {
        org_id: orgId,
        lat,
        lon,
        address: address || "",
      });
      const summary =
        typeof result["summary"] === "string" ? result["summary"] : "No recent storms";
      toast.success(`Storm data retrieved: ${summary}`);
      onRefresh?.();
    } catch (error: unknown) {
      console.error("Storm check error:", error);
      const e = error instanceof Error ? error : new Error(String(error));
      toast.error(e.message || "Storm check failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleAutoDetect}
        disabled={loading !== null || !photos.length}
        variant="default"
      >
        {loading === "detect" ? "Detecting..." : "Auto-detect Damage"}
      </Button>

      <Button
        onClick={handleDetectMaterials}
        disabled={loading !== null || !photos.length}
        variant="outline"
      >
        {loading === "materials" ? "Detecting..." : "Detect Materials"}
      </Button>

      <Button
        onClick={handleCodeCompliance}
        disabled={loading !== null || !reportId}
        variant="outline"
      >
        {loading === "codes" ? "Checking..." : "Code & Compliance"}
      </Button>

      <Button
        onClick={handleStormCheck}
        disabled={loading !== null || !orgId || lat == null || lon == null}
        variant="outline"
      >
        {loading === "storm" ? "Checking..." : "Storm Check"}
      </Button>
    </div>
  );
}
