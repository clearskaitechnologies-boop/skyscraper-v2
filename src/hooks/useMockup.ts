/**
 * useMockup - AI Roof Mockup generator
 */
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export type MockupSpec = {
  reportId?: string;
  address?: string;
  colorway: string;
  systemType: "Shingle" | "Tile" | "Metal";
  angles: Array<"front" | "left" | "right" | "top">;
  pitchHint?: "low" | "medium" | "steep";
};

export function useMockup() {
  const [busy, setBusy] = useState(false);

  async function generate(spec: MockupSpec) {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-mockup-v2", {
        body: {
          reportId: spec.reportId || crypto.randomUUID(),
          address: spec.address,
          colorway: spec.colorway,
          systemType: spec.systemType,
          angles: spec.angles,
          pitchHint: spec.pitchHint || "medium",
        },
      });

      if (error) throw error;
      return data?.result;
    } finally {
      setBusy(false);
    }
  }

  return { generate, busy };
}
