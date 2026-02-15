"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error & { digest?: string };
  errorId: string;
  pathname?: string;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = {
      hasError: false,
      errorId: Math.random().toString(36).substr(2, 9),
      pathname: typeof window !== "undefined" ? window.location.pathname : undefined,
    };
  }

  static getDerivedStateFromError(error: Error & { digest?: string }): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9),
      pathname: typeof window !== "undefined" ? window.location.pathname : undefined,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Send error to monitoring service if available
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: { react: errorInfo },
      });
    }
  }

  handleReload = () => {
    // Clear any problematic router state before reload
    if (typeof window !== "undefined") {
      // Clear session storage of any cached router state
      try {
        sessionStorage.removeItem("next-router-state");
        sessionStorage.removeItem("next-router-tree");
      } catch (e) {
        // Ignore storage errors
      }

      // Use location.replace instead of reload to avoid history issues
      window.location.replace(window.location.pathname);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
            <div className="mb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Something went wrong</h2>
            <p className="mb-4 text-sm text-gray-600">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="mb-4 space-y-1 rounded bg-gray-100 p-3 text-left text-xs">
              {this.state.pathname && (
                <div>
                  <b>Route:</b> {this.state.pathname}
                </div>
              )}
              {this.state.error?.message && (
                <div>
                  <b>Message:</b> {this.state.error.message}
                </div>
              )}
              {this.state.error?.digest && (
                <div>
                  <b>Digest:</b> {this.state.error.digest}
                </div>
              )}
              <div>
                <b>Error ID:</b> {this.state.errorId}
              </div>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error?.stack && (
              <details className="mb-4 rounded bg-gray-100 p-2 text-left text-xs">
                <summary className="cursor-pointer font-medium">Stack Trace (Dev Only)</summary>
                <pre className="mt-2 overflow-auto">{this.state.error.stack}</pre>
              </details>
            )}
            <div className="space-y-2">
              <button
                onClick={this.handleReload}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Refresh Page
              </button>
              <a
                href="/"
                className="block w-full rounded bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
              >
                Go Home
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-500">Error ID: {this.state.errorId}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
