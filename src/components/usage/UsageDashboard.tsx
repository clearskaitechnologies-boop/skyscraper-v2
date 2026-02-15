// ============================================================================
// H-9: Usage Dashboard Component
// ============================================================================

"use client";

import { AlertCircle, TrendingUp, Zap } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UsageDashboardProps {
  tier: string;
  claimsUsed: number;
  claimsLimit: number;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  storageUsed: number; // in GB
  storageLimit: number; // in GB
}

export function UsageDashboard({
  tier,
  claimsUsed,
  claimsLimit,
  aiCreditsUsed,
  aiCreditsLimit,
  storageUsed,
  storageLimit,
}: UsageDashboardProps) {
  const claimsPercent = claimsLimit >= 999999 ? 0 : (claimsUsed / claimsLimit) * 100;
  const aiPercent = aiCreditsLimit >= 999999 ? 0 : (aiCreditsUsed / aiCreditsLimit) * 100;
  const storagePercent = storageLimit >= 999999 ? 0 : (storageUsed / storageLimit) * 100;

  const hasWarning = claimsPercent >= 80 || aiPercent >= 80 || storagePercent >= 80;

  return (
    <div className="space-y-6">
      {hasWarning && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're approaching your usage limits. Consider upgrading to avoid service interruption.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Claims Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Claims</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {claimsUsed} / {claimsLimit >= 999999 ? "∞" : claimsLimit}
            </div>
            <Progress
              value={claimsPercent}
              className="mt-2"
              indicatorClassName={
                claimsPercent >= 90
                  ? "bg-red-500"
                  : claimsPercent >= 80
                    ? "bg-orange-500"
                    : "bg-blue-500"
              }
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {claimsLimit >= 999999 ? "Unlimited claims" : `${Math.round(claimsPercent)}% used`}
            </p>
          </CardContent>
        </Card>

        {/* AI Credits Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aiCreditsUsed} / {aiCreditsLimit >= 999999 ? "∞" : aiCreditsLimit}
            </div>
            <Progress
              value={aiPercent}
              className="mt-2"
              indicatorClassName={
                aiPercent >= 90 ? "bg-red-500" : aiPercent >= 80 ? "bg-orange-500" : "bg-blue-500"
              }
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {aiCreditsLimit >= 999999 ? "Unlimited AI" : `${Math.round(aiPercent)}% used`}
            </p>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storageUsed.toFixed(1)} GB / {storageLimit >= 999999 ? "∞" : `${storageLimit} GB`}
            </div>
            <Progress
              value={storagePercent}
              className="mt-2"
              indicatorClassName={
                storagePercent >= 90
                  ? "bg-red-500"
                  : storagePercent >= 80
                    ? "bg-orange-500"
                    : "bg-blue-500"
              }
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {storageLimit >= 999999 ? "Unlimited storage" : `${Math.round(storagePercent)}% used`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
