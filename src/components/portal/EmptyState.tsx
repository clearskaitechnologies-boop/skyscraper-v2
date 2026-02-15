/**
 * EmptyState Component
 *
 * Beautiful empty states for when no data exists in real mode.
 * Used throughout the portal when demo mode is OFF and no records exist.
 */

import {
  Briefcase,
  Camera,
  CreditCard,
  FileText,
  Home,
  LucideIcon,
  MessageSquare,
  Plus,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  secondaryCta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EmptyState({
  icon: Icon = Briefcase,
  title,
  description,
  cta,
  secondaryCta,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-8 px-4",
      icon: "h-10 w-10",
      iconWrapper: "h-16 w-16",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-12 px-6",
      icon: "h-12 w-12",
      iconWrapper: "h-20 w-20",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16 px-8",
      icon: "h-16 w-16",
      iconWrapper: "h-24 w-24",
      title: "text-xl",
      description: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-xl border border-dashed border-muted-foreground/25",
        "bg-muted/30",
        sizes.container,
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          "mb-4 bg-muted/50 text-muted-foreground",
          sizes.iconWrapper
        )}
      >
        <Icon className={sizes.icon} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 className={cn("mb-2 font-semibold text-foreground", sizes.title)}>{title}</h3>

      {/* Description */}
      <p className={cn("mb-6 max-w-sm text-muted-foreground", sizes.description)}>{description}</p>

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {cta &&
          (cta.href ? (
            <Button asChild variant={cta.variant || "default"}>
              <Link href={cta.href}>
                <Plus className="mr-2 h-4 w-4" />
                {cta.label}
              </Link>
            </Button>
          ) : (
            <Button onClick={cta.onClick} variant={cta.variant || "default"}>
              <Plus className="mr-2 h-4 w-4" />
              {cta.label}
            </Button>
          ))}
        {secondaryCta &&
          (secondaryCta.href ? (
            <Button asChild variant="outline">
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          ) : (
            <Button onClick={secondaryCta.onClick} variant="outline">
              {secondaryCta.label}
            </Button>
          ))}
      </div>
    </div>
  );
}

// ============================================================================
// PRESET EMPTY STATES
// ============================================================================

export function EmptyJobs({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={Briefcase}
      title="No jobs yet"
      description="Start your first project by creating a job or connecting with a professional."
      cta={{ label: "Create Job", href: "/portal/projects/new" }}
      secondaryCta={{ label: "Find a Pro", href: "/portal/find-a-pro" }}
      className={className}
    />
  );
}

export function EmptyClaims({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={FileText}
      title="No claims yet"
      description="Start a new insurance claim to track your restoration project from start to finish."
      cta={{ label: "Start Claim", href: "/portal/claims/new" }}
      secondaryCta={{ label: "Learn More", href: "/portal/help/claims" }}
      className={className}
    />
  );
}

export function EmptyMessages({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No messages yet"
      description="Connect with a professional to start a conversation about your project."
      cta={{ label: "Find a Pro", href: "/portal/find-a-pro" }}
      className={className}
    />
  );
}

export function EmptyConnections({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={Users}
      title="No connections yet"
      description="Build your network by connecting with trusted professionals in your area."
      cta={{ label: "Browse Pros", href: "/portal/find-a-pro" }}
      className={className}
    />
  );
}

export function EmptyDocuments({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={FileText}
      title="No documents yet"
      description="Documents shared between you and your contractor will appear here."
      className={className}
      size="sm"
    />
  );
}

export function EmptyPhotos({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={Camera}
      title="No photos yet"
      description="Project photos and documentation will appear here."
      className={className}
      size="sm"
    />
  );
}

export function EmptyInvoices({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={CreditCard}
      title="No invoices yet"
      description="Invoices for your project will appear here once your contractor sends them."
      className={className}
      size="sm"
    />
  );
}

export function EmptySearchResults({ query, className }: { query?: string; className?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        query
          ? `We couldn't find any results for "${query}". Try adjusting your search.`
          : "We couldn't find any results. Try adjusting your filters."
      }
      className={className}
    />
  );
}

export function EmptyProperties({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={Home}
      title="No properties yet"
      description="Add your first property to get started with your home projects."
      cta={{ label: "Add Property", href: "/portal/properties/new" }}
      className={className}
    />
  );
}

// ============================================================================
// WORKSPACE-SPECIFIC EMPTY STATES (Smaller, inline)
// ============================================================================

export function WorkspaceEmptyPhotos({ onUpload }: { onUpload?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Camera className="mb-2 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <p className="mb-3 text-sm text-muted-foreground">No photos uploaded yet</p>
      {onUpload && (
        <Button size="sm" variant="outline" onClick={onUpload}>
          <Plus className="mr-1 h-3 w-3" />
          Upload Photo
        </Button>
      )}
    </div>
  );
}

export function WorkspaceEmptyDocuments({ onUpload }: { onUpload?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <FileText className="mb-2 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <p className="mb-3 text-sm text-muted-foreground">No documents shared yet</p>
      {onUpload && (
        <Button size="sm" variant="outline" onClick={onUpload}>
          <Plus className="mr-1 h-3 w-3" />
          Upload Document
        </Button>
      )}
    </div>
  );
}

export function WorkspaceEmptyMessages({ onStartChat }: { onStartChat?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <p className="mb-3 text-sm text-muted-foreground">No messages yet</p>
      {onStartChat && (
        <Button size="sm" variant="outline" onClick={onStartChat}>
          Start Conversation
        </Button>
      )}
    </div>
  );
}

export function WorkspaceEmptyTimeline() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <FileText className="mb-2 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">No activity yet</p>
    </div>
  );
}

export function WorkspaceEmptyInvoices() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <CreditCard className="mb-2 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">No invoices yet</p>
    </div>
  );
}

export function WorkspaceEmptySignatures() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <FileText className="mb-2 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">No documents pending signature</p>
    </div>
  );
}
