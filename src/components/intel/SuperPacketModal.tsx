// components/intel/SuperPacketModal.tsx
/**
 * 🔥 POST-GENERATION MODAL
 * 
 * Shows after super packet is generated.
 * Provides instant actions:
 * - Send to Adjuster
 * - Send Homeowner Summary
 * - View Packet (download)
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SuperPacketModalProps {
  isOpen: boolean;
  onClose: () => void;
  packetId: string;
  claimNumber: string;
  mode: "QUICK" | "STANDARD" | "NUCLEAR";
  underpayment?: number;
  correlationScore?: number;
  adjusterEmail?: string;
  adjusterName?: string;
  homeownerEmail?: string;
  insured_name?: string;
}

export function SuperPacketModal({
  isOpen,
  onClose,
  packetId,
  claimNumber,
  mode,
  underpayment = 0,
  correlationScore,
  adjusterEmail = "",
  adjusterName = "",
  homeownerEmail = "",
  insured_name = "",
}: SuperPacketModalProps) {
  const [isSendingAdjuster, setIsSendingAdjuster] = useState(false);
  const [isSendingHomeowner, setIsSendingHomeowner] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [adjEmail, setAdjEmail] = useState(adjusterEmail);
  const [adjName, setAdjName] = useState(adjusterName);
  const [homeEmail, setHomeEmail] = useState(homeownerEmail);

  const handleSendAdjuster = async () => {
    if (!adjEmail) {
      toast.error("Please enter adjuster email");
      return;
    }

    setIsSendingAdjuster(true);
    try {
      const res = await fetch("/api/intel/super-packet/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packetId,
          audience: "ADJUSTER",
          recipientEmail: adjEmail,
          recipientName: adjName,
        }),
      });

      if (!res.ok) throw new Error("Failed to send");

      toast.success(`Super packet sent to ${adjEmail}`);
    } catch (error) {
      toast.error("Failed to send email");
      console.error(error);
    } finally {
      setIsSendingAdjuster(false);
    }
  };

  const handleSendHomeowner = async () => {
    if (!homeEmail) {
      toast.error("Please enter homeowner email");
      return;
    }

    setIsSendingHomeowner(true);
    try {
      const res = await fetch("/api/intel/super-packet/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packetId,
          audience: "HOMEOWNER",
          recipientEmail: homeEmail,
          recipientName: insured_name,
        }),
      });

      if (!res.ok) throw new Error("Failed to send");

      toast.success(`Documentation sent to ${homeEmail}`);
    } catch (error) {
      toast.error("Failed to send email");
      console.error(error);
    } finally {
      setIsSendingHomeowner(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/intel/super-packet/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packetId }),
      });

      if (!res.ok) throw new Error("Failed to download");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `super-packet-${claimNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded");
    } catch (error) {
      toast.error("Failed to download PDF");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const modeBadgeColor =
    mode === "NUCLEAR"
      ? "bg-red-100 text-red-800 border-red-300"
      : mode === "STANDARD"
      ? "bg-blue-100 text-blue-800 border-blue-300"
      : "bg-green-100 text-green-800 border-green-300";

  const modeIcon = mode === "NUCLEAR" ? "⚡" : mode === "STANDARD" ? "📋" : "⚡";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            🔥 Super Packet Ready
            <span
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${modeBadgeColor}`}
            >
              {modeIcon} {mode}
            </span>
          </DialogTitle>
          <DialogDescription>
            Claim {claimNumber} — Generated {new Date().toLocaleTimeString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border bg-gray-50 p-4">
            <div>
              <p className="text-sm text-gray-600">Underpayment</p>
              <p className="text-2xl font-bold text-red-600">
                ${underpayment.toLocaleString()}
              </p>
            </div>
            {correlationScore !== null && correlationScore !== undefined && (
              <div>
                <p className="text-sm text-gray-600">Damage Correlation</p>
                <p className="text-2xl font-bold text-green-600">
                  {(correlationScore * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {/* Send to Adjuster */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">📤 Send to Adjuster</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="adjName">Adjuster Name</Label>
                <Input
                  id="adjName"
                  value={adjName}
                  onChange={(e) => setAdjName(e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label htmlFor="adjEmail">Adjuster Email</Label>
                <Input
                  id="adjEmail"
                  type="email"
                  value={adjEmail}
                  onChange={(e) => setAdjEmail(e.target.value)}
                  placeholder="adjuster@carrier.com"
                />
              </div>
            </div>
            <Button
              onClick={handleSendAdjuster}
              disabled={isSendingAdjuster || !adjEmail}
              className="w-full"
            >
              {isSendingAdjuster ? "Sending..." : "Send to Adjuster"}
            </Button>
          </div>

          {/* Send to Homeowner */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">🏠 Send Homeowner Summary</h3>
            <div>
              <Label htmlFor="homeEmail">Homeowner Email</Label>
              <Input
                id="homeEmail"
                type="email"
                value={homeEmail}
                onChange={(e) => setHomeEmail(e.target.value)}
                placeholder="homeowner@email.com"
              />
            </div>
            <Button
              onClick={handleSendHomeowner}
              disabled={isSendingHomeowner || !homeEmail}
              variant="secondary"
              className="w-full"
            >
              {isSendingHomeowner ? "Sending..." : "Send to Homeowner"}
            </Button>
          </div>

          {/* Download */}
          <div className="border-t pt-4">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              variant="outline"
              className="w-full"
            >
              {isDownloading ? "Downloading..." : "📥 View/Download Packet"}
            </Button>
          </div>

          {/* Close */}
          <Button onClick={onClose} variant="ghost" className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
