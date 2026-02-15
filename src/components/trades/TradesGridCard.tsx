"use client";

import { CheckCircle2, MapPin, Sparkles, Star, Zap } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ConnectionStatus = "none" | "pending" | "connected" | "declined";

interface TradesGridCardProps {
  id: string;

  businessName?: string | null;
  logoUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;

  serviceAreas?: string[]; // e.g. ["86314", "86327", "86305"]
  primaryServices?: string[]; // e.g. ["Roof Repairs", "Inspections"]
  emergencyService?: boolean;
  isVerified?: boolean;

  connectionStatus?: ConnectionStatus;

  onViewProfile?: (id: string) => void;
  onConnect?: (id: string) => void;
}

export function TradesGridCard(props: TradesGridCardProps) {
  const {
    id,
    businessName,
    logoUrl,
    rating,
    reviewCount,
    serviceAreas,
    primaryServices,
    emergencyService,
    isVerified,
    connectionStatus = "none",
    onViewProfile,
    onConnect,
  } = props;

  // 🔹 Placeholders so the card looks good even with no real data yet
  const name = businessName || "Your Company Name";

  const initials = React.useMemo(() => {
    if (!name) return "YC";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second || first || "YC").toUpperCase();
  }, [name]);

  const displayedRating = rating ?? 4.8;
  const displayedReviewCount = reviewCount ?? 127;

  const areas =
    serviceAreas && serviceAreas.length > 0
      ? serviceAreas
      : ["00000", "00001", "00002", "00003", "00004"];

  const primaryServicesLabel =
    primaryServices && primaryServices.length > 0
      ? primaryServices.slice(0, 3).join(", ")
      : "Roof Repairs, Inspections";

  const extraAreasCount = areas.length > 3 ? areas.length - 3 : 0;
  const areasLabel =
    areas.length <= 3 ? areas.join(", ") : `${areas.slice(0, 3).join(", ")}, +${extraAreasCount}`;

  const showEmergency = emergencyService ?? true;
  const verified = isVerified ?? true;

  // 🔹 Connection status badge styling
  const renderConnectionBadge = (status: ConnectionStatus) => {
    if (status === "connected") {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500/70 bg-emerald-500/10 text-xs text-emerald-600"
        >
          <CheckCircle2 className="h-3 w-3" />
          Connected
        </Badge>
      );
    }

    if (status === "pending") {
      return (
        <Badge
          variant="outline"
          className="border-amber-500/70 bg-amber-500/10 text-xs text-amber-600"
        >
          Pending…
        </Badge>
      );
    }

    if (status === "declined") {
      return (
        <Badge
          variant="outline"
          className="border-rose-500/70 bg-rose-500/10 text-xs text-rose-600"
        >
          Declined
        </Badge>
      );
    }

    return null;
  };

  // 🔹 Connect button behavior based on status
  const getConnectLabel = (status: ConnectionStatus) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "pending":
        return "Request Pending";
      case "declined":
        return "Request Again";
      default:
        return "Connect";
    }
  };

  const connectDisabled = connectionStatus === "connected" || connectionStatus === "pending";

  return (
    <Card className="flex h-full flex-col justify-between rounded-2xl border bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-4 p-0">
        {/* Top row: Logo + verification + connection status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {logoUrl && <AvatarImage src={logoUrl} alt={name} />}
              <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground">{name}</span>
                {verified && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-emerald-500/70 bg-emerald-500/10 text-[10px] font-medium uppercase tracking-wide text-emerald-600"
                  >
                    <Sparkles className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-current" />
                <span>{displayedRating.toFixed(1)}</span>
                <span className="text-[10px]">({displayedReviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {renderConnectionBadge(connectionStatus)}
        </div>

        {/* Middle: service areas + services + emergency */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-start gap-1.5">
            <MapPin className="mt-[2px] h-3 w-3 shrink-0" />
            <span>
              <span className="font-medium text-foreground">Serving: </span>
              {areasLabel}
            </span>
          </div>

          <div className="flex items-start gap-1.5">
            <span className="mt-[2px] h-3 w-3 shrink-0">🔧</span>
            <span>
              <span className="font-medium text-foreground">Services: </span>
              {primaryServicesLabel}
            </span>
          </div>

          {showEmergency && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <Zap className="h-3 w-3" />
              24/7 Emergency Available
            </div>
          )}
        </div>

        {/* Bottom: actions */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            type="button"
            onClick={() => onViewProfile?.(id)}
          >
            View Profile
          </Button>

          <Button
            size="sm"
            className="flex-1 text-xs"
            type="button"
            disabled={connectDisabled && (connectionStatus as string) !== "declined"}
            onClick={() => onConnect?.(id)}
          >
            {getConnectLabel(connectionStatus)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
