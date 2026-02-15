/**
 * Dominus Insight Card Component
 * 
 * Reusable card for displaying AI insights with icons, severity indicators,
 * and confidence scores.
 * 
 * Phase 25.5 - Dominus AI UI Components
 */

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DominusInsightCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
  severity?: number; // 0-100 for urgency/priority indicators
  confidence?: number; // 0-1 for AI confidence
}

export function DominusInsightCard({
  title,
  description,
  icon: Icon,
  children,
  severity,
  confidence,
}: DominusInsightCardProps) {
  const getSeverityColor = (score: number) => {
    if (score >= 80) return "text-red-600 dark:text-red-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <Icon className={`h-5 w-5 ${severity !== undefined ? getSeverityColor(severity) : "text-purple-600 dark:text-purple-400"}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          {confidence !== undefined && (
            <Badge variant="outline" className="ml-2">
              {Math.round(confidence * 100)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
