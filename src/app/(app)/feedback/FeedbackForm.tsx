"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackFormProps {
  userId: string;
  userEmail?: string;
}

export default function FeedbackForm({ userId, userEmail }: FeedbackFormProps) {
  const [category, setCategory] = useState<string>("");
  const [task, setTask] = useState("");
  const [issue, setIssue] = useState("");
  const [confusion, setConfusion] = useState("");
  const [email, setEmail] = useState(userEmail || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !task || !issue) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          category,
          task,
          issue,
          confusion,
          email,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast.success("Thank you! Your feedback has been submitted.");

      // Reset form
      setCategory("");
      setTask("");
      setIssue("");
      setConfusion("");
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          What type of feedback is this? <span className="text-red-500">*</span>
        </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bug">🐛 Bug / Something broke</SelectItem>
            <SelectItem value="confusion">❓ Confusion / Unclear</SelectItem>
            <SelectItem value="feature">💡 Feature Request</SelectItem>
            <SelectItem value="positive">✨ Positive Feedback</SelectItem>
            <SelectItem value="performance">⚡ Performance Issue</SelectItem>
            <SelectItem value="other">📝 Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* What were you trying to do */}
      <div className="space-y-2">
        <Label htmlFor="task">
          What were you trying to do? <span className="text-red-500">*</span>
        </Label>
        <Input
          id="task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g., Generate a weather report for a claim"
          required
        />
        <p className="text-xs text-muted-foreground">
          Describe the action or goal you were working on
        </p>
      </div>

      {/* What went wrong or what happened */}
      <div className="space-y-2">
        <Label htmlFor="issue">
          What happened? <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="issue"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          placeholder="Describe what happened, what you expected, or what confused you..."
          rows={5}
          required
        />
        <p className="text-xs text-muted-foreground">
          The more specific you are, the faster we can fix it
        </p>
      </div>

      {/* What confused you (optional) */}
      <div className="space-y-2">
        <Label htmlFor="confusion">What was confusing or unclear? (Optional)</Label>
        <Textarea
          id="confusion"
          value={confusion}
          onChange={(e) => setConfusion(e.target.value)}
          placeholder="e.g., I didn't know where to find X, the button label didn't make sense..."
          rows={3}
        />
      </div>

      {/* Email (optional) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email (if you want a response)</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
        />
      </div>

      {/* Submit */}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
}
