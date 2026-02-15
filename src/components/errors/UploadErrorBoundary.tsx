/**
 * React Error Boundary for Upload Components
 *
 * Catches upload failures and displays user-friendly error messages.
 * Prevents silent failures and full app crashes.
 */

"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional fallback UI */
  fallback?: ReactNode;
  /** Optional callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorMessage: string;
}

export class UploadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Translate technical errors to user-friendly messages
    let errorMessage = "Failed to upload file. Please try again.";

    if (error.message.includes("Unauthorized") || error.message.includes("401")) {
      errorMessage = "Session expired. Please refresh the page and try again.";
    } else if (error.message.includes("Rate limit") || error.message.includes("429")) {
      errorMessage = "Too many uploads. Please wait a moment and try again.";
    } else if (error.message.includes("File too large")) {
      errorMessage = error.message; // Keep original message
    } else if (error.message.includes("File type not allowed")) {
      errorMessage = error.message; // Keep original message
    } else if (error.message.includes("Network") || error.message.includes("fetch failed")) {
      errorMessage = "Network error. Please check your connection and try again.";
    } else if (error.message.includes("Storage upload failed")) {
      errorMessage = "Failed to upload to storage. Please try again.";
    } else if (error.message.includes("Claim not found")) {
      errorMessage = "Claim not found. Please refresh the page.";
    } else if (error.message.includes("Organization mismatch")) {
      errorMessage = "Permission denied. This file cannot be uploaded to this claim.";
    }

    return {
      hasError: true,
      error,
      errorMessage,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error("[UploadErrorBoundary] Error caught:", error);
    console.error("[UploadErrorBoundary] Error info:", errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to error tracking service
    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      // Sentry integration (if available)
      if ((window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
            upload: {
              boundary: "UploadErrorBoundary",
            },
          },
          tags: {
            errorBoundary: "upload",
          },
        });
      }
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorMessage: "",
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-red-500">Upload Failed</h3>
              <p className="mb-4 text-white/90">{this.state.errorMessage}</p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 text-sm text-white/60">
                  <summary className="cursor-pointer hover:text-white/80">
                    Technical Details (dev only)
                  </summary>
                  <pre className="mt-2 overflow-auto rounded-lg bg-black/20 p-3 text-xs">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <button
                onClick={this.resetError}
                className="mt-4 rounded-xl bg-red-500 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// HOOK FOR FUNCTIONAL COMPONENTS
// =============================================================================

/**
 * Hook to handle upload errors in functional components.
 *
 * @example
 * ```tsx
 * function UploadButton() {
 *   const { error, setError, clearError } = useUploadError();
 *
 *   async function handleUpload() {
 *     try {
 *       clearError();
 *       await uploadFile(file);
 *     } catch (err) {
 *       setError(err);
 *     }
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={handleUpload}>Upload</button>
 *       {error && <ErrorMessage error={error} />}
 *     </>
 *   );
 * }
 * ```
 */
export function useUploadError() {
  const [error, setErrorState] = React.useState<Error | null>(null);
  const [userMessage, setUserMessage] = React.useState<string>("");

  const setError = React.useCallback((err: Error | unknown) => {
    const error = err instanceof Error ? err : new Error(String(err));
    setErrorState(error);

    // Translate to user-friendly message
    let message = "Failed to upload file. Please try again.";

    if (error.message.includes("Unauthorized") || error.message.includes("401")) {
      message = "Session expired. Please refresh the page and try again.";
    } else if (error.message.includes("Rate limit") || error.message.includes("429")) {
      message = "Too many uploads. Please wait a moment and try again.";
    } else if (error.message.includes("File too large")) {
      message = error.message;
    } else if (error.message.includes("File type not allowed")) {
      message = error.message;
    } else if (error.message.includes("Network") || error.message.includes("fetch failed")) {
      message = "Network error. Please check your connection and try again.";
    } else if (error.message.includes("Storage upload failed")) {
      message = "Failed to upload to storage. Please try again.";
    }

    setUserMessage(message);

    // Log for debugging
    console.error("[useUploadError]", error);
  }, []);

  const clearError = React.useCallback(() => {
    setErrorState(null);
    setUserMessage("");
  }, []);

  return {
    error,
    userMessage,
    hasError: error !== null,
    setError,
    clearError,
  };
}

// =============================================================================
// ERROR MESSAGE COMPONENT
// =============================================================================

interface ErrorMessageProps {
  error?: Error | string | null;
  message?: string;
  onDismiss?: () => void;
}

export function UploadErrorMessage({ error, message, onDismiss }: ErrorMessageProps) {
  if (!error && !message) return null;

  const displayMessage =
    message || (typeof error === "string" ? error : error?.message) || "An error occurred";

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-white/90">{displayMessage}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-white/60 transition-colors hover:text-white/90"
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
