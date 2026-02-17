"use client";

import { useUser } from "@clerk/nextjs";
import { Bug, CheckCircle, Loader2, X } from "lucide-react";
import { useCallback, useState } from "react";

/**
 * ReportIssueButton — Floating "Report Issue" button (bottom-right)
 *
 * Auto-captures: userId, current URL, browser info, timestamp.
 * Submits to /api/feedback endpoint.
 * Shows on all (app) pages via the layout.
 */
export function ReportIssueButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("bug");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const { user } = useUser();

  const handleSubmit = useCallback(async () => {
    if (!description.trim()) return;
    setStatus("sending");

    try {
      const payload = {
        type: category,
        message: description.trim(),
        metadata: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          timestamp: new Date().toISOString(),
          userId: user?.id || "anonymous",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
      };

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setStatus("sent");
      setDescription("");
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
      }, 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [description, category, user]);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-teal-700 hover:shadow-xl active:scale-95"
        title="Report an issue"
      >
        <Bug className="h-4 w-4" />
        <span className="hidden sm:inline">Report Issue</span>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 sm:items-center sm:justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (status !== "sending") {
                setIsOpen(false);
                setStatus("idle");
              }
            }}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Report an Issue
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setStatus("idle");
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {status === "sent" ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Thanks! We&apos;ve received your report and will investigate.
                </p>
              </div>
            ) : (
              <>
                {/* Category */}
                <div className="mb-3">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="bug">🐛 Bug Report</option>
                    <option value="feature">💡 Feature Request</option>
                    <option value="ui">🎨 UI/UX Issue</option>
                    <option value="performance">⚡ Performance Issue</option>
                    <option value="access">🔒 Access / Permissions</option>
                    <option value="other">📝 Other</option>
                  </select>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What happened?
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue... What did you expect to happen? What happened instead?"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                    autoFocus
                  />
                </div>

                {/* Context info */}
                <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <p>
                    We&apos;ll automatically include your current page, browser info, and account
                    context to help us investigate faster.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setStatus("idle");
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!description.trim() || status === "sending"}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </button>
                </div>

                {status === "error" && (
                  <p className="mt-2 text-center text-sm text-red-500">
                    Failed to submit. Please try again.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
