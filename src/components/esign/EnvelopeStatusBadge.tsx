"use client";

/**
 * Envelope Status Badge Component
 */

import { AlertCircle,CheckCircle2, Clock, Send, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type EnvelopeStatus = "DRAFT" | "SENT" | "IN_PROGRESS" | "COMPLETED" | "VOIDED" | "EXPIRED";

interface EnvelopeStatusBadgeProps {
  status: EnvelopeStatus;
  className?: string;
}

export function EnvelopeStatusBadge({ status, className }: EnvelopeStatusBadgeProps) {
  const config = {
    DRAFT: {
      label: "Draft",
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    },
    SENT: {
      label: "Sent",
      variant: "default" as const,
      icon: Send,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    IN_PROGRESS: {
      label: "In Progress",
      variant: "default" as const,
      icon: AlertCircle,
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    COMPLETED: {
      label: "Completed",
      variant: "default" as const,
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    VOIDED: {
      label: "Voided",
      variant: "destructive" as const,
      icon: XCircle,
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    EXPIRED: {
      label: "Expired",
      variant: "destructive" as const,
      icon: XCircle,
      className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    },
  };

  const { label, icon: Icon, className: badgeClassName } = config[status];

  return (
    <Badge className={`${badgeClassName} ${className || ""}`}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
