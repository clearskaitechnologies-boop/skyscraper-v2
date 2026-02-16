/**
 * Report Workbench — Placeholder
 *
 * This page component was migrated from a legacy React Router setup.
 * TODO: Replace with proper Next.js server component implementation.
 */

import { PageContainer } from "@/components/layout/PageContainer";
import { Construction } from "lucide-react";

export default function ReportWorkbench() {
  return (
    <PageContainer title="Report Workbench">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Construction className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Report Workbench</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          This module is being rebuilt for enterprise multi-org support. Coming soon.
        </p>
      </div>
    </PageContainer>
  );
}
