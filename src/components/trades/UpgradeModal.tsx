"use client";

import { Building2, Coins, MessageCircle, Send, Sparkles, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UpgradeReason =
  | "insufficient_tokens"
  | "full_access_required"
  | "feature_locked"
  | "seat_limit_reached"
  | "company_page_locked";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: UpgradeReason;
  currentBalance?: number;
  seatInfo?: {
    used: number;
    limit: number;
    currentPlan: string;
  };
  companyInfo?: {
    memberCount: number;
    currentPlan: string;
    requirementsToUnlock?: string;
  };
}

export function UpgradeModal({
  open,
  onOpenChange,
  reason = "insufficient_tokens",
  currentBalance = 0,
  seatInfo,
  companyInfo,
}: UpgradeModalProps) {
  const router = useRouter();

  const handleBuyTokens = () => {
    onOpenChange(false);
    router.push("/billing?tab=tokens");
  };

  const handleUpgradeFullAccess = () => {
    onOpenChange(false);
    router.push("/billing?tab=subscription");
  };

  const handleUpgradePlan = () => {
    onOpenChange(false);
    router.push("/settings/billing");
  };

  const getContent = () => {
    switch (reason) {
      case "seat_limit_reached":
        return {
          title: "Team Seat Limit Reached",
          description: `You've used all ${seatInfo?.limit || 0} seats on your ${seatInfo?.currentPlan || "current"} plan.`,
          icon: <Users className="h-12 w-12 text-orange-500" />,
          features: [
            {
              icon: <Users className="h-5 w-5" />,
              text:
                seatInfo?.currentPlan === "solo"
                  ? "Add up to 2 seats at $9.99/seat"
                  : "Solo: 1 seat (+2 addon at $9.99/ea)",
            },
            {
              icon: <Users className="h-5 w-5" />,
              text: "Business: 10 seats — $80/seat/mo",
            },
            {
              icon: <Building2 className="h-5 w-5" />,
              text: "Enterprise: 25 seats — $80/seat/mo",
            },
          ],
          primaryAction:
            seatInfo?.currentPlan === "solo" && (seatInfo?.limit || 0) < 3
              ? "Add Seat ($9.99/mo)"
              : "Upgrade Plan",
          secondaryAction: null,
          onPrimary: handleUpgradePlan,
        };
      case "company_page_locked":
        return {
          title: "Company Page Locked",
          description:
            companyInfo?.requirementsToUnlock || "Upgrade your plan to unlock your company page.",
          icon: <Building2 className="h-12 w-12 text-blue-500" />,
          features: [
            {
              icon: <Building2 className="h-5 w-5" />,
              text: "Showcase your company to homeowners",
            },
            {
              icon: <Users className="h-5 w-5" />,
              text: "Add team members with dedicated seats",
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              text: "Get priority in contractor search results",
            },
          ],
          primaryAction: "Upgrade to Unlock",
          secondaryAction: `Or add ${3 - (companyInfo?.memberCount || 0)} more team members`,
          onPrimary: handleUpgradePlan,
        };
      case "full_access_required":
        return {
          title: "Full Access Required",
          description: "This feature requires a Full Access subscription.",
          icon: <Sparkles className="h-12 w-12 text-violet-500" />,
          features: [
            {
              icon: <MessageCircle className="h-5 w-5" />,
              text: "Unlimited messaging (no token costs)",
            },
            {
              icon: <Send className="h-5 w-5" />,
              text: "Post unlimited job opportunities",
            },
            { icon: <Zap className="h-5 w-5" />, text: "Priority support" },
          ],
          primaryAction: "Upgrade to Full Access",
          secondaryAction: null,
          onPrimary: handleUpgradeFullAccess,
        };
      case "feature_locked":
        return {
          title: "Premium Feature",
          description: "Unlock this feature with Full Access.",
          icon: <Sparkles className="h-12 w-12 text-violet-500" />,
          features: [
            {
              icon: <MessageCircle className="h-5 w-5" />,
              text: "Unlimited messaging",
            },
            {
              icon: <Send className="h-5 w-5" />,
              text: "Post job opportunities",
            },
            { icon: <Zap className="h-5 w-5" />, text: "All premium features" },
          ],
          primaryAction: "Get Full Access",
          secondaryAction: null,
          onPrimary: handleUpgradeFullAccess,
        };
      default: // insufficient_tokens
        return {
          title: "Insufficient Tokens",
          description: `You have ${currentBalance} token${currentBalance !== 1 ? "s" : ""}. You need more to continue.`,
          icon: <Coins className="h-12 w-12 text-amber-500" />,
          features: [
            {
              icon: <Coins className="h-5 w-5" />,
              text: "Buy tokens as you go",
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              text: "Or get Full Access for unlimited messaging",
            },
          ],
          primaryAction: "Buy Tokens",
          secondaryAction: "Upgrade to Full Access",
          onPrimary: handleBuyTokens,
        };
    }
  };

  const content = getContent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-4 flex justify-center">{content.icon}</div>
          <DialogTitle className="text-center text-xl">{content.title}</DialogTitle>
          <DialogDescription className="text-center">{content.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {content.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="shrink-0 text-primary">{feature.icon}</div>
              <p className="text-sm text-muted-foreground">{feature.text}</p>
            </div>
          ))}

          {reason === "insufficient_tokens" && (
            <div className="mt-6 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-4 dark:border-violet-800 dark:from-violet-950/20 dark:to-purple-950/20">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
                <div>
                  <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">
                    Full Access - $9.99/month
                  </p>
                  <p className="mt-1 text-xs text-violet-700 dark:text-violet-300">
                    Unlimited messaging with no token costs. AI tools still use tokens.
                  </p>
                </div>
              </div>
            </div>
          )}

          {reason === "seat_limit_reached" && seatInfo && (
            <div className="mt-6 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 dark:border-orange-800 dark:from-orange-950/20 dark:to-amber-950/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Seats Used
                </span>
                <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                  {seatInfo.used} / {seatInfo.limit}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-orange-200 dark:bg-orange-800">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${Math.min((seatInfo.used / seatInfo.limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {reason === "company_page_locked" && companyInfo && companyInfo.memberCount < 3 && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Alternative: Add Team Members
                  </p>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                    Company pages automatically unlock when you have 3+ team members. You currently
                    have {companyInfo.memberCount}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={
              content.onPrimary ||
              (reason === "insufficient_tokens" ? handleBuyTokens : handleUpgradeFullAccess)
            }
            className="w-full"
            size="lg"
          >
            {content.primaryAction}
          </Button>
          {content.secondaryAction && reason !== "company_page_locked" && (
            <Button
              onClick={handleUpgradeFullAccess}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {content.secondaryAction}
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)} variant="ghost" className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
