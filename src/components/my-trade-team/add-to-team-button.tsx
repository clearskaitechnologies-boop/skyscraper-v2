"use client";

import { Check,UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const TRADE_CATEGORIES = [
  "Roofing",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Painting",
  "Flooring",
  "Landscaping",
  "General Contractor",
  "Handyman",
  "Appliance Repair",
  "Window/Door",
  "Pest Control",
];

interface AddToTeamButtonProps {
  contractorId: string;
  contractorName: string;
  defaultTrade?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function AddToTeamButton({
  contractorId,
  contractorName,
  defaultTrade,
  variant = "default",
  size = "default",
  showIcon = true,
  className = "",
}: AddToTeamButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [formData, setFormData] = useState({
    trade: defaultTrade || "",
    isPrimary: false,
    nickname: "",
    notes: "",
  });

  const handleAdd = async () => {
    if (!formData.trade) {
      alert("Please select a trade category");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/v1/my/trade-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorId,
          trade: formData.trade,
          isPrimary: formData.isPrimary,
          nickname: formData.nickname || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to team");
      }

      setAdded(true);
      setTimeout(() => {
        setOpen(false);
        setAdded(false);
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Error adding to team:", error);
      alert(error instanceof Error ? error.message : "Failed to add to team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {showIcon && <UserPlus className="mr-2 h-4 w-4" />}
          Add to Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {contractorName} to Your Trade Team</DialogTitle>
          <DialogDescription>
            Save this contractor to your personal roster for easy access later.
          </DialogDescription>
        </DialogHeader>

        {added ? (
          <div className="space-y-4 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Added to Trade Team!</p>
              <p className="text-sm text-muted-foreground">
                View your team in My Trades
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Trade Category */}
            <div className="space-y-2">
              <Label htmlFor="trade">Trade Category *</Label>
              <Select
                value={formData.trade}
                onValueChange={(value) =>
                  setFormData({ ...formData, trade: value })
                }
              >
                <SelectTrigger id="trade">
                  <SelectValue placeholder="Select trade..." />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_CATEGORIES.map((trade) => (
                    <SelectItem key={trade} value={trade}>
                      {trade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="nickname">
                Nickname <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="nickname"
                placeholder="e.g., John's Roofing"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
              />
            </div>

            {/* Primary Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="primary">Set as Primary</Label>
                <p className="text-xs text-muted-foreground">
                  Your go-to contractor for this trade
                </p>
              </div>
              <Switch
                id="primary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPrimary: checked })
                }
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this contractor..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAdd}
                disabled={loading || !formData.trade}
              >
                {loading ? "Adding..." : "Add to Team"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
