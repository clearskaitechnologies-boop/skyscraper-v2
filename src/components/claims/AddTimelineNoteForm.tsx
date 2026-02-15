"use client";

import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";

interface AddTimelineNoteFormProps {
  claimId: string;
}

export function AddTimelineNoteForm({ claimId }: AddTimelineNoteFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibleToClient, setVisibleToClient] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/claims/${claimId}/timeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "note",
          title: title.trim(),
          body: body.trim(),
          visibleToClient,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to add note");
      }

      // Success - clear form and show success message
      setTitle("");
      setBody("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Trigger a page refresh to show the new note
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Add Timeline Note</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title Input */}
        <div>
          <label htmlFor="note-title" className="mb-1 block text-sm font-medium text-slate-700">
            Title *
          </label>
          <input
            id="note-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Called homeowner, Submitted to adjuster..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={isSubmitting}
          />
        </div>

        {/* Body Textarea */}
        <div>
          <label htmlFor="note-body" className="mb-1 block text-sm font-medium text-slate-700">
            Details (optional)
          </label>
          <textarea
            id="note-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add any additional details..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={isSubmitting}
          />
        </div>

        {/* Visibility Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="visible-to-client"
            type="checkbox"
            checked={visibleToClient}
            onChange={(e) => setVisibleToClient(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
            disabled={isSubmitting}
          />
          <label htmlFor="visible-to-client" className="text-sm text-slate-700">
            Visible to client in portal
          </label>
        </div>

        {/* Error Message */}
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {/* Success Message */}
        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Note added successfully!
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Adding..." : "Add Note"}
        </button>
      </form>
    </div>
  );
}
