"use client";

import { AlertTriangle } from "lucide-react";
import { Component, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary for AI Widgets
 * Prevents widget crashes from breaking the entire page
 */
export class AIWidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`[AIWidgetErrorBoundary] ${this.props.componentName || "AI Widget"} crashed:`, {
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" />
            <div className="text-sm">
              <p className="font-medium text-destructive">
                {this.props.componentName || "AI Widget"} Unavailable
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This feature is temporarily unavailable. Other features continue to work normally.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
