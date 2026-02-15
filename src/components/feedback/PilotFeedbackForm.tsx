"use client";

/**
 * PilotFeedbackForm
 *
 * Collects feedback from pilot users with category selection,
 * rating, and message.
 */

import {
  AlertCircle,
  Bug,
  CheckCircle2,
  Lightbulb,
  Loader2,
  MessageSquare,
  Send,
  Star,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeedbackType = "bug" | "feature" | "general" | "praise";

interface FeedbackCategory {
  type: FeedbackType;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const CATEGORIES: FeedbackCategory[] = [
  {
    type: "bug",
    label: "Bug Report",
    icon: <Bug className="h-5 w-5" />,
    description: "Something isn't working as expected",
    color: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100",
  },
  {
    type: "feature",
    label: "Feature Request",
    icon: <Lightbulb className="h-5 w-5" />,
    description: "Suggest a new feature or improvement",
    color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
  {
    type: "general",
    label: "General Feedback",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Share your thoughts or questions",
    color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    type: "praise",
    label: "What's Working",
    icon: <ThumbsUp className="h-5 w-5" />,
    description: "Tell us what you love",
    color: "text-green-600 bg-green-50 border-green-200 hover:bg-green-100",
  },
];

interface PilotFeedbackFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function PilotFeedbackForm({ className, onSuccess }: PilotFeedbackFormProps) {
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!selectedType || message.trim().length < 10) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch("/api/pilot/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          message: message.trim(),
          rating,
          page: window.location.pathname,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setSubmitResult({
        success: true,
        message: "Thank you for your feedback! We read every submission.",
      });
      setSelectedType(null);
      setMessage("");
      setRating(null);
      onSuccess?.();
    } catch (error) {
      setSubmitResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedType !== null && message.trim().length >= 10 && !isSubmitting;

  return (
    <div className={cn("rounded-lg border bg-white p-6 shadow-sm", className)}>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">Share Your Feedback</h3>
      <p className="mb-6 text-sm text-gray-500">
        As a pilot user, your feedback directly shapes our product.
      </p>

      {/* Category Selection */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => (
          <button
            key={category.type}
            onClick={() => setSelectedType(category.type)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all",
              selectedType === category.type
                ? category.color.replace("hover:", "") + " ring-2 ring-offset-2"
                : "border-gray-200 hover:border-gray-300",
              selectedType === category.type && category.type === "bug" && "ring-red-500",
              selectedType === category.type && category.type === "feature" && "ring-amber-500",
              selectedType === category.type && category.type === "general" && "ring-blue-500",
              selectedType === category.type && category.type === "praise" && "ring-green-500"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                selectedType === category.type
                  ? category.color.split(" ")[1]
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {category.icon}
            </div>
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Rating (optional) */}
      {selectedType && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            How would you rate your experience? (optional)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(rating === star ? null : star)}
                className="p-1"
                title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    rating && rating >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-400"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      <div className="mb-6">
        <label htmlFor="feedback-message" className="mb-2 block text-sm font-medium text-gray-700">
          Your Feedback
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            selectedType === "bug"
              ? "Describe the issue you encountered..."
              : selectedType === "feature"
                ? "Describe the feature you'd like to see..."
                : selectedType === "praise"
                  ? "Tell us what you love..."
                  : "Share your thoughts..."
          }
          className="h-32 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-400">{message.trim().length}/10 minimum characters</p>
      </div>

      {/* Submit Result */}
      {submitResult && (
        <div
          className={cn(
            "mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm",
            submitResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          )}
        >
          {submitResult.success ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          {submitResult.message}
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        variant={canSubmit ? "default" : "secondary"}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Feedback
          </>
        )}
      </Button>
    </div>
  );
}

/**
 * Inline feedback prompt for contextual feedback collection
 */
interface InlineFeedbackPromptProps {
  context: string;
  className?: string;
}

export function InlineFeedbackPrompt({ context, className }: InlineFeedbackPromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (dismissed || submitted) return null;

  const handleQuickRating = async (stars: number) => {
    setRating(stars);
    try {
      await fetch("/api/pilot/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: stars >= 4 ? "praise" : "general",
          message: `Quick rating: ${stars}/5 for ${context}`,
          rating: stars,
          page: window.location.pathname,
          category: "quick_rating",
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Quick rating failed:", error);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3",
        className
      )}
    >
      <p className="text-sm text-indigo-700">How helpful was this? Your feedback matters.</p>
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleQuickRating(star)}
              className="p-0.5"
              title={`Rate ${star} star${star > 1 ? "s" : ""}`}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "h-5 w-5 transition-colors",
                  rating && rating >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-indigo-300 hover:text-yellow-400"
                )}
              />
            </button>
          ))}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-sm text-indigo-500 hover:text-indigo-700"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
