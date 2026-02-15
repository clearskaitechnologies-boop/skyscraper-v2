// components/automation/DominusGodModeButton.tsx
/**
 * 🔥 GOD MODE BUTTON
 * Runs FULL automation pipeline
 */

"use client";

import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface DominusGodModeButtonProps {
  claimId: string;
  onComplete?: () => void;
}

export function DominusGodModeButton({ claimId, onComplete }: DominusGodModeButtonProps) {
  const [isRunning, setIsRunning] = useState(false);

  const handleRunAutomation = async () => {
    setIsRunning(true);
    toast.loading("🔥 Dominus is analyzing the claim...", { id: "dominus" });

    try {
      const res = await fetch("/api/automation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId }),
      });

      if (!res.ok) throw new Error("Automation failed");

      const data = await res.json();

      toast.success(
        `🔥 Dominus complete! ${data.triggersDetected} triggers, ${data.actionsExecuted} actions`,
        { id: "dominus" }
      );

      onComplete?.();
    } catch (error) {
      console.error("[DOMINUS] Error:", error);
      toast.error("Automation failed", { id: "dominus" });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Button
      size="lg"
      disabled={isRunning}
      onClick={handleRunAutomation}
      className="bg-gradient-error font-bold text-white shadow-lg hover:opacity-95"
    >
      {isRunning ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Running Dominus...
        </>
      ) : (
        <>
          <Zap className="mr-2 h-5 w-5" />
          🔥 RUN FULL DOMINUS
        </>
      )}
    </Button>
  );
}
