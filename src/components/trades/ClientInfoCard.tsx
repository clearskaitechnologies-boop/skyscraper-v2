/**
 * ClientInfoCard - Shows client details to contractors in their workspace
 *
 * Mirror of "Your Contractor" section on client side
 * Used in: Claims Workspace, Retail Workspace, Leads Workspace
 */

"use client";

import { ChevronRight, Mail, MapPin, Phone, Send, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ClientInfo {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  connectionStatus?: "pending" | "accepted" | "connected" | string | null;
  claimNumber?: string | null;
  propertyType?: string | null;
}

interface ClientInfoCardProps {
  client: ClientInfo;
  showFullAddress?: boolean;
  showMessageButton?: boolean;
  onMessage?: () => void;
}

export function ClientInfoCard({
  client,
  showFullAddress = false,
  showMessageButton = true,
  onMessage,
}: ClientInfoCardProps) {
  const [imageError, setImageError] = useState(false);

  const initials =
    client.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CL";

  const location = showFullAddress
    ? [client.address, client.city, client.state, client.zipCode].filter(Boolean).join(", ")
    : [client.city, client.state].filter(Boolean).join(", ");

  const statusColor =
    {
      pending: "bg-amber-100 text-amber-700 border-amber-300",
      accepted: "bg-green-100 text-green-700 border-green-300",
      connected: "bg-green-100 text-green-700 border-green-300",
    }[client.connectionStatus?.toLowerCase() || ""] || "bg-slate-100 text-slate-700";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-blue-600" />
            Your Client
          </CardTitle>
          {client.connectionStatus && (
            <Badge variant="outline" className={statusColor}>
              {client.connectionStatus === "accepted" || client.connectionStatus === "connected"
                ? "Connected"
                : client.connectionStatus}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Client Avatar & Name */}
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 shadow-md ring-2 ring-white dark:ring-slate-900">
            {client.avatar && !imageError ? (
              <AvatarImage
                src={client.avatar}
                alt={client.name}
                onError={() => setImageError(true)}
              />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900 dark:text-white">{client.name}</p>
            {client.claimNumber && (
              <p className="text-sm text-slate-500">Claim #{client.claimNumber}</p>
            )}
            {client.propertyType && (
              <Badge variant="outline" className="mt-1 text-xs">
                {client.propertyType}
              </Badge>
            )}
          </div>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="h-4 w-4 flex-shrink-0 text-red-500" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Contact Actions */}
        <div className="flex flex-wrap gap-2">
          {client.phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${client.phone}`}>
                <Phone className="mr-2 h-4 w-4" />
                {client.phone}
              </a>
            </Button>
          )}
          {client.email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${client.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </a>
            </Button>
          )}
        </div>

        {/* Message Button */}
        {showMessageButton && (
          <Button
            variant="default"
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={onMessage}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        )}

        {/* View Full Profile Link */}
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href={`/trades/clients/${client.id}`}>
            View Client Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Minimal client info for job cards
 */
export function ClientInfoMini({ client }: { client: ClientInfo }) {
  const initials =
    client.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CL";

  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
      <Avatar className="h-10 w-10">
        <AvatarImage src={client.avatar || undefined} />
        <AvatarFallback className="bg-blue-100 text-sm text-blue-600">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{client.name}</p>
        {client.city && client.state && (
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            {client.city}, {client.state}
          </p>
        )}
      </div>
      {client.phone && (
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-8 w-8"
          title={`Call ${client.name}`}
        >
          <a href={`tel:${client.phone}`} aria-label={`Call ${client.name} at ${client.phone}`}>
            <Phone className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  );
}
