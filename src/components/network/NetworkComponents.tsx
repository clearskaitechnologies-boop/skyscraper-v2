/**
 * Phase 10: Shared Network UI Components
 * Reusable components for Trades Network & Client Network features
 */

import { Building2, Globe, Mail, MapPin,Phone } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ============================================================================
// TradeCard - Displays a single trade profile
// ============================================================================

interface TradeCardProps {
  trade: {
    id: string;
    companyName: string;
    tradeType: string;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    serviceAreas?: string | null;
    ratingSummary?: number | null;
    reviewCount?: number | null;
  };
  linkTo?: string;
}

export function TradeCard({ trade, linkTo }: TradeCardProps) {
  const content = (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{trade.companyName}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {trade.tradeType}
              </Badge>
            </div>
          </div>
          {trade.ratingSummary && trade.ratingSummary > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-500">
                {trade.ratingSummary?.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">
                {trade.reviewCount || 0} reviews
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {trade.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{trade.phone}</span>
          </div>
        )}
        {trade.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{trade.email}</span>
          </div>
        )}
        {trade.website && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4" />
            <a
              href={trade.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Visit Website
            </a>
          </div>
        )}
        {trade.serviceAreas && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-xs">{trade.serviceAreas}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>;
  }

  return content;
}

// ============================================================================
// ClientNetworkCard - Displays a client network summary
// ============================================================================

interface ClientNetworkCardProps {
  client: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date | string;
    _count?: {
      trades?: number;
      contacts?: number;
      activity?: number;
    };
  };
}

export function ClientNetworkCard({ client }: ClientNetworkCardProps) {
  return (
    <Link href={`/network/clients/${client.slug}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{client.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                /{client.slug}
              </p>
            </div>
            <Badge variant="outline">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-primary">
                {client._count?.trades || 0}
              </div>
              <div className="text-muted-foreground">Trades</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {client._count?.contacts || 0}
              </div>
              <div className="text-muted-foreground">Contacts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {client._count?.activity || 0}
              </div>
              <div className="text-muted-foreground">Updates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ============================================================================
// ActivityFeed - Displays activity timeline
// ============================================================================

interface Activity {
  id: string;
  actorType: string;
  actorName?: string | null;
  type: string;
  message?: string | null;
  createdAt: Date | string;
}

interface ActivityFeedProps {
  activities: Activity[];
  emptyMessage?: string;
}

export function ActivityFeed({
  activities,
  emptyMessage = "No activity yet",
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex gap-3 rounded-lg border bg-card p-4"
        >
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-medium">
                {activity.actorName || "System"}
              </span>
              <Badge variant="outline" className="text-xs">
                {activity.type}
              </Badge>
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(activity.createdAt).toLocaleDateString()}
              </span>
            </div>
            {activity.message && (
              <p className="text-sm text-muted-foreground">
                {activity.message}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EmptyState - Generic empty state component
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="px-4 py-12 text-center">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-6 text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
