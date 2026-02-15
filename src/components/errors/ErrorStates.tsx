/**
 * Error State Components
 *
 * User-friendly error messages with actionable next steps.
 * Consistent error UX across the application.
 */

import { AlertCircle, FileQuestion,Home, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onRetry?: () => void;
  variant?: "error" | "warning" | "info";
  showSupport?: boolean;
}

/**
 * Generic error message component
 */
export function ErrorMessage({
  title,
  message,
  actionLabel,
  actionHref,
  onRetry,
  variant = "error",
  showSupport = true,
}: ErrorMessageProps) {
  const variantStyles = {
    error:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
    warning:
      "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100",
    info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
  };

  const iconColor = {
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  return (
    <div className={cn("rounded-lg border p-6", variantStyles[variant])}>
      <div className="flex items-start gap-4">
        <AlertCircle className={cn("h-6 w-6 flex-shrink-0", iconColor[variant])} />
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm opacity-90">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}

            {actionHref && actionLabel && (
              <Link href={actionHref}>
                <Button variant="outline" size="sm">
                  {actionLabel}
                </Button>
              </Link>
            )}

            {showSupport && (
              <Link href="/feedback">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Claim not found error
 */
export function ClaimNotFoundError({ claimId }: { claimId: string }) {
  return (
    <ErrorMessage
      title="Claim Not Found"
      message={`We couldn't find claim "${claimId}". It may have been deleted or you don't have permission to view it.`}
      actionLabel="Go to Claims"
      actionHref="/claims"
      variant="warning"
    />
  );
}

/**
 * Permission denied error
 */
export function PermissionDeniedError({ resource }: { resource: string }) {
  return (
    <ErrorMessage
      title="Permission Denied"
      message={`You don't have permission to access this ${resource}. Contact your administrator if you need access.`}
      actionLabel="Go to Dashboard"
      actionHref="/dashboard"
      variant="warning"
    />
  );
}

/**
 * Organization not found error
 */
export function OrganizationNotFoundError() {
  return (
    <ErrorMessage
      title="Organization Not Found"
      message="We couldn't find your organization. This usually happens after account setup. Try signing out and back in."
      actionLabel="Sign Out"
      actionHref="/sign-out"
      variant="error"
    />
  );
}

/**
 * Network error (API failed)
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Connection Error"
      message="We couldn't connect to the server. Check your internet connection and try again."
      onRetry={onRetry}
      variant="error"
    />
  );
}

/**
 * Data loading error (with retry)
 */
export function DataLoadError({ resource, onRetry }: { resource: string; onRetry?: () => void }) {
  return (
    <ErrorMessage
      title={`Failed to Load ${resource}`}
      message={`Something went wrong while loading ${resource.toLowerCase()}. This is usually temporary.`}
      onRetry={onRetry}
      variant="error"
    />
  );
}

/**
 * Empty state (not an error, but no data)
 */
export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  message,
  actionLabel,
  actionHref,
}: {
  icon?: React.ElementType;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="mt-6">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}

/**
 * Full-page error state
 */
export function FullPageError({
  title = "Something Went Wrong",
  message = "An unexpected error occurred. Our team has been notified.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md space-y-6 p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>

        <div className="flex flex-col gap-2">
          {onRetry && (
            <Button onClick={onRetry} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}

          <Link href="/dashboard">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>

          <Link href="/feedback">
            <Button variant="ghost" className="w-full gap-2">
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
          </Link>
        </div>

        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <strong>Error Code:</strong> {Date.now()}
          <br />
          <strong>Time:</strong> {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline error (for form fields, etc.)
 */
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Error boundary fallback
 */
export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <FullPageError
      title="Application Error"
      message={error.message || "An unexpected error occurred in the application."}
      onRetry={resetErrorBoundary}
    />
  );
}
