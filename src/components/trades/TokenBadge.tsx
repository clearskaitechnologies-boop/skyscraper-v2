"use client";

import { Coins, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TokenBadgeProps {
  balance: number;
  className?: string;
  showIcon?: boolean;
}

export function TokenBadge({ balance, className, showIcon = true }: TokenBadgeProps) {
  const isLow = balance < 3;
  const isEmpty = balance === 0;

  return (
    <Badge
      variant={isEmpty ? "destructive" : isLow ? "outline" : "secondary"}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 font-medium",
        isEmpty && "border-destructive",
        isLow && !isEmpty && "border-amber-500 text-amber-700 dark:text-amber-400",
        className
      )}
    >
      {showIcon && <Coins className="h-3.5 w-3.5" />}
      <span className="text-sm">{balance}</span>
      <span className="text-xs opacity-70">token{balance !== 1 ? "s" : ""}</span>
    </Badge>
  );
}

interface FullAccessBadgeProps {
  expiresAt?: string | null;
  className?: string;
  variant?: "default" | "compact";
}

export function FullAccessBadge({
  expiresAt,
  className,
  variant = "default",
}: FullAccessBadgeProps) {
  const isActive = expiresAt ? new Date(expiresAt) > new Date() : false;

  if (!isActive) return null;

  const expiryDate = expiresAt ? new Date(expiresAt) : null;
  const daysRemaining = expiryDate
    ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (variant === "compact") {
    return (
      <Badge
        variant="default"
        className={cn("bg-gradient-to-r from-violet-500 to-purple-600", className)}
      >
        <Sparkles className="mr-1 h-3 w-3" />
        <span className="text-xs font-semibold">Full Access</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="default"
      className={cn(
        "border-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white",
        "flex items-center gap-1.5 px-3 py-1.5",
        className
      )}
    >
      <Sparkles className="h-4 w-4" />
      <div className="flex flex-col items-start leading-tight">
        <span className="text-sm font-semibold">Full Access</span>
        {daysRemaining > 0 && daysRemaining <= 7 && (
          <span className="text-xs opacity-90">{daysRemaining} days left</span>
        )}
      </div>
    </Badge>
  );
}
