"use client";

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface GenerateReportButtonProps {
  claimId: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function GenerateReportButton({
  claimId,
  variant = "default",
  size = "default",
  className,
}: GenerateReportButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/reports/templates/pdf-builder?claimId=${claimId}`);
  };

  return (
    <Button onClick={handleClick} variant={variant} size={size} className={className}>
      <FileText className="mr-2 h-4 w-4" />
      Generate Report
    </Button>
  );
}
