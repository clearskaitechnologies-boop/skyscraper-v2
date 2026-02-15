"use client";

import { AlertCircle,AlertTriangle, CheckCircle } from "lucide-react";
import { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DominusInsightCardProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  children?: ReactNode;
  severity?: "low" | "medium" | "high";
  confidence?: number;
}

export function DominusInsightCard({
  title,
  icon,
  description,
  children,
  severity,
  confidence,
}: DominusInsightCardProps) {
  const getSeverityConfig = () => {
    switch (severity) {
      case "high":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-900",
        };
      case "medium":
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-900",
        };
      case "low":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-900",
        };
      default:
        return {
          icon: null,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-900",
        };
    }
  };

  const severityConfig = getSeverityConfig();

  return (
    <Card className={`${severityConfig.bgColor} ${severityConfig.borderColor} border`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {icon || severityConfig.icon}
            <div>
              <CardTitle className={`text-lg ${severityConfig.textColor}`}>{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
          </div>
          {confidence !== undefined && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Confidence:</span>
              <span className="font-semibold text-purple-600">{confidence}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
