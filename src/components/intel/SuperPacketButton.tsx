// components/intel/SuperPacketButton.tsx
/**
 * 🔥 SUPER BUTTON
 * 
 * The ONE BUTTON that does everything.
 * Generates full claim packet in 3 modes:
 * - QUICK: 2-4 pages (fast approvals)
 * - STANDARD: 8-15 pages (carrier-ready)
 * - NUCLEAR: 20-40 pages (disputes, attorneys)
 */

"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SuperPacketModal } from "./SuperPacketModal";

interface SuperPacketButtonProps {
  claimId: string;
  claimNumber: string;
  adjusterEmail?: string;
  adjusterName?: string;
  homeownerEmail?: string;
  insured_name?: string;
}

export function SuperPacketButton({
  claimId,
  claimNumber,
  adjusterEmail,
  adjusterName,
  homeownerEmail,
  insured_name,
}: SuperPacketButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPacket, setGeneratedPacket] = useState<{
    packetId: string;
    mode: "QUICK" | "STANDARD" | "NUCLEAR";
    underpayment: number;
    correlationScore?: number;
  } | null>(null);

  const handleGenerate = async (mode: "QUICK" | "STANDARD" | "NUCLEAR") => {
    setIsGenerating(true);
    toast.loading(`Generating ${mode} packet...`, { id: "super-packet" });

    try {
      const res = await fetch("/api/intel/super-packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, mode }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Generation failed");
      }

      const data = await res.json();

      toast.success(`${mode} packet generated!`, { id: "super-packet" });

      setGeneratedPacket({
        packetId: data.packetId,
        mode: data.mode,
        underpayment: data.underpayment,
        correlationScore: data.correlationScore,
      });
    } catch (error) {
      console.error("[SUPER PACKET] Error:", error);
      toast.error("Failed to generate packet", { id: "super-packet" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            disabled={isGenerating}
            className="bg-gradient-to-r from-orange-600 to-red-600 font-bold text-white shadow-lg hover:from-orange-700 hover:to-red-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                🔥 Generate Full Claim Packet
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuItem
            onClick={() => handleGenerate("QUICK")}
            className="flex cursor-pointer flex-col items-start p-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="font-semibold">Quick Strike</span>
              <span className="ml-auto text-xs text-gray-500">2-4 pages</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Fast approvals. Executive summary + key findings.
            </p>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleGenerate("STANDARD")}
            className="flex cursor-pointer flex-col items-start p-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span className="font-semibold">Standard</span>
              <span className="ml-auto text-xs text-gray-500">8-15 pages</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Carrier-ready. Full financial + codes + supplements.
            </p>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleGenerate("NUCLEAR")}
            className="flex cursor-pointer flex-col items-start border-t-2 border-red-200 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="font-semibold text-red-600">Nuclear</span>
              <span className="ml-auto text-xs text-gray-500">20-40 pages</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Legal-grade. Forensic weather + damage correlation + expert opinion.
            </p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Post-Generation Modal */}
      {generatedPacket && (
        <SuperPacketModal
          isOpen={!!generatedPacket}
          onClose={() => setGeneratedPacket(null)}
          packetId={generatedPacket.packetId}
          claimNumber={claimNumber}
          mode={generatedPacket.mode}
          underpayment={generatedPacket.underpayment}
          correlationScore={generatedPacket.correlationScore}
          adjusterEmail={adjusterEmail}
          adjusterName={adjusterName}
          homeownerEmail={homeownerEmail}
          insured_name={insured_name}
        />
      )}
    </>
  );
}
