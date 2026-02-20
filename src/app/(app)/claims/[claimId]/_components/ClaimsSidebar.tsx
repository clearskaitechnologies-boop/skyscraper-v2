// src/app/(app)/claims/[claimId]/_components/ClaimsSidebar.tsx
"use client";

import {
  Calendar,
  Camera,
  Cloud,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClaimsSidebarProps {
  claimId: string;
  claim: {
    insured_name?: string | null;
    homeowner_email?: string | null;
    carrier?: string | null;
    policy_number?: string | null;
    adjusterName?: string | null;
    adjusterPhone?: string | null;
    adjusterEmail?: string | null;
    propertyAddress?: string | null;
    estimatedValue?: number | null;
    approvedValue?: number | null;
    dateOfLoss?: string | null;
    dateOfInspection?: string | null;
  };
}

export function ClaimsSidebar({ claimId, claim }: ClaimsSidebarProps) {
  const formatCurrency = (val: number | null | undefined) =>
    val
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val / 100)
      : "TBD";

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Claim Value Card */}
      <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg dark:from-emerald-950/30 dark:to-teal-950/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Claim Value
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(claim.estimatedValue)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Approved</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(claim.approvedValue)}
            </span>
          </div>
          <Link href={`/claims/${claimId}/financial`}>
            <Button variant="outline" size="sm" className="mt-2 w-full">
              View Financials
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Key Dates Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 pb-3 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-amber-600" />
            Key Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Date of Loss</span>
            <span className="text-sm font-medium">{formatDate(claim.dateOfLoss)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Inspection</span>
            <span className="text-sm font-medium">{formatDate(claim.dateOfInspection)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Adjuster Contact Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-blue-600" />
            Adjuster Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          {claim.adjusterName ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{claim.adjusterName}</span>
              </div>
              {claim.adjusterPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <a href={`tel:${claim.adjusterPhone}`} className="text-blue-600 hover:underline">
                    {claim.adjusterPhone}
                  </a>
                </div>
              )}
              {claim.adjusterEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <a
                    href={`mailto:${claim.adjusterEmail}`}
                    className="truncate text-blue-600 hover:underline"
                  >
                    {claim.adjusterEmail}
                  </a>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No adjuster assigned yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 pb-3 dark:from-purple-950/30 dark:to-violet-950/30">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href={`/claims/${claimId}/photos`}>
              <Camera className="mr-2 h-4 w-4" /> Manage Photos
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href={`/claims/${claimId}/documents`}>
              <FileText className="mr-2 h-4 w-4" /> Documents
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href={`/claims/${claimId}/weather`}>
              <Cloud className="mr-2 h-4 w-4" /> Weather Report
            </Link>
          </Button>
          <Button className="mt-2 w-full justify-start bg-indigo-600 hover:bg-indigo-700" asChild>
            <Link href={`/claims/${claimId}/report`}>
              <Sparkles className="mr-2 h-4 w-4" /> Generate Report
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Property Card */}
      {claim.propertyAddress && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 pb-3 dark:from-slate-950/30 dark:to-gray-950/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-slate-600" />
              Property
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm">{claim.propertyAddress}</p>
            <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
              <Link href={`/claims/${claimId}/scope`}>View Scope</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
