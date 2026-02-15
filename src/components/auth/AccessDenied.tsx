/**
 * MASTER PROMPT #66: Access Denied UI Component
 * 
 * Displays when a user tries to access a page or feature
 * they don't have permission for.
 */

import { AlertTriangle, ArrowLeft,Shield } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccessDeniedProps {
  requiredRole?: string;
  currentRole?: string | null;
  message?: string;
  showBackButton?: boolean;
}

export function AccessDenied({
  requiredRole,
  currentRole,
  message,
  showBackButton = true,
}: AccessDeniedProps) {
  const defaultMessage = requiredRole
    ? `This page requires ${requiredRole} role. Your current role: ${currentRole || "none"}.`
    : "You don't have permission to access this page.";

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-600">
              <Shield className="h-6 w-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-6 dark:bg-red-950">
                <AlertTriangle className="h-16 w-16 text-red-600" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2 text-center">
              <p className="text-lg font-medium text-[var(--text)]">
                {message || defaultMessage}
              </p>
              <p className="text-sm text-[var(--muted)]">
                Please contact your organization administrator if you believe this is an error.
              </p>
            </div>

            {/* Role Details */}
            {requiredRole && currentRole && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-[var(--muted)]">Required Role:</p>
                    <p className="font-semibold capitalize text-[var(--text)]">{requiredRole}</p>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--muted)]">Your Role:</p>
                    <p className="font-semibold capitalize text-[var(--text)]">{currentRole}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              {showBackButton && (
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="default"
                className="flex items-center gap-2"
              >
                <Link href="/settings/team">
                  View Team Settings
                </Link>
              </Button>
            </div>

            {/* Contact Admin */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-50 p-4 dark:bg-blue-950/30">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Need access?</strong> Contact your organization administrator to request permission elevation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
