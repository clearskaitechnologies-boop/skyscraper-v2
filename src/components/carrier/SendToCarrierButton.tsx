/**
 * PHASE 13.5 — SEND TO CARRIER BUTTON
 * Universal "Send to Carrier" dropdown button
 *
 * Supports:
 * - Final Invoice & Depreciation
 * - Supplement Packet
 * - Inspection Report
 * - Weather Verification
 * - Full Claims Package
 */

"use client";

import {
  CheckCircle2,
  CloudRain,
  DollarSign,
  FileText,
  Loader2,
  Package,
  Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SendToCarrierButtonProps {
  claimId: string;
  depreciationPackageId?: string;
  supplementRequestId?: string;
  onSent?: () => void;
}

type DeliveryType =
  | "depreciation"
  | "supplement"
  | "inspection"
  | "report"
  | "invoice"
  | "weather"
  | "full_packet";

const DELIVERY_OPTIONS = [
  {
    type: "depreciation" as DeliveryType,
    label: "Final Invoice & Depreciation",
    icon: DollarSign,
    description: "Send complete depreciation release package",
  },
  {
    type: "supplement" as DeliveryType,
    label: "Supplement Packet",
    icon: FileText,
    description: "Send supplement request with documentation",
  },
  {
    type: "inspection" as DeliveryType,
    label: "Inspection Report",
    icon: FileText,
    description: "Send inspection and damage assessment",
  },
  {
    type: "weather" as DeliveryType,
    label: "Weather Verification",
    icon: CloudRain,
    description: "Send forensic weather report",
  },
  {
    type: "full_packet" as DeliveryType,
    label: "Full Claims Package",
    icon: Package,
    description: "Send all documentation (nuclear option)",
  },
];

export function SendToCarrierButton({
  claimId,
  depreciationPackageId,
  supplementRequestId,
  onSent,
}: SendToCarrierButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DeliveryType | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [ccEmails, setCcEmails] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSelectType = (type: DeliveryType) => {
    setSelectedType(type);
    setIsDialogOpen(true);
  };

  const handleSend = async () => {
    if (!selectedType) return;

    setIsSending(true);

    try {
      const response = await fetch("/api/carrier/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId,
          deliveryType: selectedType,
          recipientEmail: recipientEmail || undefined,
          ccEmails: ccEmails ? ccEmails.split(",").map((e) => e.trim()) : undefined,
          depreciationPackageId,
          supplementRequestId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Send failed");
      }

      toast.success("Packet Sent to Carrier", {
        description: `Sent to ${data.sentTo} • ${data.carrierName || "Carrier"}`,
      });

      setIsDialogOpen(false);
      setRecipientEmail("");
      setCcEmails("");
      onSent?.();
    } catch (error: any) {
      console.error("❌ Send failed:", error);
      toast.error("Send Failed", {
        description: error.message || "Could not send to carrier",
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectedOption = DELIVERY_OPTIONS.find((opt) => opt.type === selectedType);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="lg"
            className="bg-gradient-indigo text-white shadow-lg hover:opacity-95"
          >
            <Send className="mr-2 h-5 w-5" />
            Send to Carrier
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
            Select Document Type
          </div>
          <DropdownMenuSeparator />

          {DELIVERY_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={option.type}
                onClick={() => handleSelectType(option.type)}
                className="cursor-pointer"
              >
                <div className="flex items-start gap-3 py-1">
                  <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="mt-0.5 text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Send Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedOption && <selectedOption.icon className="h-5 w-5 text-blue-600" />}
              Send {selectedOption?.label}
            </DialogTitle>
            <DialogDescription>
              This will send the packet to the insurance carrier with email tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Recipient Email */}
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">
                Recipient Email
                <span className="ml-2 text-xs text-gray-500">
                  (optional - uses carrier inbox if blank)
                </span>
              </Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="adjuster@carrier.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            {/* CC Emails */}
            <div className="space-y-2">
              <Label htmlFor="ccEmails">
                CC Emails
                <span className="ml-2 text-xs text-gray-500">(optional, comma-separated)</span>
              </Label>
              <Input
                id="ccEmails"
                type="text"
                placeholder="email1@example.com, email2@example.com"
                value={ccEmails}
                onChange={(e) => setCcEmails(e.target.value)}
              />
            </div>

            {/* What's Included */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 text-sm font-semibold text-blue-900">What's Included:</div>
              <ul className="space-y-1 text-sm text-blue-800">
                {selectedType === "depreciation" && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Final invoice with line items
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Contractor completion statement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Homeowner depreciation authorization
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Supporting documentation
                    </li>
                  </>
                )}
                {selectedType === "supplement" && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Itemized supplement request
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Code citations and justifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Photographic evidence
                    </li>
                  </>
                )}
                {selectedType === "inspection" && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Inspection report
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Damage assessment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Photo documentation
                    </li>
                  </>
                )}
                {selectedType === "weather" && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Forensic weather report
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Storm verification
                    </li>
                  </>
                )}
                {selectedType === "full_packet" && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      All available documentation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Complete claims package
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Carrier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
