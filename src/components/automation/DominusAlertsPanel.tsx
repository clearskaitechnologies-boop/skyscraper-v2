// components/automation/DominusAlertsPanel.tsx
/**
 * 🔥 INTELLIGENT ALERTS PANEL
 * Shows real-time warnings and opportunities
 */

"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Alert {
  id: string;
  alertType: string;
  title: string;
  message: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  createdAt: Date;
}

interface DominusAlertsPanelProps {
  alerts: Alert[];
  onDismiss: (alertId: string) => void;
}

export function DominusAlertsPanel({ alerts, onDismiss }: DominusAlertsPanelProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-50 border-red-300 text-red-900";
      case "HIGH":
        return "bg-orange-50 border-orange-300 text-orange-900";
      case "MEDIUM":
        return "bg-yellow-50 border-yellow-300 text-yellow-900";
      case "LOW":
        return "bg-blue-50 border-blue-300 text-blue-900";
      default:
        return "bg-gray-50 border-gray-300 text-gray-900";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "🚨";
      case "HIGH":
        return "⚠️";
      case "MEDIUM":
        return "⚡";
      case "LOW":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="font-medium text-green-800">✅ No alerts - claim is healthy</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-lg border p-4 ${getSeverityStyles(alert.severity)} flex items-start justify-between`}
        >
          <div className="flex flex-1 items-start gap-3">
            <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
            <div className="flex-1">
              <h4 className="font-semibold">{alert.title}</h4>
              <p className="mt-1 text-sm">{alert.message}</p>
              <p className="mt-2 text-xs opacity-70">
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(alert.id)}
            className="ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
